import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import { requestLogger, errorLogger } from '../middleware/errorMiddleware.js';
import generateResetToken from '../utils/resetPasswordToken.js';
import sendResetPasswordEmail from '../utils/resetPasswordEmail.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import passport from 'passport';

//@desc Auth user and get token
//@route POST /api/users/login
// @access Public
const authUser = asyncHandler(async (req, res, next) => {
  requestLogger(req, res, async () => {
    // Use passport.authenticate with the 'local' strategy
    passport.authenticate('local', (err, user) => {
      if (err) {
        // Log and handle server error
        errorLogger(req, res, () => console.error(err));
        return res.status(500).json({ message: 'Server Error' });
        // throw new Error('Server Error');
      }

      if (!user) {
        // Unauthorized - invalid credentials
        return res.status(401).json({ message: 'Invalid email or password' });
        // throw new Error('Invalid email or password');
      }

      // Successful authentication
      req.logIn(user, (err) => {
        if (err) {
          // Log and handle server error
          errorLogger(req, res, () => console.error(err));
          return res.status(500).json({ message: 'Server Error' });
        }

        // Return user details with token
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        });
      });
    })(req, res, next); // Call the passport.authenticate middleware
  });
});

//@desc Register a new user
//@route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  requestLogger(req, res, async () => {
    const { name, email, password, mobile, username } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      mobile,
      username,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  });
});

//@desc Get user profile
//@route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  requestLogger(req, res, async () => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

//@desc Update user profile
//@route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  requestLogger(req, res, async () => {
    try {
      const user = await User.findById(req.user._id);

      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.mobile = req.body.mobile || user.mobile;

        if (req.body.password) {
          user.password = req.body.password;
        }

        // Update other fields as needed
        user.username = req.body.username || user.username;
        // Update other fields like shippingAddress and billingAddress
        user.shippingAddress.street =
          req.body.shippingAddress?.street || user.shippingAddress.street;
        user.shippingAddress.city =
          req.body.shippingAddress?.city || user.shippingAddress.city;
        // Similarly update billingAddress and other fields

        const updatedUser = await user.save();

        res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          isAdmin: updatedUser.isAdmin,
          token: generateToken(updatedUser._id),
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      errorLogger(req, res, () => console.error(error));
      res.status(500).json({ message: 'Server Error' });
    }
  });
});

//@desc Get all users with pagination and search
//@route GET /api/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  requestLogger(req, res, async () => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const searchQuery = req.query.search || '';

    const query = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        // Add more fields for search if needed
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / pageSize);

    const users = await User.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json({
      users,
      page,
      pageSize,
      totalUsers,
      totalPages,
    });
  });
});

//@desc Delete a user
//@route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  requestLogger(req, res, async () => {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.remove();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

//@desc Request password reset
//@route POST /api/users/reset-password
// @access Public
const requestPasswordReset = asyncHandler(async (req, res) => {
  requestLogger(req, res, async () => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const resetToken = generateResetToken(user);

      await user.updateOne({ resetPasswordToken: resetToken });

      await sendResetPasswordEmail(user, resetToken);

      res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
      errorLogger(req, res, () => console.error(error));
      res.status(500).json({ message: 'Failed to send reset password email' });
    }
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.reset) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});

//@desc Get user by ID
//@route GET /api/users/:id
// @access Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

//@desc Update user role
//@route PUT /api/users/:id/update-role
// @access Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isAdmin = req.body.isAdmin;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

//@desc Get admin dashboard summary
//@route GET /api/dashboard
// @access Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  try {
    const userCount = await User.countDocuments();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    const totalUsersWithOrders = await User.countDocuments({
      _id: { $in: await Order.distinct('user') },
    });

    const usersWithOrdersPercentage = (totalUsersWithOrders / userCount) * 100;

    const currentItemsInCarts = await User.aggregate([
      {
        $group: { _id: null, totalItemsInCarts: { $sum: { $size: '$cart' } } },
      },
    ]);

    const highestOrderByPrice = await Order.findOne()
      .sort({ totalPrice: -1 })
      .populate('user', 'name');

    const orderFrequency = await Order.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $project: { _id: 0, user: '$user.name', orderCount: '$count' } },
    ]);

    const dashboardSummary = {
      userCount,
      newUsersCount,
      usersWithOrdersPercentage,
      currentItemsInCarts:
        currentItemsInCarts.length > 0
          ? currentItemsInCarts[0].totalItemsInCarts
          : 0,
      highestOrderByPrice,
      orderFrequency: orderFrequency.length > 0 ? orderFrequency[0] : null,
    };

    res.json(dashboardSummary);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  requestPasswordReset,
  resetPassword,
  updateUserRole,
  getAdminDashboard,
  getUserById,
};
