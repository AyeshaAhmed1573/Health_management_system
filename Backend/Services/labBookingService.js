import Order from '../Models/Order.model.js';
import Slot from '../Models/Slot.model.js';
import AuditLog from '../Models/AuditLog.model.js';

// Get lab bookings for vendor
export async function getLabBookings(vendorId, filters = {}, page = 1, limit = 20) {
  const query = {
    'subOrders.vendorId': vendorId,
    'subOrders.vendorType': 'laboratory',
  };

  if (filters.bookingStatus) {
    query['subOrders.bookingStatus'] = filters.bookingStatus;
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

// Get lab booking by ID
export async function getLabBookingById(orderId, vendorId) {
  const order = await Order.findOne({
    _id: orderId,
    'subOrders.vendorId': vendorId,
    'subOrders.vendorType': 'laboratory',
  })
    .populate('userId', 'name email phone')
    .populate('profileId', 'name relationship');

  if (!order) {
    throw new Error('Booking not found');
  }

  const filteredOrder = {
    ...order.toObject(),
    subOrders: order.subOrders.filter(so => so.vendorId.toString() === vendorId),
  };

  return filteredOrder;
}

// Update booking status
export async function updateBookingStatus(orderId, subOrderId, vendorId, newStatus, updaterId, note) {
  const order = await Order.findOne({
    _id: orderId,
    'subOrders._id': subOrderId,
    'subOrders.vendorId': vendorId,
  });

  if (!order) {
    throw new Error('Booking not found');
  }

  const subOrder = order.subOrders.id(subOrderId);
  const oldStatus = subOrder.bookingStatus;

  const validTransitions = {
    booked: ['sample_collected', 'cancelled'],
    sample_collected: ['processing', 'cancelled'],
    processing: ['report_ready', 'cancelled'],
    report_ready: [],
    cancelled: [],
  };

  if (!validTransitions[oldStatus].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
  }

  subOrder.bookingStatus = newStatus;
  subOrder.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy: updaterId,
  });

  if (newStatus === 'cancelled') {
    subOrder.cancelledAt = new Date();
    subOrder.cancelledBy = updaterId;
    subOrder.cancellationReason = note;
  }

  const allSubOrdersCancelled = order.subOrders.every(so => so.bookingStatus === 'cancelled');
  const allSubOrdersCompleted = order.subOrders.every(so => so.bookingStatus === 'report_ready');

  if (allSubOrdersCancelled) {
    order.status = 'cancelled';
  } else if (allSubOrdersCompleted) {
    order.status = 'completed';
  } else {
    order.status = 'processing';
  }

  await order.save();

  await AuditLog.create({
    userId: updaterId,
    vendorId,
    action: 'booking_status_changed',
    entityType: 'Order',
    entityId: orderId,
    previousState: { bookingStatus: oldStatus },
    newState: { bookingStatus: newStatus },
    note,
  });

  return order;
}

// Upload report
export async function uploadReport(orderId, subOrderId, vendorId, reportData, uploaderId) {
  const order = await Order.findOne({
    _id: orderId,
    'subOrders._id': subOrderId,
    'subOrders.vendorId': vendorId,
  });

  if (!order) {
    throw new Error('Booking not found');
  }

  const subOrder = order.subOrders.id(subOrderId);

  subOrder.reportId = reportData.reportId;
  subOrder.reportUploadedAt = new Date();
  subOrder.reportUploadedBy = uploaderId;
  subOrder.bookingStatus = 'report_ready';
  subOrder.statusHistory.push({
    status: 'report_ready',
    timestamp: new Date(),
    note: 'Report uploaded',
    updatedBy: uploaderId,
  });

  const allSubOrdersCompleted = order.subOrders.every(so => so.bookingStatus === 'report_ready');
  if (allSubOrdersCompleted) {
    order.status = 'completed';
  }

  await order.save();

  await AuditLog.create({
    userId: uploaderId,
    vendorId,
    action: 'report_uploaded',
    entityType: 'Order',
    entityId: orderId,
    newState: { reportId: reportData.reportId },
  });

  return order;
}

// Get booking statistics
export async function getBookingStatistics(vendorId, startDate, endDate) {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const matchQuery = {
    'subOrders.vendorId': vendorId,
    'subOrders.vendorType': 'laboratory',
    ...dateFilter,
  };

  const [
    totalBookings,
    bookedCount,
    sampleCollectedCount,
    processingCount,
    reportReadyCount,
    cancelledCount,
    totalRevenue,
    totalCommission,
  ] = await Promise.all([
    Order.countDocuments(matchQuery),
    Order.countDocuments({ ...matchQuery, 'subOrders.bookingStatus': 'booked' }),
    Order.countDocuments({ ...matchQuery, 'subOrders.bookingStatus': 'sample_collected' }),
    Order.countDocuments({ ...matchQuery, 'subOrders.bookingStatus': 'processing' }),
    Order.countDocuments({ ...matchQuery, 'subOrders.bookingStatus': 'report_ready' }),
    Order.countDocuments({ ...matchQuery, 'subOrders.bookingStatus': 'cancelled' }),
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
    totalBookings,
    bookedCount,
    sampleCollectedCount,
    processingCount,
    reportReadyCount,
    cancelledCount,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalCommission: totalCommission[0]?.total || 0,
    netEarnings: (totalRevenue[0]?.total || 0) - (totalCommission[0]?.total || 0),
  };
}
