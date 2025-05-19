"use client";

import { useState } from "react";
import { EventInquiryDialog } from "./events-dialog";

const WHATSAPP_PHONE_NUMBER = "5493424388638" //"5493513705773"; // Ensure no '+' or special characters

export function EventCateringService() {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const handleOpenDialog = () => setIsDialogVisible(true);
  const handleCloseDialog = () => setIsDialogVisible(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      handleOpenDialog();
    }
  };

  return (
    <>
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="order-2 md:order-1">
              <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
                Nuestro Servicio de Catering de Narguilas
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Narguilas Córdoba te ofrece el mejor servicio personalizado de catering
                de narguilas para <span className="text-gold-400">casamientos,
                reuniones, convenciones, fiestas privadas</span> y demás eventos.
                Acompaña tus momentos especiales con nuestras narguilas premium y
                llena de buen humo tu evento para hacerlo diferente.
              </p>
              <p className="mt-4 text-gray-400">
                Disponemos de distintos tipos de servicios con la posibilidad de
                elegir entre el número y tipo de narguilas, así como la
                cantidad y calidad de los sabores que disfrutarás en el evento.
              </p>
              <p className="mt-4 text-gray-400">
                Nuestro personal está ampliamente calificado y especializado en
                el sector, con una larga experiencia para que no tengas que
                preocuparte de que nada salga mal. Creemos que una buena
                narguila tiene que estar preparada con los mejores productos,
                por ello nunca escatimamos en tener lo mejor del mercado. La{" "}
                <span className="font-semibold text-gold-300">calidad y novedad</span>{" "}
                son nuestro punto diferenciador para que tu evento sea
                diferencial y se convierta en una experiencia única.
              </p>
              <div className="mt-8">
                <button
                  onClick={handleOpenDialog}
                  onKeyDown={handleKeyDown}
                  className="rounded-md bg-gold-500 px-8 py-3 text-lg font-semibold text-black shadow-md transition-colors hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Solicitar presupuesto para catering de narguilas"
                  tabIndex={0}
                >
                  Solicitar Presupuesto
                </button>
              </div>
            </div>
            <div className="order-1 md:order-2">
              {/* You can add an illustrative image here if you have one */}
              {/* For example:
              <img 
                src="/placeholder.svg?height=500&width=500&text=Catering+Premium" 
                alt="Servicio de Catering de Narguilas Premium" 
                className="rounded-lg shadow-xl aspect-square object-cover"
              /> 
              */}
              <div className="aspect-square w-full rounded-lg bg-gray-800 shadow-xl">
                 <img 
                    src="/placeholder.svg?height=500&width=500&text=Catering+Narguilas" 
                    alt="Catering de Narguilas Narguilas Córdoba" 
                    className="h-full w-full rounded-lg object-cover"
                  />
              </div>
            </div>
          </div>
        </div>
      </section>
      <EventInquiryDialog
        isOpen={isDialogVisible}
        onClose={handleCloseDialog}
        phoneNumber={WHATSAPP_PHONE_NUMBER}
      />
    </>
  );
}
