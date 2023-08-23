import asyncHandler from "express-async-handler";
// @ts-expect-error TS(2792): Cannot find module '../models/wishlistModel.js'. Did you mean to set the 'moduleResolution' option to 'node', or to add aliases to the 'paths' option?
import Wishlist from "../models/wishlistModel.js";
import User from "../models/userModel.js";

// @desc    Add a product to the user's wishlist
// @route   POST /api/wishlist
// @access  Private

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = (req.user as any)._id;

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: userId,
      items: [{ product: productId }],
    });
  } else {
    const existingItem = wishlist.items.find(
      (item: any) => item.product.toString() === productId,
    );
    if (!existingItem) {
      wishlist.items.push({ product: productId });
    }
  }

  await wishlist.save();
  res.status(201).json(wishlist);
});

// @desc    Get the user's wishlist
// @route   GET /api/wishlist
// @access  Private

const getWishlist = asyncHandler(async (req, res) => {
  const userId = (req.user as any)._id;
  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    "items.product",
  );

  if (wishlist) {
    res.json(wishlist);
  } else {
    res.status(404).json({ message: "Wishlist not found" });
  }
});

// @desc    Remove a product from the user's wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private

const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const userId = (req.user as any)._id;

  const wishlist = await Wishlist.findOne({ user: userId });

  if (wishlist) {
    wishlist.items = wishlist.items.filter(
      (item: any) => item.product.toString() !== productId,
    );
    await wishlist.save();
    res.json({ message: "Product removed from wishlist" });
  } else {
    res.status(404).json({ message: "Wishlist not found" });
  }
});

// Move item from wishlist to cart

const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById((req.user as any)._id);

  if (user) {
    const wishlistItemIndex = user.wishlist.findIndex(
      (item: any) => item.product.toString() === productId,
    );

    if (wishlistItemIndex !== -1) {
      const wishlistItem = user.wishlist[wishlistItemIndex];
      user.wishlist.splice(wishlistItemIndex, 1);

      // Check if the product is already in the cart
      const existingCartItem = user.cart.find(
        (item: any) => item.product.toString() === productId,
      );

      if (!existingCartItem) {
        user.cart.push({ product: productId });
      }

      await user.save();

      res.json({ message: "Item moved to cart" });
    } else {
      res.status(404).json({ message: "Item not found in wishlist" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export { addToWishlist, getWishlist, removeFromWishlist, moveToCart };
