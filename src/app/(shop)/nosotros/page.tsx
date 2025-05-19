import { NosotrosHero } from "@/components/pages/about/about-hero";
import { NuestraHistoria } from "@/components/pages/about/about-story";
import { AboutTimeline } from "@/components/pages/about/about-timeline";
import { NuestrosValores } from "@/components/pages/about/about-values";


export const metadata = {
  title: "Nosotros | Narguilas Córdoba",
  description:
    "Descubre nuestra historia, nuestro compromiso y nuestra pasión por ofrecer las mejores experiencias narguileras.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <NosotrosHero />
        <NuestraHistoria />
        <AboutTimeline />
        <NuestrosValores />
        {/* <AboutContact /> */}
      </main>
    </div>
  );
}
