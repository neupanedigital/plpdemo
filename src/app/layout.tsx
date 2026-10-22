import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Biswas 20-Item Mixed Dry Fruits | Cash on Delivery",
  description: "Order a 1 kg jar of Biswas 20-Item Mixed Dry Fruits with Cash on Delivery across Nepal.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Biswas 20-Item Mixed Dry Fruits",
    description: "A colourful 20-item mix for breakfast, snacking and sharing.",
    images: ["/images/mixed-dry-fruits-white.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
