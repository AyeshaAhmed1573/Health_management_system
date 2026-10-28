import {
  getPlatformOverview,
  getPlatformSalesChart,
  getVendorPerformance,
  getCommissionSettings,
  createCommissionSetting,
  updateCommissionSetting,
  deleteCommissionSetting,
  calculatePayouts,
  createPayout,
  getPayouts,
  updatePayoutStatus,
  flagProduct,
  flagLabTest,
  flagLabPackage,
  getAllUsers,
} from '../Services/adminService.js';

// Platform overview
export async function getPlatformOverviewController(req, res) {
  try {
    const overview = await getPlatformOverview();

    res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getPlatformSalesChartController(req, res) {
  try {
    const { period = '30d' } = req.query;
    const data = await getPlatformSalesChart(period);

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

export async function getVendorPerformanceController(req, res) {
  try {
    const { limit = 20 } = req.query;
    const performance = await getVendorPerformance(parseInt(limit));

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Commission management
export async function getCommissionSettingsController(req, res) {
  try {
    const settings = await getCommissionSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function createCommissionSettingController(req, res) {
  try {
    const setting = await createCommissionSetting(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: setting,
      message: 'Commission setting created',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function updateCommissionSettingController(req, res) {
  try {
    const { commissionId } = req.params;
    const setting = await updateCommissionSetting(commissionId, req.body, req.user.id);

    res.status(200).json({
      success: true,
      data: setting,
      message: 'Commission setting updated',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function deleteCommissionSettingController(req, res) {
  try {
    const { commissionId } = req.params;
    const setting = await deleteCommissionSetting(commissionId);

    res.status(200).json({
      success: true,
      data: setting,
      message: 'Commission setting deleted',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Payout management
export async function calculatePayoutsController(req, res) {
  try {
    const { vendorId, periodStart, periodEnd } = req.query;
    const calculation = await calculatePayouts(vendorId, periodStart, periodEnd);

    res.status(200).json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function createPayoutController(req, res) {
  try {
    const payout = await createPayout(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: payout,
      message: 'Payout created',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getPayoutsController(req, res) {
  try {
    const { status, vendorId, vendorType, page = 1, limit = 20 } = req.query;

    const result = await getPayouts(
      { status, vendorId, vendorType },
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

export async function updatePayoutStatusController(req, res) {
  try {
    const { payoutId } = req.params;
    const { status, ...paymentDetails } = req.body;

    const payout = await updatePayoutStatus(payoutId, status, req.user.id, paymentDetails);

    res.status(200).json({
      success: true,
      data: payout,
      message: 'Payout status updated',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Catalog moderation
export async function flagProductController(req, res) {
  try {
    const { productId } = req.params;
    const { reason } = req.body;

    const product = await flagProduct(productId, reason, req.user.id);

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product flagged and deactivated',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function flagLabTestController(req, res) {
  try {
    const { testId } = req.params;
    const { reason } = req.body;

    const test = await flagLabTest(testId, reason, req.user.id);

    res.status(200).json({
      success: true,
      data: test,
      message: 'Lab test flagged and deactivated',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function flagLabPackageController(req, res) {
  try {
    const { packageId } = req.params;
    const { reason } = req.body;

    const pkg = await flagLabPackage(packageId, reason, req.user.id);

    res.status(200).json({
      success: true,
      data: pkg,
      message: 'Lab package flagged and deactivated',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// User management
export async function getAllUsersController(req, res) {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const result = await getAllUsers(
      { role, search },
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
