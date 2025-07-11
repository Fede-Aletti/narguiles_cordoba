export function EventsHero() {
  return (
    <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <div className="h-full w-full bg-[url('/assets/images/eventos/1.jpeg')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Nuestros <span className="text-gold-400">Eventos</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-xl text-gray-300">
            Eleva tu evento a un nuevo nivel.
          </p>
        </div>
      </div>
    </section>
  );
}
