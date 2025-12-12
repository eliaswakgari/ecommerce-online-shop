export default function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString();
}
