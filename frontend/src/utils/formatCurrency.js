export default function formatCurrency(n) {
  const val = Number(n || 0);
  return val.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
