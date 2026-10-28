import {
  browseProducts,
  getProductDetails,
  browseLabTests,
  browseLabPackages,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getUserOrders,
  getOrderById,
} from '../Services/patientMarketplaceService.js';

// Product browsing
export async function browseProductsController(req, res) {
  try {
    const { category, search, minPrice, maxPrice, prescriptionRequired, page = 1, limit = 20 } = req.query;

    const result = await browseProducts(
      { category, search, minPrice, maxPrice, prescriptionRequired },
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

export async function getProductDetailsController(req, res) {
  try {
    const { productId } = req.params;
    const product = await getProductDetails(productId);

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

// Lab test browsing
export async function browseLabTestsController(req, res) {
  try {
    const { category, search, minPrice, maxPrice, homeCollectionAvailable, page = 1, limit = 20 } = req.query;

    const result = await browseLabTests(
      { category, search, minPrice, maxPrice, homeCollectionAvailable },
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

// Lab package browsing
export async function browseLabPackagesController(req, res) {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const result = await browseLabPackages(
      { search },
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

// Cart management
export async function getCartController(req, res) {
  try {
    const cart = await getCart(req.user.id);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function addToCartController(req, res) {
  try {
    const cart = await addToCart(req.user.id, req.body);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item added to cart',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function updateCartItemController(req, res) {
  try {
    const { itemId } = req.params;
    const cart = await updateCartItem(req.user.id, itemId, req.body);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart item updated',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function removeFromCartController(req, res) {
  try {
    const { itemId } = req.params;
    const cart = await removeFromCart(req.user.id, itemId);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item removed from cart',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function clearCartController(req, res) {
  try {
    const cart = await clearCart(req.user.id);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart cleared',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Checkout
export async function checkoutController(req, res) {
  try {
    const { profileId, ...checkoutData } = req.body;
    const order = await checkout(req.user.id, profileId, checkoutData);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Order management
export async function getUserOrdersController(req, res) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const result = await getUserOrders(
      req.user.id,
      { status, search },
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

export async function getOrderByIdController(req, res) {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId, req.user.id);

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
