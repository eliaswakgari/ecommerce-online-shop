import React, { useState } from "react";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "./authSlice.js";
import { Link, useParams, useNavigate } from "react-router-dom";
import { passwordStrong, required } from "../../utils/validators.js";

export default function ResetPasswordPage() {
         const [form, setForm] = useState({ password: "", confirmPassword: "" });
         const [errors, setErrors] = useState({});
         const { loading } = useSelector((s) => s.auth);
         const dispatch = useDispatch();
         const { resetToken } = useParams();
         const navigate = useNavigate();

         const validate = () => {
                  const e = {
                           password: passwordStrong(form.password) || required(form.password),
                           confirmPassword: form.password !== form.confirmPassword ? "Passwords do not match" : required(form.confirmPassword),
                  };
                  setErrors(e);
                  return !Object.values(e).some(Boolean);
         };

         const submit = async (e) => {
                  e.preventDefault();
                  if (!validate()) return;

                  try {
                           await dispatch(resetPassword({ resetToken, password: form.password })).unwrap();
                           navigate("/login", { replace: true });
                  } catch (err) {
                           console.error("Reset password failed:", err);
                  }
         };

         return (
                  <div className="max-w-md mx-auto bg-white border rounded-xl p-6">
                           <h1 className="text-xl font-semibold mb-4">Reset Password</h1>
                           <p className="text-sm text-gray-600 mb-4">
                                    Enter your new password below.
                           </p>

                           <form onSubmit={submit} className="space-y-3">
                                    <Input
                                             label="New Password"
                                             type="password"
                                             value={form.password}
                                             onChange={(e) => setForm({ ...form, password: e.target.value })}
                                             error={errors.password}
                                    />
                                    <Input
                                             label="Confirm New Password"
                                             type="password"
                                             value={form.confirmPassword}
                                             onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                             error={errors.confirmPassword}
                                    />
                                    <Button type="submit" loading={loading} className="w-full">
                                             Reset Password
                                    </Button>
                           </form>

                           <div className="mt-4 text-center">
                                    <Link to="/login" className="text-blue-600 hover:text-blue-800 text-sm">
                                             Back to Login
                                    </Link>
                           </div>
                  </div>
         );
}
