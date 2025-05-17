import { HeroSection } from "@/components/sections/hero-section";
import { PromotionCarousel } from "@/components/sections/promotion-carousel";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { OurStores } from "@/components/sections/our-stores";
import { PartnerRetailers } from "@/components/sections/partner-retailers";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PromotionCarousel />
      <FeaturedProducts />
      <OurStores />
      <PartnerRetailers />
    </>
  );
}
