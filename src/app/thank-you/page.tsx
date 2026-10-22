import type { Metadata } from "next";
import { ThankYouContent } from "@/components/thank-you-content";

export const metadata: Metadata = { title: "Thank You | Biswas", robots: { index: false, follow: false } };

export default function ThankYouPage() { return <ThankYouContent />; }
