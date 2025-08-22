import React, { useEffect, useState} from "react";
import { useDispatch,useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchProductById } from "./productSlice.js";
import Button from "../../components/ui/Button.jsx";
import useCart from "../../hooks/useCart.js";
import formatCurrency from "../../utils/formatCurrency.js";
import ReviewModal from "../../components/review/ReviewModal.jsx";
import ReviewList from "../../components/review/ReviewList.jsx";
import { StarIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { add, refresh } = useCart();

  const { current } = useSelector((s) => s.product);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

  if (!current) return <div>Loading...</div>;

  const handleAddToCart = async (reviewData = null) => {
    try {
      // use correct signature expected by useCart.add
      await add({
        productId: current._id,
        quantity: Number(qty) || 1,
        price: current.price,
        product: current,
        reviewData: reviewData || undefined,
      });

      // Refresh cart so Navbar badge count updates (defensive)
      try { await refresh(); } catch (e) { /* ignore refresh errors */ }

      toast.success("Added to cart");
      // close modal if it was used
      setShowReviewModal(false);
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Failed to add to cart");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
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
          src={(current.images && current.images[0]) || "https://via.placeholder.com/800x600?text=No+Image"}
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
              max={current.stock || 9999}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
              className="w-20 border rounded px-3 py-1"
            />

            {/* Primary action: immediate add to cart */}
            <Button
              disabled={current.stock <= 0}
              onClick={() => handleAddToCart(null)}
            >
              Add to Cart
            </Button>

            {/* Optional: open modal for Add + Review */}
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
        onSubmit={(reviewData) => handleAddToCart(reviewData)}
        product={current}
      />
    </div>
  );
}