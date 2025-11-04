const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot exceed 100'],
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity, price) {
  const existingItem = this.items.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
    if (existingItem.quantity > 100) existingItem.quantity = 100;
  } else {
    this.items.push({ product: productId, quantity, price });
  }
  
  return await this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  const item = this.items.find(item => item.product.toString() === productId.toString());
  
  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(item => item.product.toString() !== productId.toString());
    } else {
      item.quantity = Math.min(quantity, 100);
    }
    return await this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  return await this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  return await this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
