import React from "react";
export default function Button({ children, className="", loading=false, ...rest }) {
  return (
    <button
      disabled={loading || rest.disabled}
      className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 ${className}`}
      {...rest}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
