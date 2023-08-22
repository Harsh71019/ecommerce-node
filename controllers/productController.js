import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { requestLogger } from '../middleware/errorMiddleware.js';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET_KEY,
});

console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET_KEY,
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    requestLogger(req, res, async () => {
      const {
        name,
        price,
        description,
        images,
        brand,
        category,
        countInStock,
        attributes,
        discount,
        offers,
        couponCodes,
        comments,
      } = req.body;

      let uploadedImages = [];

      try {
        if (images) {
          await Promise.all(
            images.map(async (image) => {
              const uploadedImage = await cloudinary.v2.uploader.upload(image, {
                folder: 'product_images',
              });
              uploadedImages.push({
                url: uploadedImage.secure_url,
                altText: 'altText',
                public_id: uploadedImage.public_id,
              });
            })
          );
        }
      } catch (error) {
        console.log(error);
        // res.status(500).json('Something went wrong');
      }

      const product = new Product({
        name,
        price,
        description,
        images: uploadedImages,
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
  } catch (error) {
    res.status(500).json('Something went wrong');
  }
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
  const {
    name,
    description,
    price,
    attributes,
    isCouponEligible,
    category,
    brand,
    countInStock,
    images,
    newImages,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.countInStock = countInStock || product.countInStock;

    product.description = description || product.description;
    product.price = price || product.price;
    product.attributes = attributes || product.attributes;
    product.isCouponEligible = isCouponEligible || product.isCouponEligible;

    // Compare old images with new images and delete those that are not present in new images

    try {
      if (images && Array.isArray(images) && images.length > 0) {
        const oldImages = product.images;

        // Filter out images to be deleted
        const imagesToDelete = oldImages.filter(
          (oldImage) =>
            !images.some(
              (newImage) => newImage.public_id === oldImage.public_id
            )
        );

        // Delete images from Cloudinary
        for (const imageToDelete of imagesToDelete) {
          await cloudinary.uploader.destroy(imageToDelete.public_id);
        }

        product.images = images; // Update images with new images
      }
    } catch (error) {
      console.log(error);
    }

    console.log(product.images, 'First');

    try {
      if (newImages && Array.isArray(newImages) && newImages.length > 0) {
        for (const newImage of newImages) {
          const result = await cloudinary.uploader.upload(newImage);
          const newImageData = {
            url: result.secure_url,
            altText: newImage.altText || 'altText',
            public_id: result.public_id,
          };
          product.images.push(newImageData);
        }
      }
    } catch (error) {
      console.log(error);
    }

    console.log(product.images, 'Seciond');

    // Upload and store new images

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
    // Delete images from Cloudinary
    for (const imageToDelete of product.images) {
      await cloudinary.uploader.destroy(imageToDelete.public_id);
    }

    await product.deleteOne(); // Delete the product document

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
