const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

// Helper to generate unique SKU
const generateSKU = (category) => {
  const cleanCat = (category || 'GEN').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3);
  const prefix = cleanCat.length >= 2 ? cleanCat : 'GEN';
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `SKU-${prefix}-${randomPart}`;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.search
      ? {
          $or: [
            { productName: { $regex: req.query.search, $options: 'i' } },
            { sku: { $regex: req.query.search, $options: 'i' } }
          ]
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const status = req.query.status ? { status: req.query.status } : {};

    const queryFilter = { ...keyword, ...category, ...status, user: req.user._id };

    let sortOption = { createdAt: -1 };
    if (req.query.sortByPrice) {
      sortOption = { price: req.query.sortByPrice === 'asc' ? 1 : -1 };
    }

    const count = await Product.countDocuments(queryFilter);
    const products = await Product.find(queryFilter)
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product && product.user.toString() === req.user._id.toString()) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const { productName, description, category, price, quantity, status, sku, stockThreshold, supplierName, supplierEmail } = req.body;

    // Check if SKU exists or generate one
    let finalSku = sku;
    if (!finalSku) {
      let isUnique = false;
      while (!isUnique) {
        finalSku = generateSKU(category);
        const existing = await Product.findOne({ sku: finalSku });
        if (!existing) isUnique = true;
      }
    } else {
      // Validate SKU uniqueness
      const existing = await Product.findOne({ sku });
      if (existing) {
        res.status(400);
        throw new Error('Product SKU already exists');
      }
    }

    const product = new Product({
      productName,
      description,
      category,
      price,
      quantity,
      status,
      sku: finalSku,
      stockThreshold: stockThreshold || 10,
      supplierName: supplierName || 'N/A',
      supplierEmail,
      user: req.user._id,
    });

    const createdProduct = await product.save();

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      details: `Added new product '${productName}' (SKU: ${finalSku})`
    });

    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    const { productName, description, category, price, quantity, status, sku, stockThreshold, supplierName, supplierEmail } = req.body;

    const product = await Product.findById(req.params.id);

    if (product && product.user.toString() === req.user._id.toString()) {
      // If SKU is changed, validate uniqueness
      if (sku && sku !== product.sku) {
        const existing = await Product.findOne({ sku });
        if (existing) {
          res.status(400);
          throw new Error('Product SKU already exists');
        }
        product.sku = sku;
      }

      product.productName = productName || product.productName;
      product.description = description !== undefined ? description : product.description;
      product.category = category || product.category;
      product.price = price !== undefined ? price : product.price;
      product.quantity = quantity !== undefined ? quantity : product.quantity;
      product.status = status || product.status;
      product.stockThreshold = stockThreshold !== undefined ? stockThreshold : product.stockThreshold;
      product.supplierName = supplierName || product.supplierName;
      product.supplierEmail = supplierEmail !== undefined ? supplierEmail : product.supplierEmail;

      const updatedProduct = await product.save();

      // Log Activity
      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'UPDATE',
        details: `Updated product '${product.productName}'`
      });

      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found or user not authorized');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product && product.user.toString() === req.user._id.toString()) {
      const prodName = product.productName;
      await Product.deleteOne({ _id: req.params.id });

      // Log Activity
      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'DELETE',
        details: `Deleted product '${prodName}'`
      });

      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found or user not authorized');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
