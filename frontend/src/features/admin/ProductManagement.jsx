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

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.product);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    image: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files.length > 0) {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);
    try {
      if (editingId) {
        console.log("Updating product:", editingId, form);
        await dispatch(updateProduct({ id: editingId, body: form })).unwrap();
        toast.success("Product updated successfully!");
      } else {
        console.log("Creating product:", form);
        await dispatch(createProduct(form)).unwrap();
        toast.success("Product created successfully!");
      }
      setForm({
        name: "",
        price: "",
        category: "",
        stock: "",
        description: "",
        image: "",
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
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description,
      image: "",
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
      image: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
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

      {loading ? (
        <Loader />
      ) : (
        <table className="w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Stock</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p._id}>
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
            {products?.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
              Product Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500">
              Click to choose an image file (JPG, PNG, JPEG). Max size: 5MB
            </p>
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
