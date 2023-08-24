import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// @desc    Update order transit status
// @route   PUT /api/orders/:id/transit
// @access  Private/Admin
const updateTransitStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isInTransit = true;
    order.transitStatus.push({
      status: 'In Transit',
      timestamp: Date.now(),
    });

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

//@desc Get all orders with pagination and search
//@route GET /api/orders
// @access Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const searchQuery = req.query.search || '';
  const statusFilter = req.query.status || '';

  const query = {};

  if (searchQuery) {
    query.$or = [
      { orderId: { $regex: searchQuery, $options: 'i' } },
      // Add more fields for search if needed
    ];
  }

  if (statusFilter) {
    query.status = statusFilter;
  }

  const totalOrders = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalOrders / pageSize);

  const orders = await Order.find(query)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate('user', 'id name');

  res.json({
    orders,
    page,
    pageSize,
    totalOrders,
    totalPages,
  });
});

// @desc    Update order status to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const markOrderAsDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// @desc    Get orders for a specific user with pagination and search
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const searchQuery = req.query.search || '';

  const query = {
    user: req.user._id,
  };

  if (searchQuery) {
    query.$or = [
      { orderId: { $regex: searchQuery, $options: 'i' } },
      // Add more fields for search if needed
    ];
  }

  const totalOrders = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalOrders / pageSize);

  const orders = await Order.find(query)
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  res.json({
    orders,
    page,
    pageSize,
    totalOrders,
    totalPages,
  });
});

const getDetailedAnalytics = asyncHandler(async (req, res) => {
  const orders = await Order.find({});

  // Calculate total revenue
  const totalRevenue = orders.reduce(
    (total, order) => total + order.totalPrice,
    0
  );

  // Calculate average order value
  const averageOrderValue = totalRevenue / orders.length || 0;

  // Create a product map to count product occurrences
  const productMap = new Map();
  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const productId = item.product.toString();
      if (productMap.has(productId)) {
        productMap.set(productId, productMap.get(productId) + 1);
      } else {
        productMap.set(productId, 1);
      }
    });
  });

  // Find the most popular product
  let mostPopularProduct = null;
  let maxOccurrence = 0;
  for (const [productId, occurrence] of productMap) {
    if (occurrence > maxOccurrence) {
      maxOccurrence = occurrence;
      mostPopularProduct = productId;
    }
  }

  // Fetch the product details for the most popular product
  const popularProduct = await Product.findById(mostPopularProduct);

  const analytics = {
    totalOrders: orders.length,
    totalRevenue,
    averageOrderValue,
    mostPopularProduct: popularProduct ? popularProduct.name : 'N/A',
  };

  res.json(analytics);
});

export {
  createOrder,
  getOrderById,
  updateTransitStatus,
  getAllOrders,
  markOrderAsDelivered,
  getMyOrders,
  getDetailedAnalytics,
};
