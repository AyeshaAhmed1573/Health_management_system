import Product from '../Models/Product.model.js';
import { createAuditLog } from './auditLogService.js';

// Create product
export async function createProduct(vendorId, productData, creatorId) {
  const product = await Product.create({
    ...productData,
    vendorId,
  });

  // Log audit
  await createAuditLog({
    userId: creatorId,
    vendorId,
    action: 'product_created',
    entityType: 'Product',
    entityId: product._id,
    newState: productData,
  });

  return product;
}

// Get products for vendor with filters
export async function getVendorProducts(vendorId, filters = {}, page = 1, limit = 20) {
  const query = { vendorId };

  if (filters.category) query.category = filters.category;
  if (filters.subcategory) query.subcategory = filters.subcategory;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.prescriptionRequired !== undefined) query.requiresPrescription = filters.prescriptionRequired;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { genericName: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Get product by ID
export async function getProductById(productId, vendorId) {
  const product = await Product.findOne({ _id: productId, vendorId });
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}

// Update product
export async function updateProduct(productId, vendorId, updateData, updaterId) {
  const product = await Product.findOneAndUpdate(
    { _id: productId, vendorId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new Error('Product not found');
  }

  // Log audit
  await createAuditLog({
    userId: updaterId,
    vendorId,
    action: 'product_updated',
    entityType: 'Product',
    entityId: productId,
    changes: updateData,
  });

  return product;
}

// Delete product (soft delete - set isActive to false)
export async function deleteProduct(productId, vendorId, deleterId) {
  const product = await Product.findOneAndUpdate(
    { _id: productId, vendorId },
    { isActive: false },
    { new: true }
  );

  if (!product) {
    throw new Error('Product not found');
  }

  // Log audit
  await createAuditLog({
    userId: deleterId,
    vendorId,
    action: 'product_deleted',
    entityType: 'Product',
    entityId: productId,
    previousState: { isActive: true },
    newState: { isActive: false },
  });

  return product;
}

// Update stock (atomic operation)
export async function updateStock(productId, vendorId, quantityChange, updaterId) {
  const product = await Product.findOneAndUpdate(
    { _id: productId, vendorId, stock: { $gte: -quantityChange } },
    { $inc: { stock: quantityChange } },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new Error('Insufficient stock or product not found');
  }

  // Log audit for significant stock changes
  if (Math.abs(quantityChange) > 10) {
    await createAuditLog({
      userId: updaterId,
      vendorId,
      action: 'product_updated',
      entityType: 'Product',
      entityId: productId,
      changes: { stock: quantityChange },
    });
  }

  return product;
}

// Get low stock alerts
export async function getLowStockProducts(vendorId) {
  const products = await Product.find({
    vendorId,
    isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
  }).sort({ stock: 1 });

  return products;
}

// Get near expiry products (within 30 days)
export async function getNearExpiryProducts(vendorId) {
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const products = await Product.find({
    vendorId,
    isActive: true,
    expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
  }).sort({ expiryDate: 1 });

  return products;
}

// Get out of stock products
export async function getOutOfStockProducts(vendorId) {
  const products = await Product.find({
    vendorId,
    isActive: true,
    stock: 0,
  }).sort({ name: 1 });

  return products;
}

// Get inventory summary
export async function getInventorySummary(vendorId) {
  const [totalProducts, activeProducts, lowStockCount, outOfStockCount, nearExpiryCount] = await Promise.all([
    Product.countDocuments({ vendorId }),
    Product.countDocuments({ vendorId, isActive: true }),
    Product.countDocuments({
      vendorId,
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    }),
    Product.countDocuments({ vendorId, isActive: true, stock: 0 }),
    Product.countDocuments({
      vendorId,
      isActive: true,
      expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() },
    }),
  ]);

  return {
    totalProducts,
    activeProducts,
    lowStockCount,
    outOfStockCount,
    nearExpiryCount,
  };
}

// Get categories for vendor
export async function getProductCategories(vendorId) {
  const categories = await Product.distinct('category', { vendorId, isActive: true });
  return categories;
}
