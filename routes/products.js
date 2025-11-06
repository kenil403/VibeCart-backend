const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const multerConfig = require('../config/multer');

// GET all public products (for browsing)
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    
    // Build filter
    let filter = { isPublic: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Build sort
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    
    // Exclude binary image data from list responses to keep payload small.
    const products = await Product.find(filter).select('-imageData -imagesData')
      .populate('owner', 'name email')
      .sort(sortOption)
      .lean();
      
    res.json({
      success: true,
      count: products.length,
      data: products || []
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: []
    });
  }
});

// GET user's own products (Protected)
router.get('/my/products', protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        data: []
      });
    }

    // Exclude binary image data from list responses
    const products = await Product.find({ owner: req.user._id }).select('-imageData -imagesData')
      .sort({ createdAt: -1 })
      .lean();
      
    res.json({
      success: true,
      count: products.length,
      data: products || []
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      data: []
    });
  }
});

// Serve product main image binary
// Note: this route must be declared before the ':id' route below
router.get('/:id/image', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('imageData');
    if (!product || !product.imageData || !product.imageData.data) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.set('Content-Type', product.imageData.contentType || 'application/octet-stream');
    return res.send(product.imageData.data);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    // Exclude binary image data from the product object by default.
    const product = await Product.findById(req.params.id).select('-imageData -imagesData')
      .populate('owner', 'name email');
      
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// POST create product (Protected - Any logged in user)
// Accepts multipart/form-data with an optional file field named 'image'.
router.post('/', protect, multerConfig.memory.single('image'), [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive integer')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.body.image || '',
      // If a file was uploaded, save binary data
      imageData: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      } : undefined,
      stock: req.body.stock || 0,
      owner: req.user._id,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true
    });

    const newProduct = await product.save();
    await newProduct.populate('owner', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      // Provide an image URL endpoint that can be used by the frontend to fetch
      // the binary image regardless of environment (no localhost hardcoding).
      data: Object.assign(newProduct.toObject(), {
        imageUrl: `/api/products/${newProduct._id}/image`
      })
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// PUT update product (Protected - Owner or Admin only)
// Update product (can include new image file in field 'image')
router.put('/:id', protect, multerConfig.memory.single('image'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive integer')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check if user is owner or admin
    if (product.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to update this product' 
      });
    }

    // Update fields
    const allowedUpdates = ['name', 'description', 'price', 'category', 'image', 'stock', 'isPublic'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // If a new file is uploaded, replace binary data
    if (req.file) {
      product.imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }

    const updatedProduct = await product.save();
    await updatedProduct.populate('owner', 'name email');
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// DELETE product (Protected - Owner or Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check if user is owner or admin
    if (product.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to delete this product' 
      });
    }

    await product.deleteOne();
    
    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// GET categories list
router.get('/filter/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isPublic: true });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;
