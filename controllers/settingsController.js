import asyncHandler from 'express-async-handler';
import Settings from '../models/settingsModel.js';

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne();
  res.json(settings);
});

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const {
    logo,
    title,
    subtitle,
    backgroundImage,
    textColor,
    buttonText,
    buttonLink,
    phoneNumber,
    emailAddress,
    socialMediaLinks, // Include social media links in the request body
    welcomeMessage,
    featuredProducts,
    testimonials,
  } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings({});
  }

  settings.hero = {
    logo,
    title,
    subtitle,
    backgroundImage,
    textColor,
    buttonText,
    buttonLink,
    phoneNumber,
    emailAddress,
    socialMediaLinks, // Assign social media links to the hero section
  };

  settings.frontPage = {
    welcomeMessage,
    featuredProducts,
    testimonials,
  };

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});

export { getSettings, updateSettings };
