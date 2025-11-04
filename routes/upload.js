const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// @route   POST /api/upload/single
// @desc    Upload single image
// @access  Private
router.post('/single', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images (max 5)
// @access  Private
router.post('/multiple', protect, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const fileUrls = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.status(200).json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      data: fileUrls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Maximum size is 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name in form data'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Error uploading file'
  });
});

module.exports = router;
