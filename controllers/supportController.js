// controllers/supportController.js

import asyncHandler from 'express-async-handler';
import SupportTicket from '../models/supportModel.js';

// @desc    Create a new support ticket
// @route   POST /api/support
// @access  Private/Customer
const createSupportTicket = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;

  const supportTicket = new SupportTicket({
    customer: req.user._id,
    subject,
    message,
  });

  const createdTicket = await supportTicket.save();
  res.status(201).json(createdTicket);
});

// @desc    Get all support tickets with pagination
// @route   GET /api/support-tickets
// @access  Private/Admin
const getAllSupportTickets = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  const totalSupportTickets = await SupportTicket.countDocuments({});
  const totalPages = Math.ceil(totalSupportTickets / pageSize);

  const tickets = await SupportTicket.find({})
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate('customer', 'name email');

  res.json({
    tickets,
    page,
    pageSize,
    totalSupportTickets,
    totalPages,
  });
});

// @desc    Get support ticket by ID
// @route   GET /api/support/:id
// @access  Private
const getSupportTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id).populate(
    'customer',
    'name email'
  );
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404).json({ message: 'Support ticket not found' });
  }
});

// @desc    Update support ticket status (admin only)
// @route   PUT /api/support/:id/status
// @access  Private/Admin
const updateSupportTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const ticket = await SupportTicket.findById(req.params.id);
  if (ticket) {
    ticket.status = status;
    await ticket.save();
    res.json({ message: 'Support ticket status updated' });
  } else {
    res.status(404).json({ message: 'Support ticket not found' });
  }
});

export {
  createSupportTicket,
  getAllSupportTickets,
  getSupportTicketById,
  updateSupportTicketStatus,
};
