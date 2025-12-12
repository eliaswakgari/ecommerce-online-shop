const express = require("express");
const { uploadImage, deleteImage } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Environment check route (no auth required for debugging)
router.get("/config", (req, res) => {
  const config = {
    cloudinary: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
    },
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  console.log("Upload config check:", config);
  res.json(config);
});

// Test upload route (no auth required for debugging)
router.post("/test", (req, res) => {
  console.log("Test upload received:", {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {}),
  });
  
  if (!req.body || (!req.body.imageBase64 && !req.body.image)) {
    return res.status(400).json({ error: "No image provided" });
  }
  
  res.json({
    message: "Test upload successful",
    info: req.body.imageBase64 ? "Received base64" : "Received JSON"
  });
});

// Protected upload routes (no multer, expect base64 body)
router.post("/image", protect, uploadImage);
router.delete("/image/:public_id", protect, deleteImage);

module.exports = router;
