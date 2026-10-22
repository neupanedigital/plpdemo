"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { PRODUCT, formatNpr } from "@/lib/product";

export function ProductShowcase() {
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const checkout = `/checkout?product=${PRODUCT.id}&quantity=${quantity}`;
  const move = (direction: number) => setActive((current) => (current + direction + PRODUCT.images.length) % PRODUCT.images.length);

  return (
    <section id="product" className="bg-white py-20 sm:py-28">
      <div className="section-shell grid gap-12 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[34px] bg-[#f2eee3]">
            <Image src={PRODUCT.images[active]} alt={`Biswas mixed dry fruits product view ${active + 1}`} fill sizes="(max-width: 1024px) 95vw, 52vw" className="object-contain p-5 sm:p-9" />
            <button onClick={() => move(-1)} aria-label="Previous image" className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg hover:bg-white"><ChevronLeft /></button>
            <button onClick={() => move(1)} aria-label="Next image" className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg hover:bg-white"><ChevronRight /></button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">{PRODUCT.images.map((image, index) => <button key={image} onClick={() => setActive(index)} aria-label={`Show image ${index + 1}`} className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-[#f7f4ec] ${index === active ? "border-[#2f7a49]" : "border-transparent"}`}><Image src={image} alt="" fill sizes="120px" className="object-cover" /></button>)}</div>
        </div>
        <div className="lg:sticky lg:top-28">
          <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#c56822]">Biswas · 1 kg value jar</p>
          <h2 className="display-font mt-3 text-4xl font-bold leading-tight text-[#153f27] sm:text-5xl">20-Item Mixed Dry Fruits</h2>
          <p className="mt-5 text-base leading-7 text-[#5d685f]">A ready-to-eat blend of almonds, cashews, raisins, seeds and colourful dried fruits. Keep it nearby for a quick snack or add it to your daily breakfast.</p>
          <ul className="mt-6 grid gap-3 text-sm font-semibold text-[#364b3e] sm:grid-cols-2">{["20-item mixed blend", "Convenient 1 kg jar", "Breakfast-friendly", "Easy everyday snack"].map((benefit) => <li key={benefit} className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-[#e3efe6] text-[#2f7a49]"><Check size={13} strokeWidth={3} /></span>{benefit}</li>)}</ul>
          <div className="mt-8 rounded-3xl border border-[#e4ded0] bg-[#faf8f1] p-6">
            <div className="flex items-end justify-between gap-4"><div><span className="text-sm text-[#717a74] line-through">{formatNpr(PRODUCT.regularPrice)}</span><div className="text-3xl font-black text-[#153f27]">{formatNpr(PRODUCT.price)} <span className="text-sm font-semibold text-[#657168]">/ jar</span></div></div><span className="rounded-full bg-[#ffe8d2] px-3 py-1.5 text-xs font-extrabold text-[#9b4d12]">Offer price</span></div>
            <div className="mt-6 flex items-center justify-between border-y border-[#e4ded0] py-5"><span className="font-bold">Quantity</span><div className="flex items-center rounded-full border border-[#d9d5c9] bg-white p-1"><button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="grid size-9 place-items-center rounded-full hover:bg-[#edf4ef]"><Minus size={17} /></button><span className="w-10 text-center font-black">{quantity}</span><button onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="Increase quantity" className="grid size-9 place-items-center rounded-full hover:bg-[#edf4ef]"><Plus size={17} /></button></div></div>
            <div className="flex items-center justify-between py-5"><span className="text-sm font-semibold text-[#657168]">Product total</span><span className="text-xl font-black text-[#153f27]">{formatNpr(PRODUCT.price * quantity)}</span></div>
            <p className="mb-4 text-xs leading-5 text-[#7a817c]">Delivery: NPR 100 inside Kathmandu Valley or NPR 200 outside the Valley. Added at checkout.</p>
            <Link href={checkout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e8832e] px-5 py-4 font-extrabold text-white shadow-lg shadow-orange-900/10 hover:-translate-y-0.5 hover:bg-[#cc6e21]">Order now · Cash on Delivery <ArrowRight size={18} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
