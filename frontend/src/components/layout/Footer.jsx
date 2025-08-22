import React from "react";
import { Link } from "react-router-dom";

/**
 * Footer component
 * - variant: "dark" (default) or "light"
 *   - dark: tall, ecommerce-style dark footer that matches the existing "MERNShop" dark-themed aesthetic
 *   - light: lighter/white variant suitable for pages with dark headers
 *
 * Usage:
 * <Footer />                 // dark (default)
 * <Footer variant="light" /> // white/light variant
 */
export default function Footer({ variant = "dark" }) {
  const year = new Date().getFullYear();
  const isLight = variant === "light";

  const containerClass = isLight
    ? "bg-white text-gray-800 border-t"
    : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white";

  const headingClass = isLight ? "text-gray-900" : "text-white";
  const subTextClass = isLight ? "text-gray-600" : "text-gray-300";
  const linkClass = isLight ? "text-gray-700 hover:underline" : "text-gray-300 hover:underline";
  const inputClass = isLight
    ? "w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    : "w-full px-3 py-2 rounded-md bg-white/6 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <footer className={`${containerClass}`}>
      <div className="container mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand / Social */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className={`${isLight ? "bg-blue-50" : "bg-white/10"} rounded-full p-3`}>
                <svg className={`${isLight ? "w-8 h-8 text-blue-600" : "w-8 h-8 text-white"}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M3 7a1 1 0 011-1h16a1 1 0 011 1v9a3 3 0 01-3 3h-1a3 3 0 01-3-3H7a3 3 0 01-3 3H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 7l2-3h14l2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg tracking-wide">MERNShop</div>
                <div className="text-xs" style={{ color: isLight ? "#475569" : "#CBD5E1" }}>Quality products, delivered fast</div>
              </div>
            </Link>

            <p className={`text-sm max-w-xs ${subTextClass}`}>
              Trusted online store for electronics, fashion, home goods and more. Fast shipping, easy returns and 24/7 support.
            </p>

            <div className="flex items-center gap-3">
              <a aria-label="Facebook" className={`${isLight ? "bg-gray-100 hover:bg-gray-200" : "bg-white/6 hover:bg-white/12"} p-2 rounded`} href="#" onClick={(e) => e.preventDefault()}>
                <svg className={`${isLight ? "w-5 h-5 text-blue-600" : "w-5 h-5 text-white"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7H8.9v-2.9h1.6V9.3c0-1.6 1-2.5 2.4-2.5.7 0 1.4.1 1.4.1v1.6h-.8c-.8 0-1 0-1 1v1.1h1.7l-.3 2.9h-1.4v7A10 10 0 0022 12z" /></svg>
              </a>
              <a aria-label="Twitter" className={`${isLight ? "bg-gray-100 hover:bg-gray-200" : "bg-white/6 hover:bg-white/12"} p-2 rounded`} href="#" onClick={(e) => e.preventDefault()}>
                <svg className={`${isLight ? "w-5 h-5 text-blue-600" : "w-5 h-5 text-white"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.8c-.6.3-1.3.6-2 .7.7-.4 1.3-1 1.6-1.8-.7.4-1.5.7-2.3.9C18.2 4.6 17 4 15.7 4c-1.9 0-3.5 1.6-3.5 3.6 0 .3 0 .7.1 1C8.3 8.5 5.6 6.8 3.8 4.1c-.3.6-.5 1.3-.5 2 0 1.2.6 2.3 1.5 2.9-.6 0-1.2-.2-1.7-.5v.1c0 1.7 1.2 3.1 2.8 3.4-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.2 3.1 2.2-1.1.9-2.5 1.4-4.1 1.4H4c1.5.9 3.3 1.5 5.2 1.5 6.3 0 9.7-5.5 9.7-10.3v-.5c.7-.5 1.3-1.1 1.8-1.8-.6.3-1.3.5-2 .6z"/></svg>
              </a>
              <a aria-label="Instagram" className={`${isLight ? "bg-gray-100 hover:bg-gray-200" : "bg-white/6 hover:bg-white/12"} p-2 rounded`} href="#" onClick={(e) => e.preventDefault()}>
                <svg className={`${isLight ? "w-5 h-5 text-blue-600" : "w-5 h-5 text-white"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.3a4.7 4.7 0 100 9.4 4.7 4.7 0 000-9.4zM18 7.5a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className={`font-semibold mb-3 ${headingClass}`}>Shop</h3>
            <ul className="space-y-2 text-sm" style={{ color: isLight ? "#475569" : undefined }}>
              <li><Link to="/products" className={linkClass}>Browse All Products</Link></li>
              <li><Link to="/products" className={linkClass}>Deals & Offers</Link></li>
              <li><Link to="/products" className={linkClass}>Categories</Link></li>
              <li><Link to="/products" className={linkClass}>New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className={`font-semibold mb-3 ${headingClass}`}>Customer Service</h3>
            <ul className="space-y-2 text-sm" style={{ color: isLight ? "#475569" : undefined }}>
              <li><Link to="/contact" className={linkClass}>Contact Us</Link></li>
              <li><Link to="/returns" className={linkClass}>Returns & Refunds</Link></li>
              <li><Link to="/shipping" className={linkClass}>Shipping Info</Link></li>
              <li><Link to="/faq" className={linkClass}>Help Center / FAQ</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className={`font-semibold mb-3 ${headingClass}`}>About</h3>
            <ul className="space-y-2 text-sm" style={{ color: isLight ? "#475569" : undefined }}>
              <li><Link to="/about" className={linkClass}>About Us</Link></li>
              <li><Link to="/careers" className={linkClass}>Careers</Link></li>
              <li><Link to="/press" className={linkClass}>Press</Link></li>
              <li><Link to="/privacy" className={linkClass}>Privacy & Policies</Link></li>
            </ul>
          </div>

          {/* Newsletter & Payments */}
          <div>
            <h3 className={`font-semibold mb-3 ${headingClass}`}>Join Our Newsletter</h3>
            <p className={`text-sm mb-4 ${subTextClass}`}>Get exclusive deals, new arrivals and shopping tips — delivered weekly.</p>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input id="footer-email" name="email" type="email" placeholder="Your email" required
                className={inputClass} />
              <button type="submit" className={`${isLight ? "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium" : "px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white font-medium"}`}>
                Subscribe
              </button>
            </form>

            <div className="mt-4 text-sm" style={{ color: isLight ? "#475569" : undefined }}>
              <div className="mb-2">We accept</div>
              <div className="flex items-center gap-3">
                {/* Visa */}
                <div className={`${isLight ? "bg-gray-100" : "bg-white/6"} p-2 rounded`}>
                  <svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect width="48" height="28" rx="4" fill={isLight ? "#FFFFFF" : "#111827"} />
                    <path d="M8 20L11.2 8h2.2l-3.2 12h-2.2zM16 8h3.2l-1.8 12H14.2L16 8zM24 8c1.9 0 3.3 0.8 4.1 2 0.9 1.4 1.1 3.6 1.1 4.6 0 0.9-0.2 3.2-1.1 4.6-0.8 1.2-2.2 2-4.1 2-2.6 0-4.2-1.2-5.1-3.2l1.9-1c0.6 1.2 1.6 1.9 3.2 1.9 1.2 0 2.2-0.5 2.9-1.6 0.5-0.8 0.7-2 0.7-2.8 0-1.1-0.2-2.1-0.7-2.8-0.7-1.1-1.7-1.6-2.9-1.6-1.6 0-2.6 0.7-3.2 1.9l-1.9-1C19.8 9.2 21.4 8 24 8z" fill={isLight ? "#1E3A8A" : "#FFFFFF"} />
                  </svg>
                </div>

                {/* Mastercard */}
                <div className={`${isLight ? "bg-gray-100" : "bg-white/6"} p-2 rounded`}>
                  <svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect width="48" height="28" rx="4" fill={isLight ? "#FFFFFF" : "#111827"} />
                    <g transform="translate(6,4)">
                      <circle cx="10" cy="10" r="8" fill="#F24E1E" />
                      <circle cx="22" cy="10" r="8" fill="#FFB500" />
                      <path d="M16 10a6 6 0 01-2.5 4.7 6 6 0 012.5 4.7 6 6 0 012.5-4.7A6 6 0 0116 10z" fill="#FF8A2D" opacity="0.9" />
                    </g>
                  </svg>
                </div>

                {/* PayPal */}
                <div className={`${isLight ? "bg-gray-100" : "bg-white/6"} p-2 rounded`}>
                  <svg width="60" height="28" viewBox="0 0 60 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect width="60" height="28" rx="4" fill={isLight ? "#FFFFFF" : "#111827"} />
                    <g transform="translate(6,6)" fill="none" stroke="none">
                      <path d="M6 0h7.2c4.5 0 6.8 2 5.6 6.6l-1.1 4.1c-0.9 3.3-3 4.8-7.4 4.8H6L10 0z" fill="#003087"/>
                      <path d="M20 0h4.6c3 0 4.6 1 3.8 4.6L25 12c-1 3.8-3.4 5.4-7.6 5.4H16l4-17z" fill="#009CDE" opacity="0.9"/>
                      <path d="M29.5 3.2c0 .9-.6 1.5-1.7 1.7l.2 1.1c1.1-.1 2-.9 2-2.6 0-1.4-.8-2-2-2-1 0-2 .6-2.4 1.4l1.6.6c.2-.5.8-.9 1.3-.9.6 0 1 .3 1 1z" fill="#FFFFFF"/>
                    </g>
                  </svg>
                </div>

                {/* Amex */}
                <div className={`${isLight ? "bg-gray-100" : "bg-white/6"} p-2 rounded`}>
                  <svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect width="48" height="28" rx="4" fill={isLight ? "#FFFFFF" : "#111827"} />
                    <g transform="translate(6,6)" fill={isLight ? "#0EA5E9" : "#38BDF8"}>
                      <rect x="0" y="0" width="36" height="16" rx="1" />
                      <text x="4" y="11" fontFamily="Arial, Helvetica, sans-serif" fontSize="8" fontWeight="700" fill={isLight ? "#0B3659" : "#052F5F"}>AMEX</text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`${isLight ? "border-t border-gray-200 mt-10 pt-6" : "border-t border-white/10 mt-10 pt-6"}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className={`text-sm ${isLight ? "text-gray-600" : "text-gray-400"}`}>
              © {year} MERNShop — All rights reserved.
              <span className="mx-2">•</span>
              <Link to="/terms" className={linkClass}>Terms</Link>
              <span className="mx-2">•</span>
              <Link to="/privacy" className={linkClass}>Privacy</Link>
            </div>

            <div className="flex items-center gap-4">
              <div className={`text-sm ${isLight ? "text-gray-600" : "text-gray-400"}`}>Language</div>
              <select className={`${isLight ? "bg-white border border-gray-200 text-gray-700" : "bg-white/6 text-white"} text-sm px-3 py-1 rounded`}>
                <option>English</option>
                <option>Español</option>
                <option>Français</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}