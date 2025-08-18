import React from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    // Only close if clicking on the backdrop, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
        {title && (
          <div className="border-b px-4 py-3 font-semibold">{title}</div>
        )}
        <div className="p-4">{children}</div>
        {footer && (
          <div className="border-t px-4 py-3 flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
