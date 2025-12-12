import React from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

export default function App() {
  const location = useLocation();
  const hideFooterRoutes = ['/login', '/register', '/forgot-password'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname) || 
                          location.pathname.startsWith('/reset-password');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto container-mobile py-4 sm:py-6 lg:py-8">
        <AppRoutes />
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}
