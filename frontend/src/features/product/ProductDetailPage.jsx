import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, fetchProducts } from "./productSlice.js";
import Button from "../../components/ui/Button.jsx";
import useCart from "../../hooks/useCart.js";
import formatCurrency from "../../utils/formatCurrency.js";
import ReviewModal from "../../components/review/ReviewModal.jsx";
import ReviewList from "../../components/review/ReviewList.jsx";
import { StarIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { createReviewApi } from "../../api/reviewApi.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [mainImage, setMainImage] = useState(""); // track selected image
  const { add, refresh } = useCart();

  const { current, filters } = useSelector((s) => s.product);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (current?.images?.length) {
      setMainImage(current.images[0].url || current.images[0]); // first image as default
    }
  }, [current]);

  if (!current) return <div>Loading...</div>;

  // Add product to cart only (no review logic here)
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please log in to add items to your cart");
      navigate("/login");
      return;
    }
    console.log('🛒 Add to Cart clicked:', {
      productId: current._id,
      productName: current.name,
      quantity: Number(qty) || 1,
      price: current.price,
    });

    try {
      await add({
        productId: current._id,
        quantity: Number(qty) || 1,
        price: current.price,
        product: current,
      });

      toast.success(`Added ${current.name} to cart`);

      console.log('✅ Successfully added to cart');
    } catch (err) {
      console.error('❌ Add to cart failed:', err);
      toast.error("Failed to add to cart");
    }
  };

  // Submit or update a review without modifying the cart
  const handleSubmitReview = async (reviewData) => {
    if (!user) {
      toast.error("Please log in to submit a review");
      navigate("/login");
      return;
    }

    if (!current?._id) return;

    try {
      await createReviewApi({
        productId: current._id,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
      });

      toast.success("Review submitted successfully");
      setShowReviewModal(false);

      // Refresh product details to get updated average rating & count
      dispatch(fetchProductById(current._id));
      // Also refresh product list so cards reflect latest rating
      dispatch(fetchProducts(filters));
    } catch (err) {
      console.error('❌ Review submission failed:', err);
      toast.error("Failed to submit review");
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div>
          {/* Main Image */}
          <img
            src={
              mainImage || "https://via.placeholder.com/800x600?text=No+Image"
            }
            alt={current.name}
            className="w-full h-96 rounded-xl border object-contain"
          />

          {/* Thumbnails */}
          <div className="flex gap-2 mt-3">
            {current.images?.map((img, idx) => {
              const url = img.url || img;
              return (
                <img
                  key={idx}
                  src={url}
                  alt={`thumb-${idx}`}
                  onClick={() => setMainImage(url)}
                  className={`w-20 h-20 object-cover rounded border cursor-pointer transition 
                    ${mainImage === url ? "ring-2 ring-blue-500" : ""}`}
                />
              );
            })}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{current.name}</h1>
            <div className="flex items-center space-x-2 mt-2">
              {renderStars(current.rating || 0)}
              <span className="text-sm text-gray-600">
                {current.rating || 0} out of 5 ({current.numReviews || 0} reviews)
              </span>
            </div>
          </div>
          <p className="text-gray-600">{current.description}</p>
          <div className="text-xl font-bold">{formatCurrency(current.price)}</div>
          <div className="text-sm">
            Stock: {current.stock > 0 ? current.stock : "Out of stock"}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={current.stock || 9999}
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, Number(e.target.value || 1)))
              }
              className="w-20 border rounded px-3 py-1"
            />

            <Button
              disabled={current.stock <= 0}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowReviewModal(true)}
              disabled={current.stock <= 0}
            >
              Add & Review
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-8">
        <ReviewList productId={current._id} />
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        product={current}
      />
    </div>
  );
}
