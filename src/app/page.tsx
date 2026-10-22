import { BenefitsAndUse, FAQ, TestimonialsPlaceholder, TrustAndFinalCTA } from "@/components/landing-sections";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { ProductShowcase } from "@/components/product-showcase";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return <><SiteHeader /><main><Hero /><ProductShowcase /><BenefitsAndUse /><TestimonialsPlaceholder /><FAQ /><TrustAndFinalCTA /></main><Footer /></>;
}
