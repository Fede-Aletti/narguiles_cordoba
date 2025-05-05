import { CircleCheck, Gem, Shield, Users } from "lucide-react";

export function AboutValues() {
  return (
    <section className="bg-black py-20">
      <div className="container px-4 md:px-6">
        <div className="mb-16 text-center">
          <div className="inline-block rounded-lg bg-gold-500/10 px-3 py-1 text-sm text-gold-400">
            Our Philosophy
          </div>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white md:text-4xl">
            Guided by <span className="text-gold-400">Values</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Our core values shape everything we do, from product design to
            customer experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-900 p-6 transition-transform duration-300 hover:scale-105">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10">
              <Gem className="h-6 w-6 text-gold-400" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Excellence</h3>
            <p className="text-gray-400">
              We pursue excellence in every detail, from material selection to
              the final product, ensuring an unparalleled experience.
            </p>
          </div>

          <div className="rounded-lg bg-gray-900 p-6 transition-transform duration-300 hover:scale-105">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10">
              <CircleCheck className="h-6 w-6 text-gold-400" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Authenticity</h3>
            <p className="text-gray-400">
              We honor traditional craftsmanship while embracing innovation,
              creating authentic products with a modern twist.
            </p>
          </div>

          <div className="rounded-lg bg-gray-900 p-6 transition-transform duration-300 hover:scale-105">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10">
              <Shield className="h-6 w-6 text-gold-400" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Integrity</h3>
            <p className="text-gray-400">
              We operate with transparency and honesty, building trust with our
              customers, partners, and community.
            </p>
          </div>

          <div className="rounded-lg bg-gray-900 p-6 transition-transform duration-300 hover:scale-105">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10">
              <Users className="h-6 w-6 text-gold-400" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">Community</h3>
            <p className="text-gray-400">
              We foster a global community of hookah enthusiasts, sharing
              knowledge and celebrating the culture of shisha.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
