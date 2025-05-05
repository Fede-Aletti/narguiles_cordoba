"use client"

import { useRef, useEffect } from "react"
import { motion, useInView, useAnimation } from "framer-motion"

interface TimelineEvent {
  year: string
  title: string
  description: string
}

const timelineEvents: TimelineEvent[] = [
  {
    year: "2010",
    title: "The Beginning",
    description:
      "Luxury Hookah was founded with a vision to create the finest hookah products, opening our first boutique store.",
  },
  {
    year: "2012",
    title: "First Signature Collection",
    description:
      "We launched our first signature collection, featuring hand-crafted hookahs that quickly gained recognition among connoisseurs.",
  },
  {
    year: "2014",
    title: "International Expansion",
    description:
      "Our products reached international markets, establishing Luxury Hookah as a global brand in premium shisha products.",
  },
  {
    year: "2016",
    title: "Award-Winning Designs",
    description:
      "Our Royal Sultan collection won the prestigious Design Excellence Award for its innovative approach to traditional hookah design.",
  },
  {
    year: "2018",
    title: "Second Flagship Store",
    description:
      "We opened our second flagship store, featuring an exclusive lounge where customers could experience our products firsthand.",
  },
  {
    year: "2020",
    title: "10th Anniversary",
    description:
      "Celebrating a decade of excellence with the launch of our limited edition Anniversary Collection, featuring 24K gold accents.",
  },
  {
    year: "2022",
    title: "Sustainable Initiative",
    description:
      "Introduced our eco-conscious line, combining luxury with sustainability through responsibly sourced materials.",
  },
  {
    year: "2023",
    title: "Digital Transformation",
    description:
      "Launched our immersive online shopping experience, bringing the luxury of our physical stores to the digital realm.",
  },
]

export function AboutTimeline() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, amount: 0.1 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <section className="bg-gradient-to-b from-black to-gray-900 py-20">
      <div className="container px-4 md:px-6">
        <div className="mb-16 text-center">
          <div className="inline-block rounded-lg bg-gold-500/10 px-3 py-1 text-sm text-gold-400">Our Journey</div>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white md:text-4xl">
            The <span className="text-gold-400">Evolution</span> of Excellence
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Tracing our path from a small boutique to a global luxury brand, each milestone represents our commitment to
            craftsmanship and innovation.
          </p>
        </div>

        <div ref={ref} className="relative mx-auto max-w-4xl">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-gold-500/80 via-gold-500/50 to-gold-500/10"></div>

          {/* Timeline Events */}
          <div className="space-y-24">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.year}
                className={`relative flex ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} items-center`}
                initial="hidden"
                animate={controls}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.2 } },
                }}
              >
                {/* Timeline Dot */}
                <div className="absolute left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full border-4 border-gold-500 bg-black"></div>

                {/* Content */}
                <div className={`w-1/2 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left"}`}>
                  <div className="rounded-lg bg-gray-800 p-6 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-gold-500/20">
                    <span className="inline-block rounded-full bg-gold-500 px-3 py-1 text-sm font-bold text-black">
                      {event.year}
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-white">{event.title}</h3>
                    <p className="mt-2 text-gray-400">{event.description}</p>
                  </div>
                </div>

                {/* Empty space for the other side */}
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
