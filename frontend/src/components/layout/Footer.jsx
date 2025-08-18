import React from "react";
export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-6 text-sm text-gray-600">
        © {new Date().getFullYear()} MERNShop. All rights reserved.
      </div>
    </footer>
  );
}
