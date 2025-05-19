import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export function CartSheet() {
  const cartItems = useStore((state) => state.cartItems);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const clearCart = useStore((state) => state.clearCart);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/10 relative">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            <circle cx="7" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
          </svg>
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {cartItems.length}
            </span>
          )}
          <span className="sr-only">Carrito</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Tu Carrito</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 py-4 flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Tu carrito está vacío</div>
          ) : (
            cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 border-b border-gray-800 pb-4">
                <div className="relative w-16 h-16 bg-gray-900 rounded overflow-hidden">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{product.name}</div>
                  <div className="text-sm text-gray-400">${product.price.toFixed(2)} c/u</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 p-0"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      disabled={quantity <= 1}
                      aria-label="Restar"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-white">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 p-0"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={typeof product.maxStock === 'number' ? quantity >= product.maxStock : false}
                      aria-label="Sumar"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-gold-400 font-semibold">${(product.price * quantity).toFixed(2)}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-500/10"
                    onClick={() => removeFromCart(product.id)}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-gray-800 pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg text-white font-semibold">Total</span>
            <span className="text-2xl text-gold-400 font-bold">${total.toFixed(2)}</span>
          </div>
          <SheetFooter>
            <Link href="/checkout" className="w-full">
              <Button className="w-full bg-gold-500 hover:bg-gold-600 text-black" disabled={cartItems.length === 0}>
                Finalizar compra
              </Button>
            </Link>
          </SheetFooter>
          <Button variant="link" className="w-full mt-2 text-gray-400" onClick={clearCart} disabled={cartItems.length === 0}>
            Vaciar carrito
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
} 