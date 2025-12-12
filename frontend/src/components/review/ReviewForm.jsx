import React, { useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

export default function ReviewForm({ onSubmit, initialData = null, isEditing = false }) {
         const [formData, setFormData] = useState({
                  rating: initialData?.rating || 0,
                  title: initialData?.title || "",
                  comment: initialData?.comment || ""
         });
         const [hoveredRating, setHoveredRating] = useState(0);

         const handleSubmit = (e) => {
                  e.preventDefault();
                  if (formData.rating === 0) {
                           alert("Please select a rating");
                           return;
                  }
                  if (!formData.title.trim()) {
                           alert("Please enter a review title");
                           return;
                  }
                  if (!formData.comment.trim()) {
                           alert("Please enter a review comment");
                           return;
                  }
                  onSubmit(formData);
         };

         const handleRatingChange = (rating) => {
                  setFormData(prev => ({ ...prev, rating }));
         };

         const handleInputChange = (e) => {
                  const { name, value } = e.target;
                  setFormData(prev => ({ ...prev, [name]: value }));
         };

         return (
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                           <h3 className="text-lg font-semibold mb-4">
                                    {isEditing ? "Edit Your Review" : "Write a Review"}
                           </h3>

                           <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Rating Selection */}
                                    <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-2">
                                                      Rating *
                                             </label>
                                             <div className="flex items-center space-x-1">
                                                      {[1, 2, 3, 4, 5].map((star) => (
                                                               <button
                                                                        key={star}
                                                                        type="button"
                                                                        onClick={() => handleRatingChange(star)}
                                                                        onMouseEnter={() => setHoveredRating(star)}
                                                                        onMouseLeave={() => setHoveredRating(0)}
                                                                        className="text-2xl text-yellow-400 hover:text-yellow-500 transition-colors"
                                                               >
                                                                        {star <= (hoveredRating || formData.rating) ? (
                                                                                 <StarIcon className="w-8 h-8 fill-current" />
                                                                        ) : (
                                                                                 <StarOutlineIcon className="w-8 h-8 stroke-current" />
                                                                        )}
                                                               </button>
                                                      ))}
                                             </div>
                                             <p className="text-sm text-gray-500 mt-1">
                                                      {formData.rating > 0 ? `${formData.rating} out of 5 stars` : "Click to rate"}
                                             </p>
                                    </div>

                                    {/* Review Title */}
                                    <div>
                                             <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                                      Review Title *
                                             </label>
                                             <input
                                                      type="text"
                                                      id="title"
                                                      name="title"
                                                      value={formData.title}
                                                      onChange={handleInputChange}
                                                      placeholder="Summarize your experience"
                                                      maxLength={100}
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                      required
                                             />
                                             <p className="text-xs text-gray-500 mt-1">
                                                      {formData.title.length}/100 characters
                                             </p>
                                    </div>

                                    {/* Review Comment */}
                                    <div>
                                             <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                                      Review Comment *
                                             </label>
                                             <textarea
                                                      id="comment"
                                                      name="comment"
                                                      value={formData.comment}
                                                      onChange={handleInputChange}
                                                      placeholder="Share your detailed experience with this product..."
                                                      rows={4}
                                                      maxLength={500}
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                      required
                                             />
                                             <p className="text-xs text-gray-500 mt-1">
                                                      {formData.comment.length}/500 characters
                                             </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                             type="submit"
                                             className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                    >
                                             {isEditing ? "Update Review" : "Submit Review"}
                                    </button>
                           </form>
                  </div>
         );
}
