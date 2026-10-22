import Link from "next/link";
import { Leaf, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  return (
    <>
      <div className="bg-[#153f27] px-4 py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
        Cash on Delivery across Nepal · Freshly packed · Easy ordering
      </div>
      <header className="sticky top-0 z-40 border-b border-[#e5dfd0]/80 bg-[#fffdf7]/90 backdrop-blur-xl">
        <div className="section-shell flex h-18 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#153f27]" aria-label="Biswas home">
            <span className="grid size-10 place-items-center rounded-full bg-[#153f27] text-white"><Leaf size={20} /></span>
            <span><span className="block text-lg font-black leading-none tracking-tight">BISWAS</span><span className="text-[10px] font-bold uppercase tracking-[.23em] text-[#7b5d35]">Natural goodness</span></span>
          </Link>
          <div className="hidden items-center gap-2 text-sm font-semibold text-[#446050] sm:flex"><ShieldCheck size={18} /> Secure COD order</div>
          <Link href="/checkout?product=biswas-20-item-mixed-dry-fruits-1kg&quantity=1" className="rounded-full bg-[#e8832e] px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-900/10 hover:-translate-y-0.5 hover:bg-[#cc6e21]">Order now</Link>
        </div>
      </header>
    </>
  );
}
