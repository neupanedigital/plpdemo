import { Leaf, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0c2d1b] py-10 text-white">
      <div className="section-shell flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
        <div><div className="mb-3 flex items-center gap-2 text-lg font-black"><Leaf size={20} /> BISWAS</div><p className="max-w-md text-sm leading-6 text-white/65">20-item mixed dry fruits packed for easy everyday snacking. Cash on Delivery available across Nepal.</p></div>
        <a href="mailto:digitalbiznep@gmail.com" className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"><Mail size={17} /> digitalbiznep@gmail.com</a>
      </div>
    </footer>
  );
}
