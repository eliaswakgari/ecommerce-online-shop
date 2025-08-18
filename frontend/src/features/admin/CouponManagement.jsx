import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCoupon } from "./adminSlice.js";
import Button from "../../components/ui/Button.jsx";

export default function CouponManagement() {
  const dispatch = useDispatch();
  const { creatingCoupon } = useSelector(s=>s.admin);
  const [form, setForm] = useState({ code:"", discountType:"percentage", amount:10, expirationDate:"", usageLimit:100 });

  const submit = (e)=>{
    e.preventDefault();
    dispatch(createCoupon(form));
  };

  return (
    <div className="max-w-xl bg-white border rounded-xl p-4">
      <h1 className="text-2xl font-semibold mb-3">Create Coupon</h1>
      <form className="grid grid-cols-2 gap-3" onSubmit={submit}>
        <input className="border rounded px-3 py-2 col-span-2" placeholder="Code (e.g., SUMMER20)" value={form.code} onChange={(e)=>setForm({...form, code:e.target.value.toUpperCase()})}/>
        <select className="border rounded px-3 py-2" value={form.discountType} onChange={(e)=>setForm({...form, discountType:e.target.value})}>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
        <input className="border rounded px-3 py-2" type="number" placeholder="Amount" value={form.amount} onChange={(e)=>setForm({...form, amount:Number(e.target.value)})}/>
        <input className="border rounded px-3 py-2" type="date" value={form.expirationDate} onChange={(e)=>setForm({...form, expirationDate:e.target.value})}/>
        <input className="border rounded px-3 py-2" type="number" placeholder="Usage Limit" value={form.usageLimit} onChange={(e)=>setForm({...form, usageLimit:Number(e.target.value)})}/>
        <Button className="col-span-2" type="submit" loading={creatingCoupon}>Create</Button>
      </form>
    </div>
  );
}
