// Ejemplo en un componente de cliente, ej: components/LogoutButton.tsx
"use client";

import { logout } from "@/actions/logout-action"; // Asegúrate que la ruta es correcta

export function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 font-semibold text-white bg-red-500 rounded hover:bg-red-600"
      aria-label="Cerrar sesión"
    >
      Cerrar Sesión
    </button>
  );
}
