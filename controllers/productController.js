import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { requestLogger, errorLogger } from '../middleware/errorMiddleware.js';
// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  requestLogger(req, res, async () => {
    const {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
      attributes,
      discount,
      offers,
      couponCodes,
      comments,
    } = req.body;

    const product = new Product({
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
      attributes,
      discount,
      offers,
      couponCodes,
      comments,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  });
});

//@desc Get all products
//@route GET /api/products
// @access Public
// @desc    Get all products with pagination and filters
// @route   GET /api/products
// @access  Public
//@desc Get all products
//@route GET /api/products
// @access Public

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10; // Number of products per page
  const page = Number(req.query.page) || 1; // Current page number

  // Filters (if any)
  const filters = {};
  if (req.query.category) {
    filters.category = req.query.category;
  }
  if (req.query.brand) {
    filters.brand = req.query.brand;
  }
  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    filters.price = {};
    if (req.query.minPrice) {
      filters.price.$gte = parseFloat(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filters.price.$lte = parseFloat(req.query.maxPrice);
    }
  }
  // Filter by discount
  if (req.query.minDiscount) {
    filters.discount = { $gte: parseFloat(req.query.minDiscount) };
  }
  // Add more filters as needed

  // Role-based adjustments
  if (req.user && req.user.isAdmin) {
    // Admin-specific filters or data retrieval (if any)
  } else {
    // User-specific filters or data retrieval (if any)
  }

  // Count total number of products with applied filters
  const count = await Product.countDocuments(filters);

  // Fetch products with pagination and applied filters
  const products = await Product.find(filters)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

//@desc Get product by ID
//@route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

//@desc Update a product
//@route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, attributes, isCouponEligible } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.attributes = attributes || product.attributes;
    product.isCouponEligible = isCouponEligible || product.isCouponEligible;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

//@desc Delete a product
//@route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

//@desc Add a review to a product
//@route POST /api/products/:id/reviews
// @access Private
const addProductReview = asyncHandler(async (req, res) => {
  requestLogger(req, res, async () => {
    const { text, stars } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const review = {
        text,
        stars,
        user: req.user._id,
      };

      product.comments.push(review);
      product.rating =
        (product.rating * (product.comments.length - 1) + stars) /
        product.comments.length;

      await product.save();

      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  });
});

//@desc Update a review of a product
//@route PUT /api/products/:id/reviews/:reviewId
// @access Private
const updateProductReview = asyncHandler(async (req, res) => {
  const { text, stars } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const reviewIndex = product.comments.findIndex(
      (comment) => comment._id.toString() === req.params.reviewId
    );

    if (reviewIndex !== -1) {
      product.comments[reviewIndex].text =
        text || product.comments[reviewIndex].text;
      product.comments[reviewIndex].stars =
        stars || product.comments[reviewIndex].stars;

      // Recalculate the product's average rating
      let totalStars = 0;
      for (const comment of product.comments) {
        totalStars += comment.stars;
      }
      product.rating = totalStars / product.comments.length;

      await product.save();

      res.json({ message: 'Review updated' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

//@desc Delete a review of a product
//@route DELETE /api/products/:id/reviews/:reviewId
// @access Private
const deleteProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const reviewIndex = product.comments.findIndex(
      (comment) => comment._id.toString() === req.params.reviewId
    );

    if (reviewIndex !== -1) {
      product.comments.splice(reviewIndex, 1);

      if (product.comments.length === 0) {
        product.rating = 0;
      } else {
        // Recalculate the product's average rating
        let totalStars = 0;
        for (const comment of product.comments) {
          totalStars += comment.stars;
        }
        product.rating = totalStars / product.comments.length;
      }

      await product.save();

      res.json({ message: 'Review deleted' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  updateProductReview,
  deleteProductReview,
};
