import LabTest from '../Models/LabTest.model.js';
import LabPackage from '../Models/LabPackage.model.js';
import AuditLog from '../Models/AuditLog.model.js';

// Create lab test
export async function createLabTest(vendorId, testData, creatorId) {
  const test = await LabTest.create({
    ...testData,
    vendorId,
  });

  // Log audit
  await AuditLog.create({
    userId: creatorId,
    vendorId,
    action: 'test_created',
    entityType: 'LabTest',
    entityId: test._id,
    newState: testData,
  });

  return test;
}

// Get lab tests for vendor
export async function getLabTests(vendorId, filters = {}, page = 1, limit = 20) {
  const query = { vendorId };

  if (filters.category) query.category = filters.category;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.homeCollectionAvailable !== undefined) query.homeCollectionAvailable = filters.homeCollectionAvailable;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [tests, total] = await Promise.all([
    LabTest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    LabTest.countDocuments(query),
  ]);

  return {
    tests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Get lab test by ID
export async function getLabTestById(testId, vendorId) {
  const test = await LabTest.findOne({ _id: testId, vendorId });
  if (!test) {
    throw new Error('Lab test not found');
  }
  return test;
}

// Update lab test
export async function updateLabTest(testId, vendorId, updateData, updaterId) {
  const test = await LabTest.findOneAndUpdate(
    { _id: testId, vendorId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!test) {
    throw new Error('Lab test not found');
  }

  // Log audit
  await AuditLog.create({
    userId: updaterId,
    vendorId,
    action: 'test_updated',
    entityType: 'LabTest',
    entityId: testId,
    changes: updateData,
  });

  return test;
}

// Delete lab test (soft delete)
export async function deleteLabTest(testId, vendorId, deleterId) {
  const test = await LabTest.findOneAndUpdate(
    { _id: testId, vendorId },
    { isActive: false },
    { new: true }
  );

  if (!test) {
    throw new Error('Lab test not found');
  }

  // Log audit
  await AuditLog.create({
    userId: deleterId,
    vendorId,
    action: 'test_deleted',
    entityType: 'LabTest',
    entityId: testId,
    previousState: { isActive: true },
    newState: { isActive: false },
  });

  return test;
}

// Create lab package
export async function createLabPackage(vendorId, packageData, creatorId) {
  const pkg = await LabPackage.create({
    ...packageData,
    vendorId,
  });

  // Log audit
  await AuditLog.create({
    userId: creatorId,
    vendorId,
    action: 'package_created',
    entityType: 'LabPackage',
    entityId: pkg._id,
    newState: packageData,
  });

  return pkg;
}

// Get lab packages for vendor
export async function getLabPackages(vendorId, filters = {}, page = 1, limit = 20) {
  const query = { vendorId };

  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [packages, total] = await Promise.all([
    LabPackage.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    LabPackage.countDocuments(query),
  ]);

  return {
    packages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Get lab package by ID
export async function getLabPackageById(packageId, vendorId) {
  const pkg = await LabPackage.findOne({ _id: packageId, vendorId }).populate('tests.testId');
  if (!pkg) {
    throw new Error('Lab package not found');
  }
  return pkg;
}

// Update lab package
export async function updateLabPackage(packageId, vendorId, updateData, updaterId) {
  const pkg = await LabPackage.findOneAndUpdate(
    { _id: packageId, vendorId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!pkg) {
    throw new Error('Lab package not found');
  }

  // Log audit
  await AuditLog.create({
    userId: updaterId,
    vendorId,
    action: 'package_updated',
    entityType: 'LabPackage',
    entityId: packageId,
    changes: updateData,
  });

  return pkg;
}

// Delete lab package (soft delete)
export async function deleteLabPackage(packageId, vendorId, deleterId) {
  const pkg = await LabPackage.findOneAndUpdate(
    { _id: packageId, vendorId },
    { isActive: false },
    { new: true }
  );

  if (!pkg) {
    throw new Error('Lab package not found');
  }

  // Log audit
  await AuditLog.create({
    userId: deleterId,
    vendorId,
    action: 'package_deleted',
    entityType: 'LabPackage',
    entityId: packageId,
    previousState: { isActive: true },
    newState: { isActive: false },
  });

  return pkg;
}

// Get test categories
export async function getTestCategories(vendorId) {
  const categories = await LabTest.distinct('category', { vendorId, isActive: true });
  return categories;
}
