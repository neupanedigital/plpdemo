import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Checkout | Biswas Mixed Dry Fruits", description: "Complete your Cash on Delivery order." };

function LoadingCheckout() { return <div className="grid min-h-[60vh] place-items-center text-sm font-bold text-[#536158]">Loading checkout…</div>; }

export default function CheckoutPage() {
  return <><SiteHeader /><main className="min-h-screen bg-[#f7f2e6]"><Suspense fallback={<LoadingCheckout />}><CheckoutForm /></Suspense></main><Footer /></>;
}
