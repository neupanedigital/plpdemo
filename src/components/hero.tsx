import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, PackageCheck, Truck } from "lucide-react";
import { PRODUCT, formatNpr } from "@/lib/product";

export function Hero() {
  return (
    <section className="grain overflow-hidden bg-[#f7f2e6] py-14 sm:py-20">
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8c8a9] bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-[#6a4c23]"><BadgeCheck size={16} className="text-[#2f7a49]" /> 20 ingredients · 1 kg value jar</div>
          <h1 className="display-font max-w-3xl text-5xl font-bold leading-[1.03] tracking-[-.04em] text-[#153f27] sm:text-6xl lg:text-7xl">A colourful handful of better snacking.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#516056]">Biswas 20-Item Mixed Dry Fruits brings nuts, seeds and dried fruits together in one convenient jar—ready for breakfast, between-meal energy or family sharing.</p>
          <div className="mt-7 flex items-end gap-3"><span className="text-3xl font-black text-[#153f27]">{formatNpr(PRODUCT.price)}</span><span className="pb-1 text-base text-[#8a8f89] line-through">{formatNpr(PRODUCT.regularPrice)}</span><span className="mb-1 rounded-full bg-[#e6f0e9] px-2.5 py-1 text-xs font-extrabold text-[#23643c]">Save NPR 400</span></div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/checkout?product=biswas-20-item-mixed-dry-fruits-1kg&quantity=1" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8832e] px-7 py-4 font-extrabold text-white shadow-xl shadow-orange-900/15 hover:-translate-y-1 hover:bg-[#cc6e21]">Purchase now <ArrowRight size={19} /></Link><a href="#product" className="inline-flex items-center justify-center rounded-full border border-[#bcc8bf] bg-white/60 px-7 py-4 font-bold text-[#153f27] hover:bg-white">View the mix</a></div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#4a5d51]"><span className="flex items-center gap-2"><PackageCheck size={18} /> Cash on Delivery</span><span className="flex items-center gap-2"><Truck size={18} /> Delivery across Nepal</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[540px]">
          <div className="absolute -inset-10 rounded-full bg-[#dfe9d2] blur-3xl" />
          <div className="soft-shadow relative aspect-square overflow-hidden rounded-[42px] border border-white/80 bg-white p-7 sm:p-10">
            <Image src="/images/mixed-dry-fruits-white.png" alt="Biswas 20-item mixed dry fruits 1 kg jar" fill priority sizes="(max-width: 1024px) 90vw, 45vw" className="object-contain p-7 sm:p-10" />
            <div className="absolute right-4 top-4 rounded-2xl bg-[#153f27] px-4 py-3 text-center text-white shadow-lg"><span className="block text-2xl font-black">20</span><span className="text-[10px] font-bold uppercase tracking-widest">item mix</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
