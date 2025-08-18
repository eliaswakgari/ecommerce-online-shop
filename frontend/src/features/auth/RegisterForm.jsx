import React, { useEffect, useState } from "react";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, getProfile } from "./authSlice.js";
import { useNavigate } from "react-router-dom";
import { email, passwordStrong, required } from "../../utils/validators.js";

export default function RegisterForm() {
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [errors, setErrors] = useState({});
  const { user, loading } = useSelector(s=>s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(()=>{ if (!user) dispatch(getProfile()); }, []);
  useEffect(()=>{ if (user) navigate("/"); }, [user]);

  const validate = () => {
    const e = {
      name: required(form.name),
      email: email(form.email),
      password: passwordStrong(form.password)
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    dispatch(registerUser(form));
  };

  return (
    <div className="max-w-md mx-auto bg-white border rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-4">Create Account</h1>
      <form onSubmit={submit} className="space-y-3">
        <Input label="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} error={errors.name}/>
        <Input label="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} error={errors.email}/>
        <Input label="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} error={errors.password}/>
        <Button type="submit" loading={loading} className="w-full">Register</Button>
      </form>
    </div>
  );
}
