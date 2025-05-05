"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, Search, User } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"
import { LOGO_URL } from "@/lib/constants"

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cartItems } = useStore()
  const isMobile = useMobile()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl font-bold text-white">
            <Image src={LOGO_URL} alt="Narguilas Córdoba" width={40} height={40} />
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/tienda" className="text-white hover:text-primary transition-colors hover:underline underline-offset-4">
                Tienda
              </Link>
              <Link href="/eventos" className="text-white hover:text-primary transition-colors hover:underline underline-offset-4">
                Eventos
              </Link>
              <Link href="/nosotros" className="text-white hover:text-primary transition-colors hover:underline underline-offset-4">
                Sobre Nosotros
              </Link>
              <Link href="/contacto" className="text-white hover:text-primary transition-colors hover:underline underline-offset-4">
                Contacto
              </Link>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button> */}

            <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10 relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartItems.length}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>

            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary hover:bg-white/10 md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Menu</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 top-16 bg-black z-40 p-4">
          <nav className="flex flex-col space-y-6 pt-8">
            <Link
              href="/shop"
              className="text-white text-2xl font-serif hover:text-primary transition-colors hover:underline underline-offset-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/collections"
              className="text-white text-2xl font-serif hover:text-primary transition-colors hover:underline underline-offset-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Collections
            </Link>
            <Link
              href="/about"
              className="text-white text-2xl font-serif hover:text-primary transition-colors hover:underline underline-offset-4"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white text-2xl font-serif hover:text-primary transition-colors hover:underline underline-offset-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
