# VibeCart Backend API 🚀

RESTful API for VibeCart e-commerce platform built with Node.js, Express, and MongoDB.

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express 4.18.2** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.0.3** - ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Multer 2.0.2** - File uploads
- **Express-validator** - Input validation

## 📁 Project Structure

```
server/
├── config/
│   └── multer.js         # File upload configuration
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── models/
│   ├── User.js           # User schema
│   ├── Product.js        # Product schema
│   └── Cart.js           # Cart schema
├── routes/
│   ├── auth.js           # Authentication endpoints
│   ├── products.js       # Product CRUD endpoints
│   ├── cart.js           # Cart management endpoints
│   └── upload.js         # Image upload endpoints
├── uploads/              # Product images (gitignored)
├── .env                  # Environment variables (gitignored)
├── .env.example          # Environment template
├── package.json
└── server.js             # Main server file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kenil403/VibeCart-Server.git
   cd VibeCart-Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env and add your MongoDB URI and JWT secret
   ```

4. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

Server will run on `http://localhost:5000`

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibecart
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all public products
- `GET /api/products/my/products` - Get user's products (protected)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Cart
- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart/add` - Add item to cart (protected)
- `PUT /api/cart/update/:productId` - Update quantity (protected)
- `DELETE /api/cart/remove/:productId` - Remove item (protected)
- `DELETE /api/cart/clear` - Clear cart (protected)

### Upload
- `POST /api/upload/single` - Upload single image (protected)
- `POST /api/upload/multiple` - Upload multiple images (protected)

### Health Check
- `GET /api` - API info
- `GET /api/health` - Server health status

## 🔒 Authentication

Protected routes require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

## 📦 Scripts

```bash
npm start       # Start server in production
npm run dev     # Start with nodemon (auto-restart)
npm run server  # Alternative dev command
```

## 🌐 CORS Configuration

CORS is enabled for all origins. For production, update `server.js` to restrict origins:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

## 📝 API Testing

Test with Postman, Thunder Client, or curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Get all products
curl http://localhost:5000/api/products

# Register user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

## 🚀 Deployment

### Deploy to Railway/Render

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add environment variables in dashboard
4. Deploy!

### Deploy to Vercel

1. Add `vercel.json` configuration
2. Connect GitHub repository
3. Configure build settings
4. Add environment variables
5. Deploy

## 🔧 MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Add database user
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get connection string
6. Update `.env` with connection string

## 📊 Database Models

### User
- name, email, password (hashed)
- phone, address, profileImage
- role (user/admin)
- isActive, emailVerified, lastLogin

### Product
- name, description, price
- category, image, stock
- rating, owner (User reference)
- isPublic, createdAt, updatedAt

### Cart
- user (User reference)
- items: [{ product, quantity, price }]
- totalPrice, totalItems
- createdAt, updatedAt

## 🤝 Frontend Repository

This backend works with the VibeCart frontend:
- **Repository:** [VibeCart-Client](https://github.com/kenil403/VibeCart-Client)
- **Frontend Stack:** React, React Router, Context API, Axios

## 📄 License

ISC

## 👤 Author

**Kenil Shah**
- GitHub: [@kenil403](https://github.com/kenil403)

## 🐛 Issues

Found a bug? [Open an issue](https://github.com/kenil403/VibeCart-Server/issues)

## ⭐ Support

Give a ⭐️ if this project helped you!
