const asyncHandler = require("express-async-handler");
const cloudinary = require("../utils/cloudinary");

// @desc    Upload image to Cloudinary (expects JSON with base64 data URL)
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  const { imageBase64 } = req.body || {};

  console.log("Upload request (base64) received:", {
    hasBody: !!req.body,
    hasImageBase64: !!imageBase64,
    imageBase64Prefix: typeof imageBase64 === 'string' ? imageBase64.slice(0, 30) : null,
  });

  if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image/')) {
    res.status(400);
    throw new Error("Invalid payload. Send { imageBase64: 'data:image/...;base64,...' }");
  }

  try {
    console.log("Uploading base64 to Cloudinary...");

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'profile-images',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    console.log("Upload successful:", {
      url: result.secure_url,
      public_id: result.public_id,
      size: result.bytes
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);

    if (error.message?.includes('Invalid cloud_name') || error.message?.includes('Invalid api_key')) {
      res.status(500);
      throw new Error("Cloudinary configuration error. Please check environment variables.");
    }

    res.status(500);
    throw new Error(`Error uploading image: ${error.message}`);
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:public_id
// @access  Private
const deleteImage = asyncHandler(async (req, res) => {
  const { public_id } = req.params;

  console.log("Delete request received for public_id:", public_id);

  if (!public_id) {
    res.status(400);
    throw new Error("Public ID is required");
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);
    console.log("Delete successful:", result);
    res.json({ message: "Image deleted successfully", result });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500);
    throw new Error(`Error deleting image: ${error.message}`);
  }
});

module.exports = {
  uploadImage,
  deleteImage,
};
