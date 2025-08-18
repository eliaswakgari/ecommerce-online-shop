/**
 * Convert relative image paths to full URLs
 * @param {Object} req - Express request object
 * @param {Array} images - Array of image paths
 * @returns {Array} Array of full image URLs
 */
const convertImageUrls = (req, images) => {
  if (!images || !Array.isArray(images)) return images;
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return images.map(img => {
    if (typeof img === 'string') {
      return img.startsWith('http') ? img : `${baseUrl}${img}`;
    }
    return img;
  });
};

/**
 * Convert product images in cart items to full URLs
 * @param {Object} req - Express request object
 * @param {Object} cart - Cart object with populated items
 * @returns {Object} Cart object with full image URLs
 */
const convertCartImageUrls = (req, cart) => {
  if (!cart || !cart.items) return cart;
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return {
    ...cart.toObject(),
    items: cart.items.map(item => ({
      ...item,
      product: item.product ? {
        ...item.product.toObject(),
        images: convertImageUrls(req, item.product.images)
      } : item.product
    }))
  };
};

module.exports = {
  convertImageUrls,
  convertCartImageUrls
};
