import { useSelector } from "react-redux";
export default function useAuth() {
  const { user, loading } = useSelector((s) => s.auth);
  return { user, isAdmin: !!user?.role === 'admin', loading };
}
