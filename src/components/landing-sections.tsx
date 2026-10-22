"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowRight, ChevronDown, Coffee, Heart, PackageCheck, Salad, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { PRODUCT, formatNpr } from "@/lib/product";

const benefits = [
  { icon: Activity, title: "Everyday energy", text: "A satisfying mix of natural sugars, fats and plant-based nutrients for busy days." },
  { icon: Salad, title: "Nutrient-dense snack", text: "Nuts, seeds and dried fruits bring variety to a small, convenient serving." },
  { icon: Coffee, title: "Breakfast friendly", text: "Add it to oats, yogurt, porridge, smoothies or warm milk." },
  { icon: Heart, title: "Smarter snack swap", text: "A practical alternative when you want something more wholesome than common packaged snacks." },
  { icon: Sparkles, title: "Naturally colourful", text: "A lively mix of textures and flavours that makes everyday snacking more enjoyable." },
  { icon: ShieldCheck, title: "Easy to store", text: "The resealable 1 kg jar keeps your mix convenient for home or office use." },
];

const uses = ["Enjoy a small handful (around 20–30 g).", "Soak selected almonds, raisins or figs overnight.", "Stir into oats, muesli, yogurt or porridge.", "Add chopped pieces to warm milk or smoothies.", "Keep a portion ready for a between-meal snack."];

const faqs = [
  ["What is included in the jar?", "It is a 20-item mix of nuts, seeds and dried fruits. Ingredients can naturally vary slightly between batches; check the product label if you have dietary restrictions."],
  ["How much should I eat?", "A small handful, around 20–30 g, is a practical everyday serving. Adjust it to your diet and needs."],
  ["How should I store it?", "Close the lid tightly and keep the jar in a cool, dry place away from direct sunlight and moisture."],
  ["Is Cash on Delivery available?", "Yes. You pay after your order is confirmed and delivered."],
  ["What is the delivery charge?", "Delivery is NPR 100 inside Kathmandu Valley and NPR 200 outside the Valley."],
  ["What happens after I order?", "You will receive an order email, and our sales representative will call to confirm your location and delivery details."],
  ["Is this suitable for everyone?", "The mix contains nuts and seeds. Anyone with allergies, a medical condition or a specialised diet should review the label and consult a qualified professional when needed."],
];

export function BenefitsAndUse() {
  return (
    <>
      <section className="bg-[#153f27] py-20 text-white sm:py-24">
        <div className="section-shell"><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#f5b879]">Why this mix works</p><h2 className="display-font mt-3 text-4xl font-bold sm:text-5xl">One jar. Many easy ways to enjoy it.</h2></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{benefits.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-3xl border border-white/10 bg-white/[.07] p-6"><span className="grid size-11 place-items-center rounded-2xl bg-[#e8832e] text-white"><Icon size={21} /></span><h3 className="mt-5 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{text}</p></div>)}</div><div className="mt-10 text-center"><Link href={`/checkout?product=${PRODUCT.id}&quantity=1`} className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-[#153f27] hover:-translate-y-1">Buy now <ArrowRight size={18} /></Link></div></div>
      </section>
      <section className="bg-[#f7f2e6] py-20 sm:py-24"><div className="section-shell grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#c56822]">How to enjoy it</p><h2 className="display-font mt-3 text-4xl font-bold text-[#153f27] sm:text-5xl">Make it part of your everyday routine.</h2><p className="mt-5 leading-7 text-[#5d685f]">Simple enough for rushed mornings. Flexible enough for breakfast, snacking or sharing.</p></div><ol className="grid gap-3">{uses.map((use, index) => <li key={use} className="flex items-center gap-4 rounded-2xl border border-[#e4ddcc] bg-white p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8f1ea] font-black text-[#23643c]">{index + 1}</span><span className="font-semibold text-[#3e5045]">{use}</span></li>)}</ol></div></section>
    </>
  );
}

export function TestimonialsPlaceholder() {
  const drafts = [
    "The mix feels convenient for busy mornings, and the jar is easy to keep at home.",
    "I like having nuts, seeds and dried fruits together instead of buying them separately.",
    "A colourful snack that is easy to portion and carry for the day.",
  ];
  return <section className="bg-white py-20 sm:py-24"><div className="section-shell"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#c56822]">Customer stories</p><h2 className="display-font mt-3 text-4xl font-bold text-[#153f27]">Review section ready for your real customers.</h2><p className="mt-4 text-sm leading-6 text-[#68736c]">These draft cards are intentionally marked as samples. Replace them with verified customer feedback before launch.</p></div><div className="mt-10 grid gap-5 md:grid-cols-3">{drafts.map((draft, index) => <blockquote key={draft} className="rounded-3xl border border-dashed border-[#d4c9b7] bg-[#faf8f1] p-6"><span className="inline-flex rounded-full bg-[#fff0dd] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#9b4d12]">Sample review {index + 1}</span><p className="mt-5 text-lg font-semibold leading-8 text-[#304338]">“{draft}”</p><footer className="mt-5 text-xs font-bold text-[#879088]">Replace with verified name and review</footer></blockquote>)}</div></div></section>;
}

export function FAQ() {
  const [open, setOpen] = useState(0);
  return <section className="bg-[#f7f2e6] py-20 sm:py-24"><div className="section-shell grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#c56822]">Good to know</p><h2 className="display-font mt-3 text-4xl font-bold text-[#153f27] sm:text-5xl">Frequently asked questions.</h2></div><div className="grid gap-3">{faqs.map(([question, answer], index) => <div key={question} className="overflow-hidden rounded-2xl border border-[#e1dacb] bg-white"><button onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-extrabold text-[#253a2e]"><span>{question}</span><ChevronDown className={`shrink-0 transition-transform ${open === index ? "rotate-180" : ""}`} size={19} /></button>{open === index && <p className="px-5 pb-5 text-sm leading-6 text-[#647067]">{answer}</p>}</div>)}</div></div></section>;
}

export function TrustAndFinalCTA() {
  return <><section className="border-y border-[#ebe4d5] bg-white py-10"><div className="section-shell grid gap-5 text-center sm:grid-cols-3">{[[PackageCheck,"Simple order process"],[Truck,"Delivery across Nepal"],[ShieldCheck,"Cash on Delivery"]].map(([Icon,label]) => { const C = Icon as typeof PackageCheck; return <div key={label as string} className="flex items-center justify-center gap-3 font-extrabold text-[#30483a]"><C className="text-[#2f7a49]" />{label as string}</div>; })}</div></section><section className="grain bg-[#e8efe4] py-20 sm:py-24"><div className="section-shell rounded-[34px] bg-[#153f27] px-6 py-14 text-center text-white sm:px-12"><p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#f5b879]">Limited-time offer price</p><h2 className="display-font mx-auto mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">Bring home the 20-item mix for {formatNpr(PRODUCT.price)}.</h2><p className="mx-auto mt-5 max-w-xl text-white/65">Choose your quantity, share your delivery details, and pay when your order arrives.</p><Link href={`/checkout?product=${PRODUCT.id}&quantity=1`} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e8832e] px-8 py-4 font-extrabold text-white hover:-translate-y-1 hover:bg-[#cc6e21]">Order now <ArrowRight size={18} /></Link></div></section></>;
}
