"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, Search, User, LogOut, Package, UserCircle } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"
import { LOGO_URL } from "@/lib/constants"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { CartSheet } from "./cart-sheet"

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cartItems } = useStore()
  const isMobile = useMobile()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Obtener datos del usuario al cargar el componente
  useEffect(() => {
    const supabase = createClient()
    
    async function getUser() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        // Obtener perfil del usuario de la tabla 'user'
        const { data: profile } = await supabase
          .from('user')
          .select('id, first_name, last_name, role')
          .eq('auth_user_id', user.id)
          .single()
        
        setUserProfile(profile)
      }
      
      setLoading(false)
    }
    
    getUser()
    
    // Escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        getUser()
      }
    )
    
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Función para manejar el logout
  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error("Error al cerrar sesión")
    } else {
      setUser(null)
      setUserProfile(null)
      toast.success("Sesión cerrada correctamente")
      router.refresh()
    }
  }

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (userProfile?.first_name || userProfile?.last_name) {
      const first = userProfile.first_name?.charAt(0) || ''
      const last = userProfile.last_name?.charAt(0) || ''
      return (first + last).toUpperCase()
    }
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  // Obtener nombre para mostrar
  const getDisplayName = () => {
    if (userProfile?.first_name || userProfile?.last_name) {
      return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    }
    return user?.email?.split('@')[0] || 'Usuario'
  }

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

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10 rounded-full">
                  {!loading && user ? (
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {!loading && user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        {userProfile?.role && (
                          <p className="text-xs mt-1">
                            <span className="bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5">
                              {userProfile.role}
                            </span>
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/perfil')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/pedidos')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Mis Pedidos</span>
                    </DropdownMenuItem>
                    
                    {/* Si el usuario es admin, mostrar enlace al panel admin */}
                    {userProfile?.role && userProfile.role !== 'client' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                          <span className="mr-2">👑</span>
                          <span>Panel de Admin</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/login')}>
                      <span>Iniciar Sesión</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/signup')}>
                      <span>Registrarse</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CartSheet reemplaza el botón de carrito */}
            <CartSheet />

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
