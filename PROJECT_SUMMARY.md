# VibeCart Backend - Project Summary

## 🚀 Project Overview
VibeCart Backend is a RESTful API server built with Node.js and Express that powers the VibeCart e-commerce platform. It provides secure authentication, product management, shopping cart functionality, and image upload capabilities with MongoDB as the database.

## 📋 Project Information
- **Project Name:** VibeCart Server
- **Type:** RESTful API Backend
- **Version:** 1.0.0
- **Repository:** https://github.com/kenil403/VibeCart-backend
- **Deployment:** Render (https://vibecart-backend.onrender.com)
- **Database:** MongoDB Atlas

## 🛠️ Technology Stack

### Core Technologies
- **Node.js:** v16+ - JavaScript runtime
- **Express:** 4.18.2 - Web framework
- **MongoDB:** Database (via MongoDB Atlas)
- **Mongoose:** 8.0.3 - MongoDB object modeling
- **JWT:** jsonwebtoken 9.0.2 - Authentication tokens
- **Bcryptjs:** 2.4.3 - Password hashing

### Additional Libraries
- **Multer:** 1.4.5-lts.1 - File upload handling
- **CORS:** 2.8.5 - Cross-origin resource sharing
- **Dotenv:** 16.3.1 - Environment variable management
- **Body-parser:** 1.20.2 - Request body parsing

## 📁 Project Structure

```
server/
├── config/
│   └── multer.js               # Multer configuration for file uploads
├── middleware/
│   └── auth.js                 # JWT authentication middleware
├── models/
│   ├── User.js                 # User schema and model
│   ├── Product.js              # Product schema and model
│   └── Cart.js                 # Shopping cart schema and model
├── routes/
│   ├── auth.js                 # Authentication routes (signup/login)
│   ├── products.js             # Product CRUD operations
│   ├── cart.js                 # Shopping cart operations
│   └── upload.js               # Image upload routes (Base64)
├── uploads/                    # Temporary file storage (ephemeral)
├── .env                        # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
├── server.js                   # Main application entry point
├── package.json                # Dependencies and scripts
├── DEPLOYMENT_GUIDE.md         # Deployment instructions
└── README.md                   # Project documentation
```

## 🔑 Key Features

### 1. Authentication System
- **User Registration** with email validation
- **Secure Login** with JWT token generation
- **Password Hashing** using bcrypt (10 salt rounds)
- **Token-based Authentication** for protected routes
- **User Profile** retrieval endpoint
- **Input Validation** with express-validator

### 2. Product Management
- **CRUD Operations** for products
- **Owner-based Access Control** (only owner can edit/delete)
- **Public/Private Products** visibility toggle
- **Category System** (10 predefined categories)
- **Stock Management** with validation
- **Price Validation** (0 to 1,000,000 range)
- **Product Search & Filtering** capabilities

### 3. Shopping Cart
- **Add to Cart** with automatic price calculation
- **Update Quantity** for cart items
- **Remove Items** from cart
- **Clear Cart** functionality
- **User-specific Carts** linked to user ID
- **Real-time Total** calculation
- **Duplicate Prevention** for same products

### 4. Image Upload & Storage
- **Base64 Conversion** - Images stored in MongoDB
- **Single Image Upload** endpoint
- **Multiple Images Upload** (max 5)
- **File Size Validation** (max 5MB per image)
- **Format Validation** (JPEG, PNG, GIF, WebP)
- **Temporary File Cleanup** after conversion
- **No Ephemeral Storage Issues** - persists with database

### 5. Error Handling
- **Centralized Error Handler**
- **Validation Error Messages**
- **MongoDB Error Handling**
- **Authentication Error Responses**
- **File Upload Error Handling**

## 🗄️ Database Schema

### User Model
```javascript
{
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### Product Model
```javascript
{
  name: String (3-100 chars, required),
  description: String (10-2000 chars, required),
  price: Number (0-1,000,000, required),
  category: String (enum, required),
  image: String (Base64 or URL),
  images: [String] (array of Base64/URLs),
  stock: Number (0-10,000, default: 0),
  isPublic: Boolean (default: true),
  owner: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Model
```javascript
{
  user: ObjectId (ref: User, required, unique),
  items: [{
    product: ObjectId (ref: Product, required),
    quantity: Number (min: 1, default: 1),
    price: Number (required)
  }],
  total: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibecart?retryWrites=true&w=majority&appName=VibeCart

# JWT Configuration
JWT_SECRET=your-secure-128-character-secret-key-here
```

### MongoDB Connection Options
```javascript
{
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority'
}
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/signup` | POST | Public | Register new user |
| `/login` | POST | Public | Login existing user |
| `/me` | GET | Private | Get current user info |

### Product Routes (`/api/products`)
| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/` | GET | Public | Get all public products |
| `/:id` | GET | Public | Get single product |
| `/` | POST | Private | Create new product |
| `/:id` | PUT | Private | Update product (owner only) |
| `/:id` | DELETE | Private | Delete product (owner only) |
| `/my-products` | GET | Private | Get user's products |

### Cart Routes (`/api/cart`)
| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/` | GET | Private | Get user's cart |
| `/add` | POST | Private | Add item to cart |
| `/update/:productId` | PUT | Private | Update item quantity |
| `/remove/:productId` | DELETE | Private | Remove item from cart |
| `/clear` | DELETE | Private | Clear entire cart |

### Upload Routes (`/api/upload`)
| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/single` | POST | Private | Upload single image |
| `/multiple` | POST | Private | Upload multiple images (max 5) |

### Health Check (`/api/health`)
| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/` | GET | Public | Server health status |

## 🔒 Security Features

### Authentication
- **JWT Tokens** with configurable expiration
- **Password Hashing** with bcrypt (10 rounds)
- **Token Verification** middleware
- **Protected Routes** with auth middleware
- **User Authorization** for resource access

### Input Validation
- **Email Format** validation
- **Password Length** requirements (min 6 chars)
- **Product Data** validation (length, range)
- **File Upload** validation (size, type)
- **XSS Prevention** with Mongoose sanitization

### Data Protection
- **CORS Enabled** for cross-origin requests
- **Environment Variables** for sensitive data
- **MongoDB Injection** prevention
- **Error Message** sanitization
- **HTTPS Only** in production

## 📦 Dependencies

### Production Dependencies
```json
{
  "bcryptjs": "^2.4.3",           // Password hashing
  "body-parser": "^1.20.2",       // Request body parsing
  "cors": "^2.8.5",               // CORS middleware
  "dotenv": "^16.3.1",            // Environment variables
  "express": "^4.18.2",           // Web framework
  "express-validator": "^7.0.1",  // Input validation
  "jsonwebtoken": "^9.0.2",       // JWT authentication
  "mongoose": "^8.0.3",           // MongoDB ODM
  "multer": "^1.4.5-lts.1"        // File upload handling
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.2"             // Auto-restart on changes
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or higher
- npm v8 or higher
- MongoDB Atlas account
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/kenil403/VibeCart-backend.git

# Navigate to project directory
cd VibeCart-backend

# Install dependencies
npm install

# Create .env file with required variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev

# Or start production server
npm start
```

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

## 🌐 Deployment on Render

### Deployment Configuration
- **Service Type:** Web Service
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 16.x or higher
- **Auto-Deploy:** Enabled from main branch

### Environment Variables (Render Dashboard)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://shahkenil278_db_user:fKPCyEuVwfKAYN4V@vibecart.p55bjnh.mongodb.net/vibecart?retryWrites=true&w=majority&appName=VibeCart
JWT_SECRET=6e9f87c095a2fdd2286f4af21187cc8081756b8fed3a60ab895c2664ac60e10d9528da6f17b0172473f4b051f3ce33d8fb9c01b398cecb4971350e397f8b9e40
```

### Deployment URL
- **Production:** https://vibecart-backend.onrender.com
- **API Base:** https://vibecart-backend.onrender.com/api
- **Health Check:** https://vibecart-backend.onrender.com/api/health

## 🔍 Middleware Stack

### Global Middleware
1. **CORS** - Allows cross-origin requests
2. **Body Parser (JSON)** - Parses JSON request bodies
3. **Body Parser (URL-encoded)** - Parses form data
4. **Static Files** - Serves uploaded images from `/uploads`

### Route-specific Middleware
1. **Auth Middleware** - Verifies JWT tokens for protected routes
2. **Validation Middleware** - Validates input data
3. **Multer** - Handles multipart/form-data for file uploads

## 📊 Error Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "msg": "Validation error message" }
  ]
}
```

## 🐛 Known Issues & Solutions

### Issue 1: MongoDB Connection Timeout
**Problem:** Connection timeouts on startup
**Solution:** ✅ Increased timeout settings and added better error logging

### Issue 2: Duplicate Connection Handlers
**Problem:** Multiple event listeners causing confusion
**Solution:** ✅ Consolidated connection event handlers

### Issue 3: Images Not Persisting
**Problem:** Render's ephemeral storage deletes uploads
**Solution:** ✅ Convert images to Base64 and store in MongoDB

### Issue 4: JWT Token Invalidation
**Problem:** Changing JWT secret invalidates all tokens
**Solution:** ✅ Users need to clear localStorage and re-login

## 📈 Performance Optimizations

### Implemented
- **Database Indexing** on frequently queried fields
- **Mongoose Lean Queries** for read-only operations
- **Connection Pooling** with Mongoose
- **Gzip Compression** (planned)
- **Rate Limiting** (planned)

### Recommended
- Implement Redis for caching
- Add database query optimization
- Implement pagination for large datasets
- Add API rate limiting
- Implement request logging with Winston

## 🧪 Testing

### Test Coverage (Planned)
- Unit tests with Jest
- Integration tests for API endpoints
- Database tests with MongoDB Memory Server
- Authentication flow tests
- Error handling tests

## 📝 Code Quality

### Standards
- **ESLint** configuration
- **Async/Await** for asynchronous operations
- **Try-Catch** blocks for error handling
- **Consistent Naming** conventions
- **Modular Structure** with separate routes and models

## 🔄 Database Operations

### Mongoose Features Used
- **Schema Validation** with built-in validators
- **Pre-save Hooks** for password hashing
- **Virtual Properties** (planned)
- **Population** for referenced documents
- **Timestamps** for createdAt/updatedAt

## 🎯 Future Enhancements

### Planned Features
- [ ] Order Management System
- [ ] Payment Gateway Integration
- [ ] Email Service (SendGrid/Nodemailer)
- [ ] SMS Notifications (Twilio)
- [ ] Product Reviews & Ratings
- [ ] Advanced Search with Elasticsearch
- [ ] Real-time Notifications (Socket.io)
- [ ] Admin Dashboard API
- [ ] Analytics & Reporting
- [ ] Inventory Management
- [ ] Discount/Coupon System
- [ ] Multi-vendor Support

### Technical Improvements
- [ ] GraphQL API (alternative to REST)
- [ ] Microservices Architecture
- [ ] Redis Caching
- [ ] Docker Containerization
- [ ] Kubernetes Orchestration
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] API Versioning
- [ ] Swagger/OpenAPI Documentation
- [ ] WebSocket Support
- [ ] Rate Limiting with Express-rate-limit
- [ ] Request Logging with Morgan
- [ ] Database Migrations

## 📊 Monitoring & Logging

### Current Status
- Basic console logging
- MongoDB connection status
- Error logging to console

### Planned Improvements
- Winston for structured logging
- Log levels (error, warn, info, debug)
- Log file rotation
- APM tools (New Relic, Datadog)
- Error tracking (Sentry)

## 🔐 Environment-specific Configuration

### Development
```javascript
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vibecart
```

### Production (Render)
```javascript
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secure-production-secret
```

## 📞 API Usage Examples

### Register User
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Product
```bash
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 30000,
  "category": "Electronics",
  "image": "data:image/jpeg;base64,...",
  "stock": 10,
  "isPublic": true
}
```

### Add to Cart
```bash
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support & Contact
- **GitHub Issues:** https://github.com/kenil403/VibeCart-backend/issues
- **Repository:** https://github.com/kenil403/VibeCart-backend
- **Frontend Repo:** https://github.com/kenil403/VibeCart-frontend

## 📄 License
This project is private and proprietary.

## 🙏 Acknowledgments
- Express.js team for robust framework
- MongoDB team for excellent database
- JWT.io for authentication standard
- Render for hosting platform
- GitHub for version control

---

**Last Updated:** November 6, 2025
**Version:** 1.0.0
**Status:** Production (Deployed on Render)
**Deployment URL:** https://vibecart-backend.onrender.com
