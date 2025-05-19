export function AboutCraftsmanship() {
  return (
    <section className="bg-gray-900 py-20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-800">
                <div className="flex h-full items-center justify-center text-white/50 text-sm">
                  Craftsmanship Image 1
                </div>
              </div>
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-800">
                <div className="flex h-full items-center justify-center text-white/50 text-sm">
                  Craftsmanship Image 2
                </div>
              </div>
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-800">
                <div className="flex h-full items-center justify-center text-white/50 text-sm">
                  Craftsmanship Image 3
                </div>
              </div>
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-800">
                <div className="flex h-full items-center justify-center text-white/50 text-sm">
                  Craftsmanship Image 4
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 space-y-6 md:order-2">
            <div className="inline-block rounded-lg bg-gold-500/10 px-3 py-1 text-sm text-gold-400">
              Our Process
            </div>
            <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
              The Art of <span className="text-gold-400">Craftsmanship</span>
            </h2>
            <p className="text-gray-400">
              Each Narguilas Córdoba product is the result of meticulous
              craftsmanship and attention to detail. Our master artisans combine
              traditional techniques with modern innovation to create pieces
              that are not just functional, but works of art.
            </p>
            <p className="text-gray-400">
              From selecting the finest materials to the final quality
              inspection, every step in our process is guided by our commitment
              to excellence. We work with skilled glassblowers, metalworkers,
              and designers who share our passion for creating exceptional
              hookah experiences.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gold-400">50+</div>
                <p className="text-sm text-gray-400">Skilled Artisans</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gold-400">100%</div>
                <p className="text-sm text-gray-400">Hand-Finished</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gold-400">20+</div>
                <p className="text-sm text-gray-400">Quality Checks</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gold-400">12</div>
                <p className="text-sm text-gray-400">Design Awards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
