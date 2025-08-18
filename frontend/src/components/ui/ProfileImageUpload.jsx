import React, { useState, useRef } from "react";
import { uploadImageApi, deleteImageApi, fileToDataUrl } from "../../api/uploadApi.js";
import toast from "react-hot-toast";

export default function ProfileImageUpload({ currentImage, currentPublicId, onImageChange, label = "Profile Image" }) {
         const [preview, setPreview] = useState(currentImage || "");
         const [uploading, setUploading] = useState(false);
         const [publicId, setPublicId] = useState(currentPublicId || "");
         const fileInputRef = useRef(null);

         // Test upload function for debugging
         const testUpload = async (file) => {
                  try {
                           const formData = new FormData();
                           formData.append('image', file);

                           const response = await fetch('http://localhost:5000/api/upload/test', {
                                    method: 'POST',
                                    body: formData,
                                    credentials: 'include'
                           });

                           const data = await response.json();
                           console.log("Test upload response:", data);

                           if (response.ok) {
                                    toast.success('Test upload successful');
                           } else {
                                    toast.error(`Test upload failed: ${data.error}`);
                           }
                  } catch (error) {
                           console.error("Test upload error:", error);
                           toast.error('Test upload failed');
                  }
         };

         const handleFileChange = async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                           console.log("File selected:", {
                                    name: file.name,
                                    type: file.type,
                                    size: file.size,
                                    sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
                           });

                           // Validate file type
                           if (!file.type.startsWith('image/')) {
                                    toast.error('Please select an image file (JPEG, PNG, GIF, WebP)');
                                    return;
                           }

                           // Validate file size (max 5MB)
                           if (file.size > 5 * 1024 * 1024) {
                                    toast.error('Image size should be less than 5MB');
                                    return;
                           }

                           setUploading(true);
                           try {
                                    console.log("Converting file to base64...");
                                    const imageBase64 = await fileToDataUrl(file);

                                    console.log("Uploading base64 to server...");

                                    // Upload to server
                                    const response = await uploadImageApi(imageBase64);
                                    console.log("Upload response:", response.data);

                                    const { url, public_id } = response.data;

                                    if (!url || !public_id) {
                                             throw new Error("Invalid response from server");
                                    }

                                    // Update state
                                    setPreview(url);
                                    setPublicId(public_id);
                                    onImageChange(url, public_id);

                                    toast.success('Image uploaded successfully');
                           } catch (error) {
                                    console.error('Upload error:', error);

                                    let errorMessage = 'Failed to upload image';

                                    if (error.response) {
                                             // Server responded with error
                                             errorMessage = error.response.data?.message || error.response.statusText;
                                             console.error('Server error:', error.response.data);
                                    } else if (error.request) {
                                             // Network error
                                             errorMessage = 'Network error. Please check your connection.';
                                             console.error('Network error:', error.request);
                                    } else {
                                             // Other error
                                             errorMessage = error.message || 'Unknown error occurred';
                                             console.error('Other error:', error.message);
                                    }

                                    toast.error(errorMessage);
                           } finally {
                                    setUploading(false);
                           }
                  }
         };

         const handleClick = () => {
                  if (!uploading) {
                           fileInputRef.current?.click();
                  }
         };

         const removeImage = async () => {
                  if (publicId) {
                           try {
                                    console.log("Deleting image with public_id:", publicId);
                                    await deleteImageApi(publicId);
                                    toast.success('Image removed successfully');
                           } catch (error) {
                                    console.error('Delete error:', error);
                                    toast.error('Failed to remove image from server');
                           }
                  }

                  setPreview("");
                  setPublicId("");
                  onImageChange("", "");
                  if (fileInputRef.current) {
                           fileInputRef.current.value = "";
                  }
         };

         return (
                  <div className="mb-4">
                           <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

                           <div className="flex items-center space-x-4">
                                    <div className="relative">
                                             <div
                                                      className={`w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                      onClick={handleClick}
                                             >
                                                      {uploading ? (
                                                               <div className="text-gray-500 text-center">
                                                                        <div className="text-sm">Uploading...</div>
                                                                        <div className="text-xs">Please wait</div>
                                                               </div>
                                                      ) : preview ? (
                                                               <img
                                                                        src={preview}
                                                                        alt="Profile"
                                                                        className="w-full h-full rounded-full object-cover"
                                                                        onError={(e) => {
                                                                                 console.error("Image failed to load:", preview);
                                                                                 e.target.style.display = 'none';
                                                                                 e.target.nextSibling.style.display = 'block';
                                                                        }}
                                                               />
                                                      ) : (
                                                               <div className="text-gray-500 text-center">
                                                                        <div className="text-2xl">👤</div>
                                                                        <div className="text-xs mt-1">Upload</div>
                                                               </div>
                                                      )}
                                             </div>

                                             {/* Hidden file input */}
                                             <input
                                                      ref={fileInputRef}
                                                      type="file"
                                                      accept="image/*"
                                                      onChange={handleFileChange}
                                                      className="hidden"
                                                      disabled={uploading}
                                             />
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                             {preview && (
                                                      <button
                                                               type="button"
                                                               onClick={removeImage}
                                                               disabled={uploading}
                                                               className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                      >
                                                               Remove Image
                                                      </button>
                                             )}

                                             {!preview && (
                                                      <button
                                                               type="button"
                                                               onClick={handleClick}
                                                               disabled={uploading}
                                                               className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                      >
                                                               {uploading ? 'Uploading...' : 'Upload Image'}
                                                      </button>
                                             )}

                                             {/* Debug test button */}
                                             <button
                                                      type="button"
                                                      onClick={() => {
                                                               const file = fileInputRef.current?.files[0];
                                                               if (file) {
                                                                        testUpload(file);
                                                               } else {
                                                                        toast.error('Please select a file first');
                                                               }
                                                      }}
                                                      className="text-xs text-gray-500 hover:text-gray-700"
                                             >
                                                      Test Upload
                                             </button>
                                    </div>
                           </div>

                           {/* File requirements info */}
                           <div className="mt-2 text-xs text-gray-500">
                                    <p>Supported formats: JPEG, PNG, GIF, WebP</p>
                                    <p>Maximum size: 5MB</p>
                           </div>
                  </div>
         );
}
