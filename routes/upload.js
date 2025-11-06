const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');

// @route   POST /api/upload/single
// @desc    Upload single image (converts to Base64 for MongoDB storage)
// @access  Private
router.post('/single', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Read the file and convert to Base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
    
    // Delete the temporary file
    fs.unlinkSync(req.file.path);
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        url: base64Image, // Send Base64 string instead of file path
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
// @desc    Upload multiple images (max 5) - converts to Base64 for MongoDB storage
// @access  Private
router.post('/multiple', protect, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const fileUrls = req.files.map(file => {
      // Read the file and convert to Base64
      const imageBuffer = fs.readFileSync(file.path);
      const base64Image = `data:${file.mimetype};base64,${imageBuffer.toString('base64')}`;
      
      // Delete the temporary file
      fs.unlinkSync(file.path);
      
      return {
        filename: file.filename,
        url: base64Image, // Send Base64 string instead of file path
        size: file.size,
        mimetype: file.mimetype
      };
    });
    
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
