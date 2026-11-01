import Order from '../Models/Order.model.js';
import Product from '../Models/Product.model.js';
import Review from '../Models/Review.model.js';
import Vendor from '../Models/Vendor.model.js';

// Get vendor dashboard overview
export async function getVendorDashboard(vendorId, vendorType) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const matchQuery = {
    'subOrders.vendorId': vendorId,
    'subOrders.vendorType': vendorType,
  };

  const [
    totalOrders,
    todayOrders,
    monthOrders,
    weekOrders,
    pendingActions,
    totalRevenue,
    monthRevenue,
    weekRevenue,
    totalReviews,
    averageRating,
    lowStockCount,
    outOfStockCount,
  ] = await Promise.all([
    Order.countDocuments(matchQuery),
    Order.countDocuments({
      ...matchQuery,
      createdAt: { $gte: startOfToday },
    }),
    Order.countDocuments({
      ...matchQuery,
      createdAt: { $gte: startOfMonth },
    }),
    Order.countDocuments({
      ...matchQuery,
      createdAt: { $gte: startOfWeek },
    }),
    Order.countDocuments({
      ...matchQuery,
      $or: [
        { 'subOrders.orderStatus': 'placed' },
        { 'subOrders.orderStatus': 'verified' },
        { 'subOrders.bookingStatus': 'booked' },
        { 'subOrders.bookingStatus': 'sample_collected' },
      ],
    }),
    Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$subOrders' },
      { $match: { 'subOrders.vendorId': vendorId } },
      { $group: { _id: null, total: { $sum: '$subOrders.totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { ...matchQuery, createdAt: { $gte: startOfMonth } } },
      { $unwind: '$subOrders' },
      { $match: { 'subOrders.vendorId': vendorId } },
      { $group: { _id: null, total: { $sum: '$subOrders.totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { ...matchQuery, createdAt: { $gte: startOfWeek } } },
      { $unwind: '$subOrders' },
      { $match: { 'subOrders.vendorId': vendorId } },
      { $group: { _id: null, total: { $sum: '$subOrders.totalAmount' } } },
    ]),
    Review.countDocuments({ vendorId }),
    Review.aggregate([
      { $match: { vendorId } },
      { $group: { _id: null, average: { $avg: '$rating' } } },
    ]),
    Product.countDocuments({
      vendorId,
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    }),
    Product.countDocuments({
      vendorId,
      isActive: true,
      stock: 0,
    }),
  ]);

  return {
    orders: {
      total: totalOrders,
      today: todayOrders,
      thisMonth: monthOrders,
      thisWeek: weekOrders,
      pendingActions,
    },
    revenue: {
      total: totalRevenue[0]?.total || 0,
      thisMonth: monthRevenue[0]?.total || 0,
      thisWeek: weekRevenue[0]?.total || 0,
    },
    reviews: {
      total: totalReviews,
      averageRating: averageRating[0]?.average || 0,
    },
    inventory: {
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    },
  };
}

// Get sales chart data
export async function getSalesChartData(vendorId, vendorType, period = '30d') {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const matchQuery = {
    'subOrders.vendorId': vendorId,
    'subOrders.vendorType': vendorType,
    createdAt: { $gte: startDate },
  };

  const data = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: '$subOrders' },
    { $match: { 'subOrders.vendorId': vendorId } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue: { $sum: '$subOrders.totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return data;
}

// Get recent orders
export async function getRecentOrders(vendorId, vendorType, limit = 10) {
  const orders = await Order.find({
    'subOrders.vendorId': vendorId,
    'subOrders.vendorType': vendorType,
  })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);

  const filteredOrders = orders.map(order => ({
    ...order.toObject(),
    subOrders: order.subOrders.filter(so => so.vendorId.toString() === vendorId),
  }));

  return filteredOrders;
}

// Get recent reviews
export async function getRecentReviews(vendorId, limit = 10) {
  const reviews = await Review.find({ vendorId })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);

  return reviews;
}
