import {
  getLabBookings,
  getLabBookingById,
  updateBookingStatus,
  uploadReport,
  getBookingStatistics,
} from '../Services/labBookingService.js';

export async function getLabBookingsController(req, res) {
  try {
    const { bookingStatus, paymentStatus, status, search, page = 1, limit = 20 } = req.query;

    const result = await getLabBookings(
      req.user.vendorId,
      { bookingStatus, paymentStatus, status, search },
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

export async function getLabBookingByIdController(req, res) {
  try {
    const { orderId } = req.params;
    const booking = await getLabBookingById(orderId, req.user.vendorId);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

export async function updateBookingStatusController(req, res) {
  try {
    const { orderId, subOrderId } = req.params;
    const { status, note } = req.body;

    const order = await updateBookingStatus(
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
      message: 'Booking status updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function uploadReportController(req, res) {
  try {
    const { orderId, subOrderId } = req.params;
    const { reportId } = req.body;

    const order = await uploadReport(
      orderId,
      subOrderId,
      req.user.vendorId,
      { reportId },
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: order,
      message: 'Report uploaded successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getBookingStatisticsController(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const statistics = await getBookingStatistics(req.user.vendorId, startDate, endDate);

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
