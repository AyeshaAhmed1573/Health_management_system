import {
  createLabTest,
  getLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest,
  createLabPackage,
  getLabPackages,
  getLabPackageById,
  updateLabPackage,
  deleteLabPackage,
  getTestCategories,
} from '../Services/labTestService.js';

// Lab Test Controllers
export async function createLabTestController(req, res) {
  try {
    const test = await createLabTest(req.user.vendorId, req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: test,
      message: 'Lab test created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getLabTestsController(req, res) {
  try {
    const { category, isActive, homeCollectionAvailable, search, page = 1, limit = 20 } = req.query;

    const result = await getLabTests(
      req.user.vendorId,
      { category, isActive, homeCollectionAvailable, search },
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

export async function getLabTestByIdController(req, res) {
  try {
    const { testId } = req.params;
    const test = await getLabTestById(testId, req.user.vendorId);

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

export async function updateLabTestController(req, res) {
  try {
    const { testId } = req.params;
    const test = await updateLabTest(testId, req.user.vendorId, req.body, req.user.id);

    res.status(200).json({
      success: true,
      data: test,
      message: 'Lab test updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function deleteLabTestController(req, res) {
  try {
    const { testId } = req.params;
    const test = await deleteLabTest(testId, req.user.vendorId, req.user.id);

    res.status(200).json({
      success: true,
      data: test,
      message: 'Lab test deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Lab Package Controllers
export async function createLabPackageController(req, res) {
  try {
    const pkg = await createLabPackage(req.user.vendorId, req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: pkg,
      message: 'Lab package created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getLabPackagesController(req, res) {
  try {
    const { isActive, search, page = 1, limit = 20 } = req.query;

    const result = await getLabPackages(
      req.user.vendorId,
      { isActive, search },
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

export async function getLabPackageByIdController(req, res) {
  try {
    const { packageId } = req.params;
    const pkg = await getLabPackageById(packageId, req.user.vendorId);

    res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

export async function updateLabPackageController(req, res) {
  try {
    const { packageId } = req.params;
    const pkg = await updateLabPackage(packageId, req.user.vendorId, req.body, req.user.id);

    res.status(200).json({
      success: true,
      data: pkg,
      message: 'Lab package updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function deleteLabPackageController(req, res) {
  try {
    const { packageId } = req.params;
    const pkg = await deleteLabPackage(packageId, req.user.vendorId, req.user.id);

    res.status(200).json({
      success: true,
      data: pkg,
      message: 'Lab package deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getTestCategoriesController(req, res) {
  try {
    const categories = await getTestCategories(req.user.vendorId);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
