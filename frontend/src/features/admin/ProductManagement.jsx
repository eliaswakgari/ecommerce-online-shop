// src/features/admin/ProductManagement.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  adminCreateProduct as createProduct,
  adminUpdateProduct as updateProduct,
  adminDeleteProduct as deleteProduct
} from "../product/productSlice";
import toast from "react-hot-toast";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";

const MAX_IMAGES = 5;

const placeholder =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='90' viewBox='0 0 120 90'><rect fill='%23f3f4f6' width='120' height='90'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='12'>No Image</text></svg>";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.product);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    // images will hold File objects when selected
    images: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState("newest");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images" && files) {
      const selected = Array.from(files).slice(0, MAX_IMAGES);
      setForm((prev) => ({ ...prev, images: selected }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const removePreview = (index) => {
    setForm((prev) => {
      const copy = [...prev.images];
      copy.splice(index, 1);
      return { ...prev, images: copy };
    });
  };

  const buildPayload = async () => {
    // If there are image files selected, build FormData for multipart upload.
    const hasFiles = form.images && form.images.length > 0;
    if (!hasFiles) {
      // plain object payload (JSON)
      return {
        isFormData: false,
        body: {
          name: form.name,
          price: Number(form.price),
          category: form.category,
          stock: Number(form.stock),
          description: form.description,
        },
      };
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", String(form.price));
    fd.append("category", form.category);
    fd.append("stock", String(form.stock));
    fd.append("description", form.description);
    // append each file as 'images' (backend should accept array)
    form.images.forEach((file) => fd.append("images", file));
    return { isFormData: true, body: fd };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);
    try {
      const payload = await buildPayload();
      if (editingId) {
        console.log("Updating product:", editingId, form);
        // pass FormData or JSON object according to payload
        await dispatch(updateProduct({ id: editingId, body: payload.body, isFormData: payload.isFormData })).unwrap();
        toast.success("Product updated successfully!");
      } else {
        console.log("Creating product:", form);
        await dispatch(createProduct(payload.isFormData ? payload.body : payload.body)).unwrap();
        toast.success("Product created successfully!");
      }
      setForm({
        name: "",
        price: "",
        category: "",
        stock: "",
        description: "",
        images: [],
      });
      setEditingId(null);
      setShowForm(false);
      // Refresh the products list
      dispatch(fetchProducts());
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error(err?.message || "Error saving product");
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name ?? "",
      price: product.price ?? "",
      category: product.category ?? "",
      stock: product.stock ?? "",
      description: product.description ?? "",
      images: [], // user can add new images; existing images are shown in table as thumbnails
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    console.log("Deleting product:", deleteId);
    try {
      await dispatch(deleteProduct(deleteId)).unwrap();
      toast.success("Product deleted successfully!");
      setDeleteId(null);
      // Refresh the products list
      dispatch(fetchProducts());
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error(err?.message || "Error deleting product");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      stock: "",
      description: "",
      images: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Sorting/filtering helper
  const getSortedProducts = () => {
    const arr = Array.isArray(products) ? [...products] : [];
    switch (filter) {
      case "price-asc":
        return arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case "price-desc":
        return arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case "stock-asc":
        return arr.sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));
      case "stock-desc":
        return arr.sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0));
      case "newest":
      default:
        // try to use createdAt, fallback to _id (objectId sortable)
        return arr.sort((a, b) => {
          if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
          if (a._id && b._id) return String(b._id).localeCompare(String(a._id));
          return 0;
        });
    }
  };

  const thumbFor = (p) => {
    // Prefer array of images, then single image fields
    const src =
      (p.images && p.images.length > 0 && (typeof p.images[0] === "string" ? p.images[0] : p.images[0]?.url)) ||
      p.image ||
      p.imageUrl ||
      p.thumbnail ||
      "";
    return src || placeholder;
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
            </select>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Image</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Stock</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts?.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-2 border">
                    <img
                      src={thumbFor(p)}
                      alt={p.name}
                      className="w-16 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = placeholder;
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 border">{p.name}</td>
                  <td className="px-4 py-2 border">${p.price}</td>
                  <td className="px-4 py-2 border">{p.category}</td>
                  <td className="px-4 py-2 border">{p.stock}</td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(p._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sortedProducts?.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={resetForm}>
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Edit Product" : "Add Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            required
            min="0"
            className="w-full border p-2 rounded"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows="3"
          ></textarea>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Images (up to {MAX_IMAGES})
            </label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="w-full p-2 rounded border"
            />
            <p className="text-xs text-gray-500">
              You can upload up to {MAX_IMAGES} images. Selected images will be uploaded and replace or add to existing product images (depending on backend logic).
            </p>

            {/* Previews */}
            {form.images && form.images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {form.images.map((file, idx) => {
                  const url = typeof file === "string" ? file : URL.createObjectURL(file);
                  return (
                    <div key={idx} className="relative w-20 h-16 rounded overflow-hidden border">
                      <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePreview(idx)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
        <h2 className="text-lg font-semibold mb-4">
          Are you sure you want to delete this product?
        </h2>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setDeleteId(null)}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManagement;