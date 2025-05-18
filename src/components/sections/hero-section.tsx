"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LOGO_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/assets/videos/smoke-bg.mp4" type="video/mp4" />
          Tu navegador no soporta la etiqueta de video.
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-5 h-[20dvh] bg-gradient-to-t from-black to-transparent" />

      <div className="max-w-3xl relative"></div>

      {/* Hero Content - Added Padding for Mobile */}
      <div className="relative container z-10 flex h-full items-center justify-center px-4 pt-24 pb-24 text-center md:pt-0 md:pb-0">
        {/* Left/Top Side Text - Responsive */}
        <div className="absolute top-24 left-1/2 z-10 w-full -translate-x-1/2 transform px-4 md:left-20 md:top-1/2 md:w-auto md:-translate-x-0 md:-translate-y-1/2 md:px-0">
            <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0 md:-rotate-90 md:transform md:origin-bottom-left">
              <span className="whitespace-nowrap text-sm font-medium uppercase tracking-widest text-white">
                Narguilas Cordoba
              </span>
              <div className="w-12 h-px bg-white md:h-12 md:w-px" />
            </div>
          </div>

          {/* Right/Bottom Side Text - Responsive */}
        <div className="absolute bottom-8 left-1/2 z-10 w-full -translate-x-1/2 transform px-4 md:left-auto md:right-20 md:top-1/2 md:bottom-auto md:w-auto md:-translate-x-0 md:-translate-y-1/2 md:px-0">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0 md:rotate-90 md:transform md:origin-bottom-right">
            <span className="whitespace-nowrap text-sm font-medium uppercase tracking-widest text-white">
              La Mayor Variedad del País
            </span>
            <div className="w-12 h-px bg-white md:h-12 md:w-px" />
          </div>
        </div>
        <div className="max-w-3xl space-y-6">
          
          <div className="flex flex-col items-center justify-center">
            <Image
              src={LOGO_URL}
              alt="Narguilas Córdoba"
              width={350}
              height={350}
            />
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl mt-2">
              Narguilas Córdoba
            </h1>
          </div>
          <p className="mx-auto mt-6 max-w-lg text-xl text-gray-300">
            Descubrí nuestra variedad de narguilas y tabacos de alta calidad,
            estamos para ofrecerte experiencias inmejorables.
          </p>
          <div className="mt-10 flex flex-col md:flex-row gap-4 md:gap-x-6 items-center justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
              aria-label="Comprar la colección"
              tabIndex={0}
              onClick={() => router.push("/tienda")}
            >
              Ver productos
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white bg-white/10"
              aria-label="Leer nuestra historia"
              tabIndex={0}
              onClick={() => router.push("/eventos")}
            >
              Eventos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
