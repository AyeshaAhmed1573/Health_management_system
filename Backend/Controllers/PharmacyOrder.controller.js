import {
  getPharmacyOrders,
  getPharmacyOrderById,
  updateOrderStatus,
  verifyPrescription,
  getOrderStatistics,
} from '../Services/pharmacyOrderService.js';

// Get pharmacy orders
export async function getPharmacyOrdersController(req, res) {
  try {
    const { orderStatus, paymentStatus, status, search, page = 1, limit = 20 } = req.query;

    const result = await getPharmacyOrders(
      req.user.vendorId,
      { orderStatus, paymentStatus, status, search },
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get pharmacy order by ID
export async function getPharmacyOrderByIdController(req, res) {
  try {
    const { orderId } = req.params;
    const order = await getPharmacyOrderById(orderId, req.user.vendorId);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

// Update order status
export async function updateOrderStatusController(req, res) {
  try {
    const { orderId, subOrderId } = req.params;
    const { status, note } = req.body;

    const order = await updateOrderStatus(
      orderId,
      subOrderId,
      req.user.vendorId,
      status,
      req.user.id,
      note
    );

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Verify prescription
export async function verifyPrescriptionController(req, res) {
  try {
    const { orderId, subOrderId } = req.params;
    const { approved, reason } = req.body;

    const order = await verifyPrescription(
      orderId,
      subOrderId,
      req.user.vendorId,
      approved,
      req.user.id,
      reason
    );

    res.status(200).json({
      success: true,
      data: order,
      message: approved ? 'Prescription verified successfully' : 'Prescription rejected',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get order statistics
export async function getOrderStatisticsController(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const statistics = await getOrderStatistics(req.user.vendorId, startDate, endDate);

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
