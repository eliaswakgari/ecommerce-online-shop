import { useSelector } from "react-redux";

/**
 * useAuth
 * Returns:
 *  - user: the auth user object from redux (or null)
 *  - isAdmin: boolean (true if user.isAdmin === true OR user.role === 'admin' OR user.role === 'Admin')
 */
export default function useAuth() {
  const auth = useSelector((s) => s.auth || {});
  const user = auth.user || null;

  // Detect admin in common shapes
  const isAdmin = !!(
    user &&
    (
      user.isAdmin === true ||
      (typeof user.role === "string" && user.role.toLowerCase() === "admin") ||
      user.roles?.includes?.("admin")
    )
  );

  return { user, isAdmin };
}