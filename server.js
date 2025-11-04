const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  console.error('Please check your .env file and ensure MONGODB_URI is set');
  process.exit(1);
}

console.log('🔄 Connecting to MongoDB...');
console.log(`📊 Database name: ${MONGODB_URI.split('/').pop().split('?')[0]}`);

mongoose.set('strictQuery', false);

// Connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority'
};

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('Please check:');
    console.error('1. MongoDB URI is correct');
    console.error('2. Database user has proper permissions');
    console.error('3. IP address is whitelisted in MongoDB Atlas');
    console.error('4. Network connection is stable');
    process.exit(1);
  });

// Handle connection events (consolidated - no duplicates)
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

// Routes
app.get('/api', (req, res) => {
  res.json({ 
    success: true,
    message: 'Welcome to VibeCart API',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    success: true,
    status: 'OK', 
    message: 'Server is running',
    database: {
      status: dbStatus,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    },
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');
const cartRoutes = require('./routes/cart');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 VibeCart Server Started');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`💾 Environment: ${process.env.NODE_ENV}`);
  console.log('\n📋 Available Routes:');
  console.log('   GET  /api - API info');
  console.log('   GET  /api/health - Health check');
  console.log('   POST /api/auth/signup - Register user');
  console.log('   POST /api/auth/login - Login user');
  console.log('   GET  /api/auth/me - Get current user (protected)');
  console.log('   GET  /api/products - Get all products');
  console.log('   GET  /api/products/my/products - Get user products (protected)');
  console.log('   POST /api/products - Create product (protected)');
  console.log('   GET  /api/products/:id - Get single product');
  console.log('   PUT  /api/products/:id - Update product (protected)');
  console.log('   DELETE /api/products/:id - Delete product (protected)');
  console.log('\n✨ Ready to accept requests!\n');
});
