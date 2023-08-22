// controllers/contactController.js

import asyncHandler from 'express-async-handler';
import ContactUs from '../models/contactModel.js';

// @desc    Create a new contact us message
// @route   POST /api/contact
// @access  Public
const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  const contactMessage = new ContactUs({
    name,
    email,
    subject,
    message,
  });

  const createdMessage = await contactMessage.save();
  res.status(201).json(createdMessage);
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getAllContactMessages = asyncHandler(async (req, res) => {
  const contactMessages = await ContactUs.find({});
  res.json(contactMessages);
});

// @desc    Get a contact message by ID
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactMessageById = asyncHandler(async (req, res) => {
  const contactMessage = await ContactUs.findById(req.params.id);
  if (contactMessage) {
    res.json(contactMessage);
  } else {
    res.status(404).json({ message: 'Contact message not found' });
  }
});

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContactMessage = asyncHandler(async (req, res) => {
  const contactMessage = await ContactUs.findById(req.params.id);
  if (contactMessage) {
    await contactMessage.remove();
    res.json({ message: 'Contact message removed' });
  } else {
    res.status(404).json({ message: 'Contact message not found' });
  }
});

export {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  deleteContactMessage,
};
