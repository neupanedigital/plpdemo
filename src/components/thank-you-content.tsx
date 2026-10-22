"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Home, PhoneCall } from "lucide-react";
import { formatNpr } from "@/lib/product";

type Summary = { orderId: string; productName: string; quantity: number; totalPrice: number; paymentMethod: string };

export function ThankYouContent() {
  const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => { const saved = sessionStorage.getItem("biswas:last-order"); if (saved) { try { setSummary(JSON.parse(saved)); } catch { /* show generic state */ } } }, []);
  return <main className="grain grid min-h-[calc(100vh-72px)] place-items-center bg-[#f7f2e6] px-4 py-14"><div className="w-full max-w-2xl rounded-[34px] border border-white bg-white p-6 text-center shadow-[0_25px_80px_rgba(30,59,39,.12)] sm:p-10"><div className="mx-auto grid size-20 place-items-center rounded-full bg-[#e6f2e8] text-[#2f7a49]"><Check size={38} strokeWidth={3} /></div><p className="mt-7 text-xs font-extrabold uppercase tracking-[.22em] text-[#c56822]">Order received</p><h1 className="display-font mt-3 text-4xl font-bold text-[#153f27] sm:text-5xl">Thank you for your order!</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-[#667169]">Our sales representative will call you soon to confirm your order and delivery details.</p>{summary && <div className="mx-auto mt-8 max-w-lg rounded-3xl bg-[#f8f5ed] p-5 text-left"><div className="grid gap-3 text-sm"><div className="flex justify-between gap-4"><span className="text-[#747d77]">Order ID</span><strong>{summary.orderId}</strong></div><div className="flex justify-between gap-4"><span className="text-[#747d77]">Product ordered</span><strong className="text-right">{summary.productName}</strong></div><div className="flex justify-between gap-4"><span className="text-[#747d77]">Quantity</span><strong>{summary.quantity}</strong></div><div className="flex justify-between gap-4"><span className="text-[#747d77]">Total price</span><strong>{formatNpr(summary.totalPrice)}</strong></div><div className="flex justify-between gap-4"><span className="text-[#747d77]">Payment method</span><strong>{summary.paymentMethod}</strong></div></div></div>}<div className="mt-7 flex items-center justify-center gap-2 text-sm font-bold text-[#3d5747]"><PhoneCall size={18} className="text-[#2f7a49]" /> Keep your phone nearby for confirmation.</div><Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#153f27] px-7 py-4 font-extrabold text-white hover:-translate-y-0.5 hover:bg-[#0c2d1b]"><Home size={18} /> Back to Home</Link></div></main>;
}
