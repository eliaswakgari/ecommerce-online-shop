const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");

/**
 * Upload a single buffer to Cloudinary using upload_stream.
 * Returns { url, public_id }.
 */
function uploadBufferToCloudinary(fileBuffer, folder = "products", filename = "image") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        // basic normalization/optimization
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        transformation: [{ quality: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
}

/**
 * Upload all files in req.files (if any) to Cloudinary.
 * Ensures max 5 images.
 * Returns an array of { url, public_id }.
 */
async function uploadAllFiles(files) {
  if (!files || files.length === 0) return [];
  if (files.length > 5) {
    const err = new Error("You can upload up to 5 images per product.");
    err.status = 400;
    throw err;
  }
  const uploads = files.map((f) => uploadBufferToCloudinary(f.buffer, "products", f.originalname));
  return Promise.all(uploads);
}

/**
 * Normalize images to an array of objects: [{ url, public_id }]
 * Accepts strings, objects, or mixed.
 */
function normalizeImages(images) {
  if (!images) return [];
  return images.map((img) => {
    if (typeof img === "string") return { url: img, public_id: null };
    if (img && typeof img === "object") return { url: img.url, public_id: img.public_id || null };
    return null;
  }).filter(Boolean);
}

// @desc    Get products with search, filter, pagination
// @route   GET /api/products
// @access  Public

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 1000;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  const categoryFilter = req.query.category ? { category: req.query.category } : {};

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

  const sortQuery = req.query.sort || req.query.sortBy || "newest";
  let sortValue = "-createdAt";
  if (sortQuery === "price-asc") sortValue = "price";
  else if (sortQuery === "price-desc") sortValue = "-price";
  else if (sortQuery === "newest") sortValue = "-createdAt";
  else sortValue = sortQuery;

  const count = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(sortValue);

  const productsWithImages = products.map((p) => {
    const obj = p.toObject();
    obj.images = normalizeImages(obj.images);
    return obj;
  });

  res.json({
    products: productsWithImages,
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
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  const obj = product.toObject();
  obj.images = normalizeImages(obj.images);
  res.json(obj);
});

// @desc    Create new product (uploads images to Cloudinary)
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  // Upload new images (required at least 1)
  const uploadedImages = await uploadAllFiles(req.files);
  if (uploadedImages.length === 0) {
    res.status(400);
    throw new Error("Please upload at least one product image (max 5).");
  }

  if (!name || !description || !price || !category) {
    res.status(400);
    throw new Error("Please provide all required fields (name, description, price, category).");
  }

  const product = new Product({
    name,
    description,
    price,
    category,
    images: uploadedImages, // [{url, public_id}]
    stock,
  });

  await product.save();

  const result = product.toObject();
  result.images = normalizeImages(result.images);

  res.status(201).json({
    message: "Product created successfully",
    product: result,
  });
});

// @desc    Update product (uploads new images to Cloudinary if provided)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // If new images are uploaded, replace and (optionally) purge old ones
  let images = normalizeImages(product.images);
  if (req.files && req.files.length > 0) {
    // Optional clean-up of old images on Cloudinary
    try {
      const oldPublicIds = images.map((i) => i.public_id).filter(Boolean);
      if (oldPublicIds.length) {
        // best-effort deletion; don't block update on failure
        await Promise.allSettled(oldPublicIds.map((pid) => cloudinary.uploader.destroy(pid)));
      }
    } catch (_) {}

    const uploaded = await uploadAllFiles(req.files);
    images = uploaded;
  }

  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.category = category ?? product.category;
  product.stock = typeof stock !== "undefined" ? stock : product.stock;
  product.images = images;

  const updated = await product.save();
  const obj = updated.toObject();
  obj.images = normalizeImages(obj.images);
  res.json(obj);
});

// @desc    Delete product (also cleans Cloudinary images)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // attempt to delete images from Cloudinary
  const imgs = normalizeImages(product.images);
  const pids = imgs.map((i) => i.public_id).filter(Boolean);
  if (pids.length) {
    await Promise.allSettled(pids.map((pid) => cloudinary.uploader.destroy(pid)));
  }

  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product removed", id: req.params.id });
});

// @desc    Return distinct categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category");
  categories.sort((a, b) => String(a).localeCompare(String(b)));
  res.json(categories);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
