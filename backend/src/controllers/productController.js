const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const { convertImageUrls } = require("../utils/imageUtils");
//KPv3QB5MhKh:aaG password of wakgarielias70@gmail.com
// @desc    Get products with search, filter, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        name: { $regex: req.query.keyword, $options: "i" },
      }
    : {};

  const categoryFilter = req.query.category ? { category: req.query.category } : {};

  // For price and rating filter:
  const priceFilter = {};
  if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
  const ratingFilter = req.query.minRating ? { rating: { $gte: Number(req.query.minRating) } } : {};

  const filters = {
    ...keyword,
    ...categoryFilter,
    ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
    ...ratingFilter,
  };

  // Support both `sort` (frontend) and `sortBy` (legacy) query params
  const sortQuery = req.query.sort || req.query.sortBy || "newest";
  let sortValue = "-createdAt"; // default newest first
  if (sortQuery === "price-asc") sortValue = "price";
  else if (sortQuery === "price-desc") sortValue = "-price";
  else if (sortQuery === "newest") sortValue = "-createdAt";
  else sortValue = sortQuery; // allow passing raw mongoose sort string

  const count = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(sortValue);

  // Convert relative image paths to full URLs
  const productsWithFullUrls = products.map(product => ({
    ...product.toObject(),
    images: convertImageUrls(req, product.images)
  }));

  res.json({
    products: productsWithFullUrls,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Convert relative image paths to full URLs
    const productWithFullUrls = {
      ...product.toObject(),
      images: convertImageUrls(req, product.images)
    };
    
    res.json(productWithFullUrls);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  // Extract image URLs from multer files
  const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  const product = new Product({
    name,
    description,
    price,
    category,
    images: imageUrls,
    stock,
  });

  await product.save();
  res.status(201).json({
    message: 'Product created successfully',
    product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Extract image URLs from multer files if new images are uploaded
  const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : product.images;

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.category = category || product.category;
  product.images = imageUrls;
  product.stock = stock !== undefined ? stock : product.stock;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product removed", id: req.params.id });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // New: return distinct categories from DB
  getCategories: asyncHandler(async (req, res) => {
    const categories = await Product.distinct("category");
    categories.sort((a, b) => String(a).localeCompare(String(b)));
    res.json(categories);
  })
};
