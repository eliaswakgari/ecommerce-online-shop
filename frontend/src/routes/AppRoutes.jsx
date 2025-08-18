import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ContactPage from "../pages/ContactPage.jsx";
import ProductListingPage from "../features/product/ProductListingPage.jsx";
import ProductDetailPage from "../features/product/ProductDetailPage.jsx";
import CartPage from "../features/cart/CartPage.jsx";
import CheckoutPage from "../features/order/CheckoutPage.jsx";
import OrderConfirmationPage from "../features/order/OrderConfirmationPage.jsx";
import MyOrdersPage from "../features/order/MyOrdersPage.jsx";
import LoginForm from "../features/auth/LoginForm.jsx";
import RegisterForm from "../features/auth/RegisterForm.jsx";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../features/auth/ResetPasswordPage.jsx";
import ProfilePage from "../features/auth/ProfilePage.jsx";
import AdminDashboardPage from "../features/admin/AdminDashboardPage.jsx";
import ProductManagement from "../features/admin/ProductManagement.jsx";
import OrderManagement from "../features/admin/OrderManagement.jsx";
import CouponManagement from "../features/admin/CouponManagement.jsx";
import AnalyticsPage from "../features/admin/AnalyticsPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/products" element={<ProductListingPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />
      <Route path="/order-confirmation/:orderId" element={
        <ProtectedRoute>
          <OrderConfirmationPage />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <MyOrdersPage />
        </ProtectedRoute>
      } />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Admin routes with proper wildcard */}
      <Route path="/admin/*" element={
        <ProtectedRoute adminOnly>
          <Routes>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Routes>
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
