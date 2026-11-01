import Product from '../Models/Product.model.js';
import LabTest from '../Models/LabTest.model.js';
import LabPackage from '../Models/LabPackage.model.js';
import Vendor from '../Models/Vendor.model.js';
import Cart from '../Models/Cart.model.js';
import Order from '../Models/Order.model.js';
import Commission from '../Models/Commission.model.js';
import Prescription from '../Models/Prescription.model.js';

// Browse products across vendors
export async function browseProducts(filters = {}, page = 1, limit = 20) {
  const approvedVendorIds = await Vendor.find({ status: 'approved', type: 'pharmacy' }).distinct('_id');
  
  const query = {
    vendorId: { $in: approvedVendorIds },
    isActive: true,
    stock: { $gt: 0 },
  };

  if (filters.category) query.category = filters.category;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { genericName: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }
  if (filters.minPrice) query.price = { $gte: filters.minPrice };
  if (filters.maxPrice) query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.prescriptionRequired !== undefined) query.requiresPrescription = filters.prescriptionRequired;

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('vendorId', 'businessName city rating')
      .sort({ rating: -1, price: 1 })
      .skip(skip)
      .limit(limit),
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

// Get product details with vendor info
export async function getProductDetails(productId) {
  const product = await Product.findOne({ _id: productId, isActive: true })
    .populate('vendorId', 'businessName city rating address contactInfo operatingHours');

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}

