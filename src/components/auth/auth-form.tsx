"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';

export function AuthForm() {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } else {
      toast.success("¡Bienvenido de vuelta!");
      const returnTo = searchParams.get("returnTo") || "/tienda";
      router.push(returnTo);
      router.refresh(); // To ensure layout re-renders with user state
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { // This data is passed to the new user in auth.users, not directly to public.user trigger data
          // The trigger `handle_new_user` only uses NEW.id from auth.users
        },
      },
    });

    if (signUpError) {
      toast.error(signUpError.message || "Error al registrar. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
       toast.info("Este correo ya está registrado. Intenta iniciar sesión.");
       setIsRegisterView(false); // Switch to login view
       setLoading(false);
       return;
    }

    // If sign up is successful and requires email confirmation, user will be in auth.users
    // but session might not be active yet.
    // The trigger `handle_new_user` creates the entry in `public.user`.
    // Now, update the public.user record with first_name and last_name.
    if (signUpData.user) {
        const { error: profileUpdateError } = await supabase
            .from('user')
            .update({ first_name: firstName, last_name: lastName, updated_at: new Date().toISOString() })
            .eq('auth_user_id', signUpData.user.id);

        if (profileUpdateError) {
            toast.error("Error al guardar datos del perfil: " + profileUpdateError.message);
            // User is signed up, but profile data might be missing. They can update it later.
        } else {
            toast.success("¡Registro exitoso!");
        }

        // Check if email confirmation is required by Supabase settings
        if (signUpData.session) { // User is immediately logged in
            const returnTo = searchParams.get("returnTo") || "/tienda";
            router.push(returnTo);
            router.refresh();
        } else {
             // Email confirmation needed
            toast.info("Se ha enviado un correo de confirmación. Por favor, verifica tu bandeja de entrada.");
            // Stay on login page, or redirect to a specific "check your email" page
        }
    } else {
        // Should not happen if signUpError is null, but as a safeguard
        toast.error("Error inesperado durante el registro.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-3xl font-serif font-bold text-center text-white mb-3">
        {isRegisterView ? "Crear Cuenta" : "Iniciar Sesión"}
      </h2>
      <p className="text-center text-gray-400 mb-8">
        {isRegisterView ? "Únete para acceder a beneficios exclusivos." : "Accede a tu cuenta para continuar."}
      </p>

      <form onSubmit={isRegisterView ? handleRegister : handleLogin} className="space-y-6">
        {isRegisterView && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstNameInput" className="text-gray-300">Nombre</Label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="firstNameInput"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-gold-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastNameInput" className="text-gray-300">Apellido</Label>
              <div className="relative mt-1">
                 <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="lastNameInput"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  required
                  className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-gold-500"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="emailInput" className="text-gray-300">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="emailInput"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-gold-500"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="passwordInput" className="text-gray-300">Contraseña</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="passwordInput"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={isRegisterView ? 6 : undefined} // Supabase default min password length is 6
              className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white focus:border-gold-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gold-400"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold py-3 transition-colors duration-300 disabled:opacity-70"
        >
          {loading
            ? (<span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Procesando...</span>)
            : isRegisterView
            ? "Crear Cuenta"
            : "Iniciar Sesión"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsRegisterView(!isRegisterView)}
          className="text-sm text-gold-400 hover:text-gold-300 hover:underline transition-colors duration-300"
        >
          {isRegisterView
            ? "¿Ya tienes una cuenta? Inicia Sesión"
            : "¿No tienes cuenta? Regístrate Aquí"}
        </button>
      </div>
    </div>
  );
} 