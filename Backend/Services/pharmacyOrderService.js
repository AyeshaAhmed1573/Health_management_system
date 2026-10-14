import Order from '../Models/Order.model.js';
import Product from '../Models/Product.model.js';
import AuditLog from '../Models/AuditLog.model.js';
import Prescription from '../Models/Prescription.model.js';

// Get pharmacy orders for vendor
export async function getPharmacyOrders(vendorId, filters = {}, page = 1, limit = 20) {
  const query = {
    'subOrders.vendorId': vendorId,
    'subOrders.vendorType': 'pharmacy',
  };

  if (filters.orderStatus) {
    query['subOrders.orderStatus'] = filters.orderStatus;
  }
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.search) {
    query.orderNumber = { $regex: filters.search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('userId', 'name email phone')
      .populate('profileId', 'name relationship')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  // Filter sub-orders to only include this vendor's sub-orders
  const filteredOrders = orders.map(order => ({
    ...order.toObject(),
    subOrders: order.subOrders.filter(so => so.vendorId.toString() === vendorId),
  }));

  return {
    orders: filteredOrders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Get pharmacy order by ID
export async function getPharmacyOrderById(orderId, vendorId) {
  const order = await Order.findOne({
    _id: orderId,
    'subOrders.vendorId': vendorId,
    'subOrders.vendorType': 'pharmacy',
  })
    .populate('userId', 'name email phone')
    .populate('profileId', 'name relationship');

  if (!order) {
    throw new Error('Order not found');
  }

  // Filter to only this vendor's sub-order
  const filteredOrder = {
    ...order.toObject(),
    subOrders: order.subOrders.filter(so => so.vendorId.toString() === vendorId),
  };

  return filteredOrder;
}

// Update order status
export async function updateOrderStatus(orderId, subOrderId, vendorId, newStatus, updaterId, note) {
  const order = await Order.findOne({
    _id: orderId,
    'subOrders._id': subOrderId,
    'subOrders.vendorId': vendorId,
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const subOrder = order.subOrders.id(subOrderId);
  const oldStatus = subOrder.orderStatus;

  // Validate status transitions
  const validTransitions = {
    placed: ['verified', 'cancelled'],
    verified: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[oldStatus].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
  }

  // Update sub-order status
  subOrder.orderStatus = newStatus;
  subOrder.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy: updaterId,
  });

  // Update delivery timestamps
  if (newStatus === 'delivered') {
    subOrder.deliveredAt = new Date();
  }
  if (newStatus === 'cancelled') {
    subOrder.cancelledAt = new Date();
    subOrder.cancelledBy = updaterId;
    subOrder.cancellationReason = note;
  }

  // Update parent order status based on all sub-orders
  const allSubOrdersCancelled = order.subOrders.every(so => so.orderStatus === 'cancelled');
  const allSubOrdersDelivered = order.subOrders.every(so => so.orderStatus === 'delivered');

  if (allSubOrdersCancelled) {
    order.status = 'cancelled';
  } else if (allSubOrdersDelivered) {
    order.status = 'completed';
  } else {
    order.status = 'processing';
  }

  await order.save();

  // Log audit
  await AuditLog.create({
    userId: updaterId,
    vendorId,
    action: 'order_status_changed',
    entityType: 'Order',
    entityId: orderId,
    previousState: { orderStatus: oldStatus },
    newState: { orderStatus: newStatus },
    note,
  });

  return order;
}

// Verify prescription
export async function verifyPrescription(orderId, subOrderId, vendorId, approved, verifierId, reason) {
  const order = await Order.findOne({
    _id: orderId,
    'subOrders._id': subOrderId,
    'subOrders.vendorId': vendorId,
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const subOrder = order.subOrders.id(subOrderId);

  // Update prescription verification for all items requiring prescription
  subOrder.items.forEach(item => {
    if (item.prescriptionRequired) {
      item.prescriptionVerified = approved;
      item.prescriptionVerifiedAt = new Date();
      item.prescriptionVerifiedBy = verifierId;
      if (!approved) {
        item.prescriptionRejectionReason = reason;
      }
    }
  });

  if (approved) {
    subOrder.orderStatus = 'verified';
    subOrder.statusHistory.push({
      status: 'verified',
      timestamp: new Date(),
      note: 'Prescription verified',
      updatedBy: verifierId,
    });
  } else {
    subOrder.orderStatus = 'cancelled';
    subOrder.cancelledAt = new Date();
    subOrder.cancelledBy = verifierId;
    subOrder.cancellationReason = reason;
    subOrder.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Prescription rejected: ${reason}`,
      updatedBy: verifierId,
    });
  }

  await order.save();

  // Log audit
  await AuditLog.create({
    userId: verifierId,
    vendorId,
    action: approved ? 'prescription_verified' : 'prescription_rejected',
    entityType: 'Order',
    entityId: orderId,
    newState: { prescriptionVerified: approved },
    reason,
  });

  return order;
}

// Get order statistics for vendor
export async function getOrderStatistics(vendorId, startDate, endDate) {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const matchQuery = {
    'subOrders.vendorId': vendorId,
    'subOrders.vendorType': 'pharmacy',
    ...dateFilter,
  };

  const [
    totalOrders,
    pendingOrders,
    verifiedOrders,
    packedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    totalCommission,
  ] = await Promise.all([
    Order.countDocuments(matchQuery),
    Order.countDocuments({ ...matchQuery, 'subOrders.orderStatus': 'placed' }),
    Order.countDocuments({ ...matchQuery, 'subOrders.orderStatus': 'verified' }),
    Order.countDocuments({ ...matchQuery, 'subOrders.orderStatus': 'packed' }),
    Order.countDocuments({ ...matchQuery, 'subOrders.orderStatus': 'shipped' }),
    Order.countDocuments({ ...matchQuery, 'subOrders.orderStatus': 'delivered' }),
    Order.countDocuments({ ...matchQuery, 'subOrders.orderStatus': 'cancelled' }),
    Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$subOrders' },
      { $match: { 'subOrders.vendorId': vendorId } },
      { $group: { _id: null, total: { $sum: '$subOrders.totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$subOrders' },
      { $match: { 'subOrders.vendorId': vendorId } },
      { $group: { _id: null, total: { $sum: '$subOrders.commissionAmount' } } },
    ]),
  ]);

  return {
    totalOrders,
    pendingOrders,
    verifiedOrders,
    packedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalCommission: totalCommission[0]?.total || 0,
    netEarnings: (totalRevenue[0]?.total || 0) - (totalCommission[0]?.total || 0),
  };
}
