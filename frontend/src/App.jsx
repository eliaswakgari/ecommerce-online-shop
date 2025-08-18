import React from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
