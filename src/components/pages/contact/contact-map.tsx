export function ContactMap() {
  return (
    <div className="bg-gray-950 py-16">
      <div className="container px-4 md:px-6">
        <h2 className="mb-8 text-center font-serif text-3xl font-bold text-white">
          Nuestras <span className="text-gold-400">Ubicaciones</span>
        </h2>
        <div className="overflow-hidden rounded-lg bg-gray-900">
          <div className="aspect-video w-full">
            <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-500">
              Mapa de ubicaciones
              {/* En una implementación real, aquí iría un mapa interactivo */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
