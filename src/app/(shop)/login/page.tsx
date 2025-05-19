"use client";

import { AuthForm } from "@/components/auth/auth-form";
import Link from "next/link";
import Image from "next/image";
import { LOGO_URL } from "@/lib/constants"; // Assuming LOGO_URL is available
import { Suspense } from 'react';

// Define a fallback component for AuthForm
const AuthFormLoading = () => (
  <div className="w-full animate-pulse">
    <div className="h-10 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div> {/* Title Skeleton */}
    <div className="h-6 bg-gray-700 rounded w-full mx-auto mb-8"></div> {/* Subtitle Skeleton */}
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-1/4"></div> {/* Label Skeleton */}
        <div className="h-10 bg-gray-800 rounded w-full"></div> {/* Input Skeleton */}
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-1/4"></div> {/* Label Skeleton */}
        <div className="h-10 bg-gray-800 rounded w-full"></div> {/* Input Skeleton */}
      </div>
      <div className="h-12 bg-gold-700 rounded w-full mt-6"></div> {/* Button Skeleton */}
    </div>
    <div className="mt-6 text-center">
      <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div> {/* Toggle Link Skeleton */}
    </div>
  </div>
);

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      
        <Link href="/" className="flex items-center gap-2 text-white hover:text-gold-400 transition-colors mb-8">
          <Image src={LOGO_URL} alt="Logo" width={200} height={200} />
        </Link>
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-xl">
        <Suspense fallback={<AuthFormLoading />}>
          <AuthForm />
        </Suspense>
      </div>
      <p className="mt-8 text-gray-400 text-sm">
        Explora nuestra tienda de <Link href="/tienda" className="text-gold-400 hover:underline">productos premium</Link>.
      </p>
    </div>
  );
} 