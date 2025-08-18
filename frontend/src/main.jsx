import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import store from "./app/store.js";
import "./index.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);
if (!import.meta.env.VITE_STRIPE_KEY) {
  console.error("VITE_STRIPE_KEY is missing - check your .env and restart Vite");
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Elements stripe={stripePromise}>
          <App />
          <Toaster position="top-right" />
        </Elements>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
