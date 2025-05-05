import { Button } from "@/components/ui/button";

export function AboutStory() {
  return (
    <section className="bg-black py-20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="inline-block rounded-lg bg-gold-500/10 px-3 py-1 text-sm text-gold-400">
              Our Heritage
            </div>
            <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
              A Passion for <span className="text-gold-400">Excellence</span>
            </h2>
            <p className="text-gray-400">
              Founded in 2010 by hookah enthusiasts with a vision to elevate the
              shisha experience, Luxury Hookah began as a small boutique in the
              heart of the city. Our founders, driven by their passion for
              craftsmanship and authentic experiences, set out to create a brand
              that would redefine luxury in the hookah industry.
            </p>
            <p className="text-gray-400">
              What started as a curated collection of premium hookahs has
              evolved into a global brand synonymous with excellence. Today, we
              continue to honor traditional craftsmanship while embracing
              innovation, creating products that blend heritage with
              contemporary design.
            </p>
            <Button className="bg-gold-500 text-black hover:bg-gold-600">
              Our Philosophy
            </Button>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-800">
            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
              Founder Image
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
