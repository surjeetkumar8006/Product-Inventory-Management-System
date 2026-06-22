const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Please add a product name'],
    minlength: [3, 'Product name must be at least 3 characters long']
  },
  description: {
    type: String
  },
  category: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0.01, 'Price must be greater than zero']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  sku: {
    type: String,
    required: [true, 'Please add a SKU'],
    unique: true
  },
  stockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Threshold cannot be negative']
  },
  supplierName: {
    type: String,
    default: 'N/A'
  },
  supplierEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid supplier email'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
