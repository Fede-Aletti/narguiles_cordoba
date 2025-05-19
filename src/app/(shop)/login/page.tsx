"use client";

import { AuthForm } from "@/components/auth/auth-form";
import Link from "next/link";
import Image from "next/image";
import { LOGO_URL } from "@/lib/constants"; // Assuming LOGO_URL is available

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      
        <Link href="/" className="flex items-center gap-2 text-white hover:text-gold-400 transition-colors">
          <Image src={LOGO_URL} alt="Logo" width={200} height={200} />
        </Link>
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-xl">
        <AuthForm />
      </div>
      <p className="mt-8 text-gray-400 text-sm">
        Explora nuestra tienda de <Link href="/tienda" className="text-gold-400 hover:underline">productos premium</Link>.
      </p>
    </div>
  );
} 