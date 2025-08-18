import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchProductById } from "./productSlice.js";
import Button from "../../components/ui/Button.jsx";
import useCart from "../../hooks/useCart.js";
import formatCurrency from "../../utils/formatCurrency.js";
import ReviewModal from "../../components/review/ReviewModal.jsx";
import ReviewList from "../../components/review/ReviewList.jsx";
import { StarIcon } from "@heroicons/react/20/solid";

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current } = useSelector(s => s.product);
  const [qty, setQty] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { add } = useCart();

  useEffect(() => { dispatch(fetchProductById(id)); }, [id]);

  if (!current) return <div>Loading...</div>;

  const handleAddToCart = (reviewData = null) => {
    if (reviewData) {
      // Add to cart with review data
      add(current._id, qty, current.price, reviewData);
    } else {
      // Add to cart without review
      add(current._id, qty, current.price);
    }
  };

  const renderStars = (rating) => {
    return (
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
  };

  return (
    <div className="space-y-8">
      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <img
          src={current.images?.[0] || "https://via.placeholder.com/800x600?text=No+Image"}
          alt={current.name}
          className="w-full rounded-xl border object-cover"
        />
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{current.name}</h1>
            {/* Rating Display */}
            <div className="flex items-center space-x-2 mt-2">
              {renderStars(current.rating || 0)}
              <span className="text-sm text-gray-600">
                {current.rating || 0} out of 5 ({current.numReviews || 0} reviews)
              </span>
            </div>
          </div>
          <p className="text-gray-600">{current.description}</p>
          <div className="text-xl font-bold">{formatCurrency(current.price)}</div>
          <div className="text-sm">Stock: {current.stock > 0 ? current.stock : "Out of stock"}</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={current.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-20 border rounded px-3 py-1"
            />
            <Button
              disabled={current.stock <= 0}
              onClick={() => setShowReviewModal(true)}
            >
              Add to Cart
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
        onSubmit={handleAddToCart}
        product={current}
      />
    </div>
  );
}
