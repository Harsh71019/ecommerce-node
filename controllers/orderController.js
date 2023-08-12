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

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
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

// @desc    Get orders for a specific user
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

export {
  createOrder,
  getOrderById,
  updateTransitStatus,
  getAllOrders,
  markOrderAsDelivered,
  getMyOrders,
};