// Browse lab tests across vendors
export async function browseLabTests(filters = {}, page = 1, limit = 20) {
  const approvedVendorIds = await Vendor.find({ status: 'approved', type: 'laboratory' }).distinct('_id');
  
  const query = {
    vendorId: { $in: approvedVendorIds },
    isActive: true,
  };

  if (filters.category) query.category = filters.category;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }
  if (filters.minPrice) query.price = { $gte: filters.minPrice };
  if (filters.maxPrice) query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.homeCollectionAvailable !== undefined) query.homeCollectionAvailable = filters.homeCollectionAvailable;

  const skip = (page - 1) * limit;

  const [tests, total] = await Promise.all([
    LabTest.find(query)
      .populate('vendorId', 'businessName city rating address contactInfo operatingHours')
      .sort({ rating: -1, price: 1 })
      .skip(skip)
      .limit(limit),
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

// Browse lab packages across vendors
export async function browseLabPackages(filters = {}, page = 1, limit = 20) {
  const approvedVendorIds = await Vendor.find({ status: 'approved', type: 'laboratory' }).distinct('_id');
  
  const query = {
    vendorId: { $in: approvedVendorIds },
    isActive: true,
  };

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [packages, total] = await Promise.all([
    LabPackage.find(query)
      .populate('vendorId', 'businessName city rating address contactInfo operatingHours')
      .populate('tests.testId')
      .sort({ rating: -1, price: 1 })
      .skip(skip)
      .limit(limit),
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

// Get cart for user
export async function getCart(userId) {
  const cart = await Cart.findOne({ userId }).populate('items.productId items.labTestId items.labPackageId items.prescriptionId');
  if (!cart) {
    return await Cart.create({ userId, items: [], subtotal: 0, deliveryFee: 0, totalAmount: 0 });
  }
  return cart;
}

// Add item to cart
export async function addToCart(userId, itemData) {
  const cart = await Cart.findOne({ userId });
  
  if (!cart) {
    const newCart = await Cart.create({
      userId,
      items: [itemData],
      subtotal: itemData.totalPrice,
      totalAmount: itemData.totalPrice,
    });
    return newCart;
  }

  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    item => 
      item.type === itemData.type &&
      item.vendorId.toString() === itemData.vendorId.toString() &&
      ((item.type === 'product' && item.productId?.toString() === itemData.productId?.toString()) ||
       (item.type === 'lab_test' && item.labTestId?.toString() === itemData.labTestId?.toString()) ||
       (item.type === 'lab_package' && item.labPackageId?.toString() === itemData.labPackageId?.toString()))
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += itemData.quantity;
    cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
  } else {
    cart.items.push(itemData);
  }

  // Recalculate totals
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  cart.totalAmount = cart.subtotal + cart.deliveryFee;

  await cart.save();
  return cart;
}

// Update cart item
export async function updateCartItem(userId, itemId, updateData) {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new Error('Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (updateData.quantity !== undefined) {
    item.quantity = updateData.quantity;
    item.totalPrice = item.quantity * item.unitPrice;
  }

  // Remove if quantity is 0
  if (item.quantity <= 0) {
    cart.items.pull(itemId);
  }

  cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  cart.totalAmount = cart.subtotal + cart.deliveryFee;

  await cart.save();
  return cart;
}

// Remove item from cart
export async function removeFromCart(userId, itemId) {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new Error('Cart not found');
  }

  cart.items.pull(itemId);
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  cart.totalAmount = cart.subtotal + cart.deliveryFee;

  await cart.save();
  return cart;
}

// Clear cart
export async function clearCart(userId) {
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { items: [], subtotal: 0, deliveryFee: 0, totalAmount: 0 },
    { new: true }
  );
  return cart;
}

// Checkout with order splitting
export async function checkout(userId, profileId, checkoutData) {
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Group items by vendor
  const groupedItems = {};
  cart.items.forEach(item => {
    const vendorId = item.vendorId.toString();
    if (!groupedItems[vendorId]) {
      groupedItems[vendorId] = [];
    }
    groupedItems[vendorId].push(item);
  });

  // Get commission rates for each vendor
  const vendorIds = Object.keys(groupedItems);
  const vendors = await Vendor.find({ _id: { $in: vendorIds } });
  const vendorCommissionRates = {};
  vendors.forEach(vendor => {
    vendorCommissionRates[vendor._id.toString()] = vendor.commissionRate || 15; // Default 15%
  });

  // Create sub-orders for each vendor
  const subOrders = [];
  let totalCommission = 0;
  let totalDeliveryFee = 0;
  let totalHomeCollectionFee = 0;

  for (const [vendorId, items] of Object.entries(groupedItems)) {
    const vendor = vendors.find(v => v._id.toString() === vendorId);
    const commissionRate = vendorCommissionRates[vendorId];

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const commissionAmount = (subtotal * commissionRate) / 100;
    const vendorEarnings = subtotal - commissionAmount;

    let deliveryFee = 0;
    let homeCollectionFee = 0;

    if (vendor.type === 'pharmacy') {
      deliveryFee = vendor.deliveryAvailable ? vendor.deliveryAreas[0]?.charge || 50 : 0;
      totalDeliveryFee += deliveryFee;
    } else if (vendor.type === 'laboratory') {
      const hasHomeCollection = items.some(item => item.homeCollection);
      if (hasHomeCollection) {
        homeCollectionFee = vendor.homeCollectionFee || 0;
        totalHomeCollectionFee += homeCollectionFee;
      }
    }

    subOrders.push({
      vendorId,
      vendorName: vendor.businessName,
      vendorType: vendor.type,
      items: items.map(item => ({
        type: item.type,
        productId: item.productId,
        labTestId: item.labTestId,
        labPackageId: item.labPackageId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        prescriptionRequired: item.prescriptionRequired,
        prescriptionId: item.prescriptionId,
      })),
      subtotal,
      deliveryFee,
      homeCollectionFee,
      totalAmount: subtotal + deliveryFee + homeCollectionFee,
      commissionAmount,
      commissionRate,
      vendorEarnings,
      orderStatus: vendor.type === 'pharmacy' ? 'placed' : undefined,
      bookingStatus: vendor.type === 'laboratory' ? 'booked' : undefined,
      paymentStatus: 'pending',
      paymentMethod: checkoutData.paymentMethod || 'cod',
      deliveryAddress: checkoutData.deliveryAddress,
      homeCollection: items.some(item => item.homeCollection),
      collectionAddress: checkoutData.collectionAddress,
      scheduledDate: items[0]?.scheduledDate,
      scheduledTime: items[0]?.scheduledTime,
      statusHistory: [{
        status: vendor.type === 'pharmacy' ? 'placed' : 'booked',
        timestamp: new Date(),
        note: 'Order placed',
      }],
    });

    totalCommission += commissionAmount;
  }

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create parent order
  const order = await Order.create({
    userId,
    profileId,
    orderNumber,
    subOrders,
    totalAmount: cart.subtotal + totalDeliveryFee + totalHomeCollectionFee,
    totalCommission,
    totalDeliveryFee,
    totalHomeCollectionFee,
    paymentStatus: 'pending',
    paymentMethod: checkoutData.paymentMethod || 'cod',
    status: 'pending',
    notes: checkoutData.notes,
  });

  // Atomic stock decrement for products
  for (const subOrder of subOrders) {
    if (subOrder.vendorType === 'pharmacy') {
      for (const item of subOrder.items) {
        if (item.type === 'product' && item.productId) {
          const product = await Product.findOneAndUpdate(
            { _id: item.productId, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true }
          );
          
          if (!product) {
            throw new Error(`Insufficient stock for product: ${item.name}`);
          }
        }
      }
    }
  }

  // Clear cart
  await clearCart(userId);

  return order;
}

// Get user orders
export async function getUserOrders(userId, filters = {}, page = 1, limit = 20) {
  const query = { userId };

  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.orderNumber = { $regex: filters.search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('subOrders.vendorId', 'businessName type city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Get order by ID
export async function getOrderById(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, userId })
    .populate('subOrders.vendorId', 'businessName type city address contactInfo')
    .populate('profileId', 'name relationship');

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
}
