import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, getProfile } from "./authSlice.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaGoogle, FaEye, FaEyeSlash, FaLock, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { user, loading } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user?.role) {
      if (user.role.toLowerCase() === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(state?.from?.pathname || "/", { replace: true });
      }
    }
  }, [user, navigate, state]);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  // Check for auth success in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      dispatch(getProfile());
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (urlParams.get('error')) {
      console.error('Authentication error:', urlParams.get('error'));
      setIsGoogleLoading(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await dispatch(login(form)).unwrap();
      if (loggedInUser.role?.toLowerCase() === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(state?.from?.pathname || "/", { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 container-mobile py-8 sm:py-12">
      <div className="max-w-sm sm:max-w-md w-full space-mobile-y">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse">
            <FaShieldAlt className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h2 className="text-responsive-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-responsive-base text-gray-600">
            Sign in to your account to continue shopping
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 transform hover:scale-[1.02] transition-all duration-500 hover:shadow-3xl">
          <form onSubmit={submit} className="space-y-4 sm:space-y-6">
            {/* Email Input */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 backdrop-blur-sm transition-all duration-300 hover:bg-white focus:bg-white placeholder-gray-500 text-gray-800 font-medium text-sm sm:text-base touch-target"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 backdrop-blur-sm transition-all duration-300 hover:bg-white focus:bg-white placeholder-gray-500 text-gray-800 font-medium text-sm sm:text-base touch-target"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:text-blue-600 transition-all duration-200 transform hover:scale-110 touch-target"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden py-3 sm:py-4 px-4 sm:px-6 border border-transparent text-base sm:text-lg font-bold rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl touch-target"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm sm:text-base">Signing You In...</span>
                </div>
              ) : (
                <span className="relative flex items-center justify-center">
                  <FaLock className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Sign In to Your Account</span>
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-4 sm:px-6 bg-white text-gray-500 font-bold rounded-full border-2 border-gray-200">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="group relative w-full flex justify-center items-center gap-3 sm:gap-4 py-3 sm:py-4 px-4 sm:px-6 border-2 border-gray-200 rounded-lg sm:rounded-xl text-gray-700 bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-300 hover:border-red-300 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden touch-target"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300 relative z-10" 
              />
              <span className="font-bold text-sm sm:text-lg relative z-10">
                {isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
              </span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center">
              <Link 
                to="/forgot-password" 
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-bold hover:underline transition-all duration-200 transform hover:scale-105 touch-target"
              >
                Forgot your password?
              </Link>
            </div>
            
            <div className="text-center pt-4 sm:pt-6 border-t-2 border-gray-100">
              <p className="text-xs sm:text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all duration-200 transform hover:scale-105 inline-block"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators
        <div className="text-center">
          <div className="flex justify-center items-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-sm font-bold">Secure Login</span>
            </div>
            <div className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg" style={{animationDelay: '150ms'}}></div>
              <span className="text-sm font-bold">256-bit SSL</span>
            </div>
            <div className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg" style={{animationDelay: '300ms'}}></div>
              <span className="text-sm font-bold">GDPR Compliant</span>
            </div>
          </div>
        </div> */}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5);
        }
        
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          background-size: 200px 100%;
        }
      `}</style>
    </div>
  );
}
