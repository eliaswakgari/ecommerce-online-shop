import React, { useState } from "react";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "./authSlice.js";
import { Link } from "react-router-dom";
import { email, required } from "../../utils/validators.js";

export default function ForgotPasswordPage() {
         const [form, setForm] = useState({ email: "" });
         const [errors, setErrors] = useState({});
         const { loading } = useSelector((s) => s.auth);
         const dispatch = useDispatch();

         const validate = () => {
                  const e = {
                           email: email(form.email) || required(form.email),
                  };
                  setErrors(e);
                  return !Object.values(e).some(Boolean);
         };

         const submit = async (e) => {
                  e.preventDefault();
                  if (!validate()) return;

                  try {
                           await dispatch(forgotPassword(form)).unwrap();
                           setForm({ email: "" });
                  } catch (err) {
                           console.error("Forgot password failed:", err);
                  }
         };

         return (
                  <div className="max-w-md mx-auto bg-white border rounded-xl p-6">
                           <h1 className="text-xl font-semibold mb-4">Forgot Password</h1>
                           <p className="text-sm text-gray-600 mb-4">
                                    Enter your email address and we'll send you a link to reset your password.
                           </p>

                           <form onSubmit={submit} className="space-y-3">
                                    <Input
                                             label="Email"
                                             type="email"
                                             value={form.email}
                                             onChange={(e) => setForm({ ...form, email: e.target.value })}
                                             error={errors.email}
                                    />
                                    <Button type="submit" loading={loading} className="w-full">
                                             Send Reset Link
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
