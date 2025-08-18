import React, { useState } from "react";

export default function Input({ label, error, type = "text", ...rest }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block mb-3">
      {label && <span className="block mb-1 text-sm text-gray-700">{label}</span>}
      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          className={`w-full border rounded px-3 py-2 outline-none focus:ring ${error ? "border-red-500" : "border-gray-300"} ${isPassword ? "pr-10" : ""}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-bold"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
