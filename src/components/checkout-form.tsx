"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, LockKeyhole, Minus, Plus } from "lucide-react";
import { calculateOrder, formatNpr, PRODUCT, type DeliveryZone } from "@/lib/product";

type FormState = { fullName: string; phone: string; email: string; location: string; website: string };

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startingQuantity = Math.min(20, Math.max(1, Number(searchParams.get("quantity")) || 1));
  const [quantity, setQuantity] = useState(startingQuantity);
  const [zone, setZone] = useState<DeliveryZone>("inside_valley");
  const [form, setForm] = useState<FormState>({ fullName: "", phone: "", email: "", location: "", website: "" });
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const totals = useMemo(() => calculateOrder(quantity, zone), [quantity, zone]);

  function update(name: keyof FormState, value: string) { setForm((current) => ({ ...current, [name]: value })); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId: PRODUCT.id, quantity, deliveryZone: zone, idempotencyKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not submit your order. Please try again.");
      sessionStorage.setItem("biswas:last-order", JSON.stringify(data.order));
      router.push(`/thank-you?order=${encodeURIComponent(data.order.orderId)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not submit your order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="section-shell grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.12fr_.88fr] lg:items-start">
      <form onSubmit={submit} className="rounded-[30px] border border-[#e5dfd1] bg-white p-5 shadow-[0_20px_70px_rgba(38,62,45,.09)] sm:p-8">
        <div className="mb-7"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#c56822]">Delivery details</p><h1 className="display-font mt-2 text-3xl font-bold text-[#153f27] sm:text-4xl">Complete your COD order</h1><p className="mt-3 text-sm leading-6 text-[#6a746d]">Enter accurate details so our representative can call and confirm your order.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#33483b]">Full Name<input className="field" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" required minLength={2} placeholder="Your full name" /></label>
          <label className="grid gap-2 text-sm font-bold text-[#33483b]">Phone Number<input className="field" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" inputMode="tel" required placeholder="98XXXXXXXX" /></label>
          <label className="grid gap-2 text-sm font-bold text-[#33483b] sm:col-span-2">Email Address<input className="field" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" required placeholder="you@example.com" /></label>
          <label className="grid gap-2 text-sm font-bold text-[#33483b] sm:col-span-2">Exact Location<textarea className="field min-h-28 resize-y" value={form.location} onChange={(e) => update("location", e.target.value)} autoComplete="street-address" required minLength={5} placeholder="Kindly share your exact location" /></label>
        </div>
        <fieldset className="mt-6"><legend className="mb-3 text-sm font-extrabold text-[#33483b]">Delivery area</legend><div className="grid gap-3 sm:grid-cols-2">{([{ id: "inside_valley", label: "Inside Valley", fee: 100 }, { id: "outside_valley", label: "Outside Valley", fee: 200 }] as const).map((option) => <label key={option.id} className={`cursor-pointer rounded-2xl border p-4 ${zone === option.id ? "border-[#2f7a49] bg-[#eff6f0]" : "border-[#dedbd1]"}`}><input type="radio" name="deliveryZone" className="sr-only" checked={zone === option.id} onChange={() => setZone(option.id)} /><span className="flex items-center justify-between gap-3"><span className="font-extrabold text-[#304438]">{option.label}</span><span className="text-sm font-bold text-[#657068]">{formatNpr(option.fee)}</span></span></label>)}</div></fieldset>
        <div className="absolute -left-[9999px]" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} /></label></div>
        {error && <div role="alert" className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"><AlertCircle className="shrink-0" size={19} />{error}</div>}
        <button disabled={submitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e8832e] px-6 py-4 font-extrabold text-white shadow-lg shadow-orange-900/10 hover:bg-[#cc6e21] disabled:cursor-not-allowed disabled:opacity-70">{submitting ? <><Loader2 className="animate-spin" size={19} /> Submitting Order...</> : "Order Now — Cash on Delivery"}</button>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-[#7a837d]"><LockKeyhole size={14} /> Your order is sent securely. No online payment required.</p>
      </form>

      <aside className="rounded-[30px] bg-[#153f27] p-5 text-white sm:p-7 lg:sticky lg:top-26">
        <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#f5b879]">Order summary</p>
        <div className="mt-5 flex gap-4 rounded-2xl bg-white/[.08] p-3"><div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-white"><Image src="/images/mixed-dry-fruits-white.png" alt="Mixed dry fruits jar" fill sizes="96px" className="object-contain p-2" /></div><div className="py-1"><h2 className="font-extrabold leading-5">{PRODUCT.name}</h2><p className="mt-1 text-xs text-white/60">{PRODUCT.weight}</p><p className="mt-3 text-sm font-extrabold text-[#f5b879]">{formatNpr(PRODUCT.price)} / piece</p></div></div>
        <div className="mt-6 flex items-center justify-between border-b border-white/10 pb-5"><span className="font-bold">Quantity</span><div className="flex items-center rounded-full bg-white/10 p-1"><button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="grid size-8 place-items-center rounded-full hover:bg-white/10"><Minus size={16} /></button><span className="w-9 text-center font-black">{quantity}</span><button type="button" onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="Increase quantity" className="grid size-8 place-items-center rounded-full hover:bg-white/10"><Plus size={16} /></button></div></div>
        <div className="grid gap-3 py-5 text-sm"><div className="flex justify-between text-white/70"><span>Product subtotal</span><span>{formatNpr(totals.subtotal)}</span></div><div className="flex justify-between text-white/70"><span>Delivery fee</span><span>{formatNpr(totals.deliveryFee)}</span></div><div className="flex justify-between pt-2 text-xl font-black"><span>Total</span><span>{formatNpr(totals.total)}</span></div></div>
        <div className="flex gap-3 rounded-2xl bg-[#eaf4ec] p-4 text-sm text-[#264b35]"><CheckCircle2 className="shrink-0 text-[#2f7a49]" size={20} /><span><strong>Cash on Delivery</strong><br />Pay after your order is confirmed and delivered.</span></div>
      </aside>
    </div>
  );
}
