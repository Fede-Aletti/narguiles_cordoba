import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useCreateOrder } from '@/lib/queries/order-queries';
import { useRouter } from 'next/navigation';

interface CartSummaryProps {
  cartItems: any[];
  selectedAddressId: number | null;
}

export function CartSummary({ cartItems, selectedAddressId }: CartSummaryProps) {
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const { mutate: createOrder, status, error } = useCreateOrder();
  const isLoading = status === "pending";
  const isError = status === "error";
  const router = useRouter();

  const handleConfirm = () => {
    if (!selectedAddressId || cartItems.length === 0) return;
    createOrder(
      { addressId: selectedAddressId, cartItems },
      {
        onSuccess: (order) => {
          router.push('/pedidos');
        },
      }
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Resumen de compra</h2>
      {cartItems.length === 0 ? (
        <div className="text-gray-400">Tu carrito está vacío.</div>
      ) : (
        <div className="space-y-4 mb-4">
          {cartItems.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-4 border-b border-gray-800 pb-2">
              <div className="relative w-12 h-12 bg-gray-900 rounded overflow-hidden">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{product.name}</div>
                <div className="text-sm text-gray-400">x{quantity}</div>
              </div>
              <div className="text-gold-400 font-semibold">${(product.price * quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center border-t border-gray-800 pt-4 mt-4">
        <span className="text-lg text-white font-semibold">Total</span>
        <span className="text-2xl text-gold-400 font-bold">${total.toFixed(2)}</span>
      </div>
      <Button
        className="w-full mt-6 bg-gold-500 hover:bg-gold-600 text-black"
        disabled={!selectedAddressId || cartItems.length === 0 || isLoading}
        onClick={handleConfirm}
      >
        {isLoading ? "Procesando..." : "Confirmar compra"}
      </Button>
      {!selectedAddressId && <div className="text-red-500 text-sm mt-2">Selecciona una dirección para continuar.</div>}
      {isError && <div className="text-red-500 text-sm mt-2">{(error as Error)?.message || "Error al crear la orden"}</div>}
    </div>
  );
} 