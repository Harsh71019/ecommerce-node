import asyncHandler from 'express-async-handler';
import Cart from '../models/cartModel.js';

// @desc    Add a product to the user's cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
  }

  await cart.save();
  res.status(201).json(cart);
});

// @desc    Get the user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});

// @desc    Remove a product from the user's cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });

  if (cart) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();
    res.json({ message: 'Product removed from cart' });
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});

// Move item from cart to wishlist
const moveToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);

  if (user) {
    const cartItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex !== -1) {
      const cartItem = user.cart[cartItemIndex];
      user.cart.splice(cartItemIndex, 1);

      // Check if the product is already in the wishlist
      const existingWishlistItem = user.wishlist.find(
        (item) => item.product.toString() === productId
      );

      if (!existingWishlistItem) {
        user.wishlist.push({ product: productId });
      }

      await user.save();

      res.json({ message: 'Item moved to wishlist' });
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

export { addToCart, getCart, removeFromCart, moveToWishlist };
