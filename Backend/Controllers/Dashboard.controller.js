import {
  getVendorDashboard,
  getSalesChartData,
  getRecentOrders,
  getRecentReviews,
} from '../Services/dashboardService.js';

// Get vendor dashboard overview
export async function getVendorDashboardController(req, res) {
  try {
    const vendor = req.vendor;
    const dashboard = await getVendorDashboard(req.user.vendorId, vendor.type);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get sales chart data
export async function getSalesChartDataController(req, res) {
  try {
    const { period = '30d' } = req.query;
    const vendor = req.vendor;
    const data = await getSalesChartData(req.user.vendorId, vendor.type, period);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get recent orders
export async function getRecentOrdersController(req, res) {
  try {
    const { limit = 10 } = req.query;
    const vendor = req.vendor;
    const orders = await getRecentOrders(req.user.vendorId, vendor.type, parseInt(limit));

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get recent reviews
export async function getRecentReviewsController(req, res) {
  try {
    const { limit = 10 } = req.query;
    const reviews = await getRecentReviews(req.user.vendorId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
