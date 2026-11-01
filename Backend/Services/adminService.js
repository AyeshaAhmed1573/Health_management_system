import Vendor from '../Models/Vendor.model.js';
import Order from '../Models/Order.model.js';
import Product from '../Models/Product.model.js';
import LabTest from '../Models/LabTest.model.js';
import LabPackage from '../Models/LabPackage.model.js';
import Commission from '../Models/Commission.model.js';
import Payout from '../Models/Payout.model.js';
import User from '../Models/User.model.js';

// Get platform overview statistics
export async function getPlatformOverview() {
  const [
    totalVendors,
    approvedVendors,
    pendingVendors,
    suspendedVendors,
    totalPharmacies,
    totalLaboratories,
    totalOrders,
    totalBookings,
    totalGMV,
    totalCommission,
    totalUsers,
    totalPatients,
  ] = await Promise.all([
    Vendor.countDocuments(),
    Vendor.countDocuments({ status: 'approved' }),
    Vendor.countDocuments({ status: 'pending' }),
    Vendor.countDocuments({ status: 'suspended' }),
    Vendor.countDocuments({ type: 'pharmacy' }),
    Vendor.countDocuments({ type: 'laboratory' }),
    Order.countDocuments({ 'subOrders.vendorType': 'pharmacy' }),
    Order.countDocuments({ 'subOrders.vendorType': 'laboratory' }),
    Order.aggregate([
      { $unwind: '$subOrders' },
      { $group: { _id: null, total: { $sum: '$subOrders.totalAmount' } } },
    ]),
    Order.aggregate([
      { $unwind: '$subOrders' },
      { $group: { _id: null, total: { $sum: '$subOrders.commissionAmount' } } },
    ]),
    User.countDocuments(),
    User.countDocuments({ role: 'patient' }),
  ]);

  return {
    vendors: {
      total: totalVendors,
      approved: approvedVendors,
      pending: pendingVendors,
      suspended: suspendedVendors,
      pharmacies: totalPharmacies,
      laboratories: totalLaboratories,
    },
    orders: {
      total: totalOrders,
      bookings: totalBookings,
    },
    revenue: {
      totalGMV: totalGMV[0]?.total || 0,
      totalCommission: totalCommission[0]?.total || 0,
    },
    users: {
      total: totalUsers,
      patients: totalPatients,
    },
  };
}

// Get sales chart data for platform
export async function getPlatformSalesChart(period = '30d') {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$subOrders' },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          vendorType: '$subOrders.vendorType',
        },
        revenue: { $sum: '$subOrders.totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  return data;
}

// Get vendor performance data
export async function getVendorPerformance(limit = 20) {
  const vendors = await Vendor.find({ status: 'approved' })
    .sort({ rating: -1 })
    .limit(limit);

  const vendorIds = vendors.map(v => v._id);

  const performanceData = await Order.aggregate([
    { $match: { 'subOrders.vendorId': { $in: vendorIds } } },
    { $unwind: '$subOrders' },
    {
      $group: {
        _id: '$subOrders.vendorId',
        totalRevenue: { $sum: '$subOrders.totalAmount' },
        totalOrders: { $sum: 1 },
        totalCommission: { $sum: '$subOrders.commissionAmount' },
      },
    },
  ]);

  const performanceMap = {};
  performanceData.forEach(p => {
    performanceMap[p._id.toString()] = p;
  });

  return vendors.map(vendor => ({
    ...vendor.toObject(),
    performance: performanceMap[vendor._id.toString()] || {
      totalRevenue: 0,
      totalOrders: 0,
      totalCommission: 0,
    },
  }));
}

// Commission management
export async function getCommissionSettings() {
  const settings = await Commission.find({ isActive: true }).sort({ effectiveFrom: -1 });
  return settings;
}

export async function createCommissionSetting(commissionData, creatorId) {
  const setting = await Commission.create({
    ...commissionData,
    isActive: true,
  });
  return setting;
}

