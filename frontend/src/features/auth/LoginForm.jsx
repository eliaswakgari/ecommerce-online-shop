import React, { useEffect, useState } from "react";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { useDispatch, useSelector } from "react-redux";
import { login, getProfile } from "./authSlice.js";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
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
    <div className="max-w-md mx-auto bg-white border rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" loading={loading} className="w-full">
          Login
        </Button>
      </form>
      <div className="mt-4 space-y-2 text-center">
        <p className="text-sm">
          No account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            Register
          </Link>
        </p>
        <p className="text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
}
