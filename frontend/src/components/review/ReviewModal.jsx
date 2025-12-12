import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ReviewForm from "./ReviewForm.jsx";

export default function ReviewModal({ isOpen, onClose, onSubmit, product, initialData = null }) {
         const [showReviewForm, setShowReviewForm] = useState(false);

         if (!isOpen) return null;

         const handleSubmit = (reviewData) => {
                  onSubmit(reviewData);
                  setShowReviewForm(false);
                  onClose();
         };

         const handleSkip = () => {
                  onClose();
         };

         return (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                           <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-4 border-b">
                                             <h2 className="text-xl font-semibold">Add Review</h2>
                                             <button
                                                      onClick={onClose}
                                                      className="text-gray-400 hover:text-gray-600 transition-colors"
                                             >
                                                      <XMarkIcon className="w-6 h-6" />
                                             </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                             {!showReviewForm ? (
                                                      <div className="text-center space-y-4">
                                                               <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                                        </svg>
                                                               </div>

                                                               <h3 className="text-lg font-medium text-gray-900">
                                                                        How was your experience with {product?.name}?
                                                               </h3>

                                                               <p className="text-gray-600">
                                                                        Share your thoughts to help other customers make informed decisions.
                                                               </p>

                                                               <div className="flex space-x-3 pt-4">
                                                                        <button
                                                                                 onClick={() => setShowReviewForm(true)}
                                                                                 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                                                        >
                                                                                 Write Review
                                                                        </button>
                                                                        <button
                                                                                 onClick={handleSkip}
                                                                                 className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                                                        >
                                                                                 Skip for Now
                                                                        </button>
                                                               </div>
                                                      </div>
                                             ) : (
                                                      <ReviewForm
                                                               onSubmit={handleSubmit}
                                                               initialData={initialData}
                                                               isEditing={!!initialData}
                                                      />
                                             )}
                                    </div>
                           </div>
                  </div>
         );
}
