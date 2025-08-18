import React, { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { getProductReviewsApi, updateReviewHelpfulApi } from "../../api/reviewApi.js";

export default function ReviewList({ productId }) {
         const [reviews, setReviews] = useState([]);
         const [loading, setLoading] = useState(false);
         const [page, setPage] = useState(1);
         const [totalPages, setTotalPages] = useState(1);
         const [total, setTotal] = useState(0);
         const { user } = useSelector(state => state.auth);

         useEffect(() => {
                  fetchReviews();
         }, [productId, page]);

         const fetchReviews = async () => {
                  try {
                           setLoading(true);
                           const response = await getProductReviewsApi(productId, page, 5);
                           setReviews(response.data.reviews);
                           setTotalPages(response.data.pages);
                           setTotal(response.data.total);
                  } catch (error) {
                           console.error("Error fetching reviews:", error);
                  } finally {
                           setLoading(false);
                  }
         };

         const handleHelpful = async (reviewId, helpful) => {
                  if (!user) {
                           alert("Please login to vote on reviews");
                           return;
                  }

                  try {
                           await updateReviewHelpfulApi(reviewId, helpful);
                           // Refresh reviews to get updated helpful counts
                           fetchReviews();
                  } catch (error) {
                           console.error("Error updating helpful status:", error);
                  }
         };

         const formatDate = (dateString) => {
                  return new Date(dateString).toLocaleDateString("en-US", {
                           year: "numeric",
                           month: "long",
                           day: "numeric"
                  });
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

         if (loading && page === 1) {
                  return (
                           <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                           </div>
                  );
         }

         if (reviews.length === 0 && page === 1) {
                  return (
                           <div className="text-center py-8 text-gray-500">
                                    <p>No reviews yet. Be the first to review this product!</p>
                           </div>
                  );
         }

         return (
                  <div className="space-y-6">
                           {/* Reviews Header */}
                           <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                             Customer Reviews ({total})
                                    </h3>
                           </div>

                           {/* Reviews List */}
                           <div className="space-y-4">
                                    {reviews.map((review) => (
                                             <div key={review._id} className="bg-white p-4 rounded-lg border shadow-sm">
                                                      {/* Review Header */}
                                                      <div className="flex items-start justify-between mb-3">
                                                               <div className="flex items-center space-x-3">
                                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                                                 {review.user?.profileImage ? (
                                                                                          <img
                                                                                                   src={review.user.profileImage}
                                                                                                   alt={review.user.name}
                                                                                                   className="w-10 h-10 rounded-full object-cover"
                                                                                          />
                                                                                 ) : (
                                                                                          <span className="text-gray-600 font-semibold">
                                                                                                   {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                                                                          </span>
                                                                                 )}
                                                                        </div>
                                                                        <div>
                                                                                 <p className="font-medium text-gray-900">{review.user?.name || "Anonymous"}</p>
                                                                                 <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                                                                        </div>
                                                               </div>
                                                               {review.verified && (
                                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                                                 Verified Purchase
                                                                        </span>
                                                               )}
                                                      </div>

                                                      {/* Rating */}
                                                      <div className="mb-3">
                                                               {renderStars(review.rating)}
                                                      </div>

                                                      {/* Review Title */}
                                                      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>

                                                      {/* Review Comment */}
                                                      <p className="text-gray-700 mb-3">{review.comment}</p>

                                                      {/* Helpful Section */}
                                                      <div className="flex items-center justify-between">
                                                               <div className="flex items-center space-x-4">
                                                                        <button
                                                                                 onClick={() => handleHelpful(review._id, true)}
                                                                                 className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                                                        >
                                                                                 <HandThumbUpIcon className="w-4 h-4" />
                                                                                 <span>Helpful ({review.helpfulCount || 0})</span>
                                                                        </button>
                                                                        <button
                                                                                 onClick={() => handleHelpful(review._id, false)}
                                                                                 className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                                                                        >
                                                                                 <HandThumbDownIcon className="w-4 h-4" />
                                                                                 <span>Not Helpful</span>
                                                                        </button>
                                                               </div>
                                                      </div>
                                             </div>
                                    ))}
                           </div>

                           {/* Pagination */}
                           {totalPages > 1 && (
                                    <div className="flex items-center justify-center space-x-2">
                                             <button
                                                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                                      disabled={page === 1}
                                                      className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                             >
                                                      Previous
                                             </button>

                                             <span className="px-3 py-2 text-sm text-gray-600">
                                                      Page {page} of {totalPages}
                                             </span>

                                             <button
                                                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                                      disabled={page === totalPages}
                                                      className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                             >
                                                      Next
                                             </button>
                                    </div>
                           )}
                  </div>
         );
}
