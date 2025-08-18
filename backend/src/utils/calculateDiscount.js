const calculateDiscount = (totalPrice, coupon) => {
  let discountAmount = 0;
  if (!coupon) return discountAmount;

  if (coupon.discountType === "percentage") {
    discountAmount = (totalPrice * coupon.amount) / 100;
  } else {
    discountAmount = coupon.amount;
  }

  return discountAmount > totalPrice ? totalPrice : discountAmount;
};

module.exports = calculateDiscount;
