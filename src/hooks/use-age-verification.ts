"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function useAgeVerification() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAgeVerification = async () => {
      try {
        // Verificar si el usuario está autenticado
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Si el usuario está logueado, no mostrar el modal
        if (user) {
          setShowModal(false);
          setIsLoading(false);
          return;
        }

        // Verificar si ya se verificó la edad en esta sesión
        const ageVerified = sessionStorage.getItem("age_verified");
        
        if (!ageVerified) {
          setShowModal(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking age verification:", error);
        setIsLoading(false);
      }
    };

    checkAgeVerification();
  }, []);

  const handleConfirm = () => {
    setShowModal(false);
  };

  return {
    showModal,
    isLoading,
    handleConfirm,
  };
} 