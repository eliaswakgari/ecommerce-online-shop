import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "../../hooks/useAuth.js";
import UserAvatar from "../ui/UserAvatar.jsx";
import { logout } from "../../features/auth/authSlice.js";
import { fetchCart } from "../../features/cart/cartSlice.js";
import { fetchCategories, setFilters } from "../../features/product/productSlice.js";

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const cartCount = useSelector((s) => (s.cart?.items || []).reduce((a, c) => a + (c.quantity || 0), 0));
  const categories = useSelector((s) => s.product?.categories || []);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Refresh cart & categories on mount
  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  const handleSelectCategory = (value) => {
    setOpen(false);
    if (value === "") {
      dispatch(setFilters({ category: undefined, page: 1 }));
      navigate("/products");
      return;
    }
    dispatch(setFilters({ category: value, page: 1 }));
    navigate("/products");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold">MERN<span className="text-blue-600">Shop</span></Link>

        <nav className="flex-1">
          <ul className="flex gap-4 text-sm items-center">
            {/* Category dropdown - hidden for admins */}
            {!isAdmin && (
              <li className="relative" ref={dropdownRef}>
                <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
                  <span>Category</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${open ? "rotate-180" : ""}`}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.939a.75.75 0 111.08 1.04l-4.25 4.514a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {open && (
                  <div className="absolute mt-2 w-56 bg-white border rounded-xl shadow-lg p-2 z-50">
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50" onClick={() => handleSelectCategory("")}>All</button>
                    <div className="max-h-64 overflow-auto">
                      {categories.map((c) => (
                        <button key={c} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50" onClick={() => handleSelectCategory(c)}>{c}</button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            )}

            {/* Shop - hide for admin */}
            {!isAdmin && (
              <li><NavLink to="/products" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-700"}>Shop</NavLink></li>
            )}

            {/* My Orders - hide for admin */}
            {!isAdmin && user && (
              <li><NavLink to="/orders" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-700"}>My Orders</NavLink></li>
            )}

            {/* Admin link for admin users */}
            {isAdmin && (
              <li><NavLink to="/admin" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-700"}>Admin</NavLink></li>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* Cart button - hide for admin */}
          {!isAdmin && (
            <button onClick={() => navigate("/cart")} className="relative flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M2.25 3a.75.75 0 000 1.5h1.386c.17 0 .318.114.36.28l2.561 10.244A2.25 2.25 0 007.75 18h8.5a2.25 2.25 0 002.189-1.976l1.06-8.48A1.5 1.5 0 0018.999 6H6.32l-.18-1.15A1.5 1.5 0 004.66 3H2.25zM7.5 20.25a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
              </svg>
              {cartCount > 0 && <span className="ml-1 text-white bg-blue-600 px-2 rounded-full text-xs font-medium">{cartCount}</span>}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <UserAvatar user={user} size="sm" />
                <NavLink to="/profile" className="text-sm text-gray-700 hover:text-blue-600">
                  {user.name}
                </NavLink>
              </div>
              <button
                onClick={() => dispatch(logout())}
                className="text-sm px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className="flex items-center gap-2 text-sm px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 12l3 3m0 0l3-3m-3 3V3"/>
              </svg>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}