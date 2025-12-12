const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100 
  },
  comment: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 500 
  },
  helpful: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    helpful: { type: Boolean, required: true }
  }],
  verified: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Add helpful count virtual
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful.filter(h => h.helpful === true).length;
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Review", reviewSchema);
