import { AboutHero } from "@/components/pages/about/about-hero";
import { AboutStory } from "@/components/pages/about/about-story";
import { AboutTimeline } from "@/components/pages/about/about-timeline";
import { AboutValues } from "@/components/pages/about/about-values";

import { AboutContact } from "@/components/pages/about/about-contact";
import { AboutCraftsmanship } from "@/components/pages/about/about-craftmanship";

export const metadata = {
  title: "About Us | Luxury Hookah",
  description:
    "Discover our story, heritage, and commitment to crafting the finest hookah experiences.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <AboutHero />
        <AboutStory />
        <AboutTimeline />
        <AboutCraftsmanship />
        <AboutValues />
        <AboutContact />
      </main>
    </div>
  );
}
