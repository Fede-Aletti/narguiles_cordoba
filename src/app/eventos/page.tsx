import { EventsHero } from "@/components/pages/events/events-hero";
import { EventsGrid } from "@/components/pages/events/events-grid";

export const metadata = {
  title: "Eventos | Luxury Hookah",
  description:
    "Descubre nuestros exclusivos eventos y experiencias de shisha de lujo.",
};

export default function EventsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <EventsHero />
        <EventsGrid />
      </main>s
    </div>
  );
}