export async function updateCommissionSetting(commissionId, updateData, updaterId) {
  const setting = await Commission.findByIdAndUpdate(
    commissionId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  return setting;
}

export async function deleteCommissionSetting(commissionId) {
  const setting = await Commission.findByIdAndUpdate(
    commissionId,
    { isActive: false },
    { new: true }
  );
  return setting;
}

// Payout management
export async function calculatePayouts(vendorId, periodStart, periodEnd) {
  const matchQuery = {
    'subOrders.vendorId': vendorId,
    'subOrders.payoutStatus': 'pending',
    createdAt: { $gte: new Date(periodStart), $lte: new Date(periodEnd) },
  };

  const vendor = await Vendor.findById(vendorId);

  const [
    orders,
    totalRevenue,
    totalCommission,
  ] = await Promise.all([
    Order.find(matchQuery).countDocuments(),
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

  const netEarnings = (totalRevenue[0]?.total || 0) - (totalCommission[0]?.total || 0);

  return {
    vendorId,
    vendorName: vendor.businessName,
    vendorType: vendor.type,
    periodStart,
    periodEnd,
    totalOrders: orders,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalCommission: totalCommission[0]?.total || 0,
    netEarnings,
  };
}

export async function createPayout(payoutData, creatorId) {
  const payout = await Payout.create({
    ...payoutData,
    status: 'pending',
  });

  // Mark orders as processed
  await Order.updateMany(
    {
      'subOrders.vendorId': payoutData.vendorId,
      'subOrders.payoutStatus': 'pending',
      createdAt: { $gte: new Date(payoutData.periodStart), $lte: new Date(payoutData.periodEnd) },
    },
    { $set: { 'subOrders.$.payoutId': payout._id, 'subOrders.$.payoutStatus': 'processed' } }
  );

  return payout;
}

export async function getPayouts(filters = {}, page = 1, limit = 20) {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.vendorId) query.vendorId = filters.vendorId;
  if (filters.vendorType) query.vendorType = filters.vendorType;

  const skip = (page - 1) * limit;

  const [payouts, total] = await Promise.all([
    Payout.find(query)
      .populate('vendorId', 'businessName type')
      .sort({ periodEnd: -1 })
      .skip(skip)
      .limit(limit),
    Payout.countDocuments(query),
  ]);

  return {
    payouts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function updatePayoutStatus(payoutId, newStatus, updaterId, paymentDetails) {
  const payout = await Payout.findByIdAndUpdate(
    payoutId,
    {
      status: newStatus,
      ...(newStatus === 'processing' && { processedAt: new Date(), processedBy: updaterId }),
      ...(newStatus === 'paid' && { paidAt: new Date(), ...paymentDetails }),
      ...(newStatus === 'failed' && { failureReason: paymentDetails?.failureReason }),
    },
    { new: true }
  );

  if (!payout) {
    throw new Error('Payout not found');
  }

  // Update order payout status
  if (newStatus === 'paid') {
    await Order.updateMany(
      { 'subOrders.payoutId': payoutId },
      { $set: { 'subOrders.$.payoutStatus': 'paid' } }
    );
  }

  return payout;
}

// Global catalog moderation
export async function flagProduct(productId, reason, adminId) {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isActive: false },
    { new: true }
  );
  return product;
}

export async function flagLabTest(testId, reason, adminId) {
  const test = await LabTest.findByIdAndUpdate(
    testId,
    { isActive: false },
    { new: true }
  );
  return test;
}

export async function flagLabPackage(packageId, reason, adminId) {
  const pkg = await LabPackage.findByIdAndUpdate(
    packageId,
    { isActive: false },
    { new: true }
  );
  return pkg;
}

// Get all users with filters
export async function getAllUsers(filters = {}, page = 1, limit = 20) {
  const query = {};

  if (filters.role) query.role = filters.role;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-passwordHash -otpSecret -otpExpiry -resetPasswordToken -resetPasswordExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
