import {
  createProduct,
  getVendorProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getNearExpiryProducts,
  getOutOfStockProducts,
  getInventorySummary,
  getProductCategories,
} from '../Services/productService.js';
import { validateProductData, formatValidationErrors } from '../utils/validators.js';

// Create product
export async function createProductController(req, res) {
  try {
    const productData = req.body;

    // Validate product data
    const validationErrors = validateProductData(productData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: formatValidationErrors(validationErrors),
      });
    }

    // Handle file uploads
    if (req.files && req.files.productImage) {
      productData.images = req.files.productImage.map(file => ({
        url: `/uploads/products/${file.filename}`,
        publicId: file.filename,
      }));
    }

    const product = await createProduct(req.user.vendorId, productData, req.user.id);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get products for vendor
export async function getVendorProductsController(req, res) {
  try {
    const { category, subcategory, isActive, prescriptionRequired, search, page = 1, limit = 20 } = req.query;

    const result = await getVendorProducts(
      req.user.vendorId,
      { category, subcategory, isActive, prescriptionRequired, search },
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

// Get product by ID
export async function getProductByIdController(req, res) {
  try {
    const { productId } = req.params;
    const product = await getProductById(productId, req.user.vendorId);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

// Update product
export async function updateProductController(req, res) {
  try {
    const { productId } = req.params;
    const product = await updateProduct(productId, req.user.vendorId, req.body, req.user.id);

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Delete product
export async function deleteProductController(req, res) {
  try {
    const { productId } = req.params;
    const product = await deleteProduct(productId, req.user.vendorId, req.user.id);

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Update stock
export async function updateStockController(req, res) {
  try {
    const { productId } = req.params;
    const { quantityChange } = req.body;

    const product = await updateStock(productId, req.user.vendorId, quantityChange, req.user.id);

    res.status(200).json({
      success: true,
      data: product,
      message: 'Stock updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get low stock alerts
export async function getLowStockProductsController(req, res) {
  try {
    const products = await getLowStockProducts(req.user.vendorId);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get near expiry products
export async function getNearExpiryProductsController(req, res) {
  try {
    const products = await getNearExpiryProducts(req.user.vendorId);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get out of stock products
export async function getOutOfStockProductsController(req, res) {
  try {
    const products = await getOutOfStockProducts(req.user.vendorId);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get inventory summary
export async function getInventorySummaryController(req, res) {
  try {
    const summary = await getInventorySummary(req.user.vendorId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get product categories
export async function getProductCategoriesController(req, res) {
  try {
    const categories = await getProductCategories(req.user.vendorId);

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
