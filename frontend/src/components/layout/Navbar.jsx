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
  const cartCount = useSelector((s) => s.cart.items.reduce((a, c) => a + c.quantity, 0));
  const categories = useSelector((s)=> s.product.categories);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Refresh cart on mount to ensure count is accurate
  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(()=>{
    function onClickOutside(e){ if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('click', onClickOutside);
    return ()=> document.removeEventListener('click', onClickOutside);
  },[]);

  const handleSelectCategory = (value)=>{
    setOpen(false);
    if (value === "") {
      dispatch(setFilters({ category: undefined, page:1 }));
      navigate('/products');
      return;
    }
    dispatch(setFilters({ category: value, page:1 }));
    navigate('/products');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold">MERN<span className="text-blue-600">Shop</span></Link>
        <nav className="flex-1">
          <ul className="flex gap-4 text-sm items-center">
            <li className="relative" ref={dropdownRef}>
              <button onClick={()=>setOpen((v)=>!v)} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
                <span>Category</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${open?"rotate-180":""}`}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </button>
              {open && (
                <div className="absolute mt-2 w-56 bg-white border rounded-xl shadow-lg p-2 z-50">
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50" onClick={()=>handleSelectCategory("")}>All</button>
                  <div className="max-h-64 overflow-auto">
                    {categories.map((c)=> (
                      <button key={c} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50" onClick={()=>handleSelectCategory(c)}>{c}</button>
                    ))}
                  </div>
                </div>
              )}
            </li>
            <li><NavLink to="/products" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-700"}>Shop</NavLink></li>
            {user && <li><NavLink to="/orders" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-700"}>My Orders</NavLink></li>}
            {isAdmin && <li><NavLink to="/admin" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-700"}>Admin</NavLink></li>}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/cart")} className="relative flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M2.25 3a.75.75 0 000 1.5h1.386c.17 0 .318.114.36.28l2.561 10.244A2.25 2.25 0 008.732 17h8.536a2.25 2.25 0 002.175-1.676l1.55-6A.75.75 0 0020.25 8H6.721l-.6-2.4A2.25 2.25 0 003.636 3H2.25z" /><path d="M8.25 20.25a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm10.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
            {cartCount > 0 && <span className="ml-1 text-white bg-blue-600 px-2 rounded-full text-xs font-medium">{cartCount}</span>}
          </button>
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3" /></svg>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
