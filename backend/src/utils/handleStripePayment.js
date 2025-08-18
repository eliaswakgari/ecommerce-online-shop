const stripe = require("../config/stripe");

const createPaymentIntent = async ({ amount, currency = "usd" }) => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert to cents
    currency,
  });
};

module.exports = { createPaymentIntent };
