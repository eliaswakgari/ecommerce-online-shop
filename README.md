# Ecommerce Online Shopping

Full‑stack e-commerce application with a React (Vite) frontend and a Node.js/Express backend, featuring authentication (email + Google OAuth), product catalog, cart/checkout, Stripe payments, order management, Cloudinary image uploads, and a product review system.

## Tech Stack

### Frontend

- React (Vite)
- Redux Toolkit
- TailwindCSS
- Axios
- Stripe Elements

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT + cookie-based auth
- Passport (Google OAuth 2.0)
- Stripe (payments + webhooks)
- Cloudinary (image hosting)
- Nodemailer (password reset emails)

## Features

- Authentication
  - Register/login
  - Forgot password email flow
  - Google OAuth sign-in
- Product catalog
- Cart
  - Guest cart (localStorage)
  - Authenticated cart (MongoDB)
  - Guest-to-user cart migration on login
- Checkout
  - Shipping details
  - Stripe PaymentIntent flow
  - Webhook-based payment confirmation
  - Order confirmation + order history
- Admin capabilities (as implemented in the codebase)
  - Order status management
  - Analytics endpoints
  - Coupon endpoints
- Product reviews & ratings
  - 1 review per user per product
  - Helpful/unhelpful voting
  - Rating averages + review counts on products
- Profile image upload via Cloudinary (stores URL, not base64)

## Project Structure

- `backend/` Node/Express API server
- `frontend/` React client (Vite)

## Prerequisites

- Node.js (recommended: recent LTS)
- npm
- MongoDB (local or cloud MongoDB Atlas)
- Stripe account (test keys are fine for development)
- Cloudinary account (for image upload)
- Google Cloud project (for Google OAuth)

## Quick Start (Development)

### 1) Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` (see example below), then start the API server:

```bash
npm run dev
```

By default the backend runs on `http://localhost:5000`.

### 2) Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env` (see example below), then start the Vite dev server:

```bash
npm run dev
```

By default the frontend runs on `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

Minimum required for basic API + DB:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=replace-with-a-long-random-secret

# Frontend URL(s) allowed by CORS. You can provide multiple origins separated by commas.
FRONTEND_URL=http://localhost:5173

# Used by Google OAuth callback URL construction
BACKEND_URL=http://localhost:5000
```

Email (Forgot Password):

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

Google OAuth:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Stripe:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Note: some flows may also use a publishable key on the backend depending on your implementation.

### Frontend (`frontend/.env`)

```env
# Backend base URL used by axios instance and Google OAuth redirect
VITE_API_BASE_URL=http://localhost:5000

# Stripe publishable key used by Stripe Elements
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Useful Commands

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

## Stripe Webhooks (Local Development)

If your payment status stays "pending" after successful payment, you likely need to forward Stripe webhooks to your local machine.

- Webhook endpoint: `POST /api/orders/webhook`
- Stripe CLI example:

```bash
stripe listen --forward-to localhost:5000/api/orders/webhook
```

## Additional Documentation

This repository includes several focused guides:

- `AUTHENTICATION_SETUP.md`
- `CLOUDINARY_SETUP.md`
- `CART_CHECKOUT_FEATURES.md`
- `PAYMENT_DEBUG_GUIDE.md`
- `REVIEW_SYSTEM.md`

## Contributing

- Fork the repo
- Create a feature branch
- Open a pull request with a clear description and screenshots (if UI changes)

## License

No license file is currently included. If you plan to open-source this project, add a `LICENSE` file and update this section.




