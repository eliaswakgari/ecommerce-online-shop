import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth.js";
import UserAvatar from "../ui/UserAvatar.jsx";
import { logout } from "../../features/auth/authSlice.js";
import { fetchCart } from "../../features/cart/cartSlice.js";
import { fetchCategories, setFilters } from "../../features/product/productSlice.js";
import { FaShoppingCart } from "react-icons/fa";

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const cart = useSelector((s) => s.cart || {});
  const cartCount = (cart.items || []).reduce((total, item) => {
    const quantity = Number(item.quantity ?? item.qty ?? 0) || 0;
    return total + quantity;
  }, 0);
  const categories = useSelector((s) => s.product?.categories || []);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch cart when user changes or component mounts
    if (user) {
      dispatch(fetchCart());
    }
    dispatch(fetchCategories());
  }, [dispatch, user]);

  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  const handleSelectCategory = (value) => {
    setCategoryOpen(false);
    setSidebarOpen(false);
    dispatch(setFilters({ category: value || undefined, page: 1 }));
    navigate("/products");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto container-mobile h-14 sm:h-16 lg:h-18 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-lg sm:text-xl lg:text-2xl font-bold">
          MERN<span className="text-blue-600">Shop</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Categories Dropdown */}
          {!isAdmin && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
              >
                Categories
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.939a.75.75 0 111.08 1.04l-4.25 4.514a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {categoryOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg p-2 max-h-56 overflow-auto w-40">
                  <button
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                    onClick={() => handleSelectCategory("")}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                      onClick={() => handleSelectCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Links */}
          {!isAdmin && (
            <>
              <NavLink to="/products" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-700"}>
                Shop
              </NavLink>
              {user && (
                <NavLink to="/orders" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-700"}>
                  My Orders
                </NavLink>
              )}
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-700"}>
              Admin
            </NavLink>
          )}

          {/* Cart */}
          {!isAdmin && (
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaShoppingCart className="h-5 w-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center text-white bg-blue-600 px-1.5 rounded-full text-xs font-medium leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}


          {/* Auth */}
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <UserAvatar
                user={user}
                size="sm"
                onClick={() => navigate("/profile")}
              />
              <button
                onClick={() => dispatch(logout())}
                className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Cart - Show for non-admin users */}
          {!isAdmin && (
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
            >
              <FaShoppingCart className="h-5 w-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center text-white bg-blue-600 px-1.5 rounded-full text-xs font-medium leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}

          {/* Hamburger Menu */}
          <button
            className="p-2 rounded hover:bg-gray-100 transition-colors touch-target"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-80 sm:w-72 h-full bg-white z-50 shadow-xl rounded-l-2xl flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                <div className="text-lg font-bold">
                  MERN<span className="text-blue-600">Shop</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 touch-target"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Categories for non-admin users */}
                {!isAdmin && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Categories</h3>
                    <button
                      className="block w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => handleSelectCategory("")}
                    >
                      All Products
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c}
                        className="block w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => handleSelectCategory(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Navigation</h3>

                  {!isAdmin && (
                    <>
                      <NavLink
                        to="/products"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `block px-3 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-100"
                          }`
                        }
                      >
                        Shop
                      </NavLink>
                      {user && (
                        <NavLink
                          to="/orders"
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `block px-3 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-100"
                            }`
                          }
                        >
                          My Orders
                        </NavLink>
                      )}
                    </>
                  )}

                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-100"
                        }`
                      }
                    >
                      Admin Dashboard
                    </NavLink>
                  )}
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 sm:p-6 border-t space-y-4">
                {!user ? (
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate("/login");
                    }}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Login
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <UserAvatar user={user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name || user.email}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        dispatch(logout());
                      }}
                      className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );

}
