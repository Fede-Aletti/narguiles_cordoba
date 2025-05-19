import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  stock?: number;
  maxStock?: number;
};

type CartItem = {
  product: Product & { maxStock?: number };
  quantity: number;
};

type StoreState = {
  products: Product[];
  cartItems: CartItem[];
  favoriteProductIds: number[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setFavoriteIds: (ids: number[]) => void;
  addFavoriteIdToStore: (id: number) => void;
  removeFavoriteIdFromStore: (id: number) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: [],
      cartItems: [],
      favoriteProductIds: [],

      addToCart: (product, quantity = 1) =>
        set((state) => {
          const mainImage =
            product.image ||
            (product.media && product.media[0]?.url) ||
            "/placeholder.svg";
          const storeProduct: Product = {
            id: product.id,
            name: product.name,
            description: product.description || "",
            price: product.price || 0,
            image: mainImage,
            category:
              typeof product.category === "object" && product.category?.name
                ? product.category.name
                : product.category || "unknown",
            stock: product.stock,
            maxStock: product.stock || product.maxStock || 99,
          };
          const existingItem = state.cartItems.find(
            (item) => item.product.id === product.id
          );
          const maxStock = storeProduct.maxStock || 99;

          if (existingItem) {
            const newQty = Math.min(existingItem.quantity + quantity, maxStock);
            return {
              cartItems: state.cartItems.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: newQty }
                  : item
              ),
            };
          }
          return {
            cartItems: [
              ...state.cartItems,
              { product: storeProduct, quantity: Math.min(quantity, maxStock) },
            ],
          };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.product.id !== productId
          ),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) => {
            if (item.product.id === productId) {
              const maxStock = item.product.maxStock || 99;
              return {
                ...item,
                quantity: Math.max(1, Math.min(quantity, maxStock)),
              };
            }
            return item;
          }),
        })),

      clearCart: () => set({ cartItems: [] }),

      setFavoriteIds: (ids) => set({ favoriteProductIds: ids }),
      
      addFavoriteIdToStore: (id) => 
        set((state) => ({
          favoriteProductIds: state.favoriteProductIds.includes(id) 
            ? state.favoriteProductIds 
            : [...state.favoriteProductIds, id],
        })),

      removeFavoriteIdFromStore: (id) => 
        set((state) => ({
          favoriteProductIds: state.favoriteProductIds.filter((favId) => favId !== id),
        })),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cartItems: state.cartItems }),
      onRehydrateStorage: (state) => {
        console.log("hydration starts");
        return (state, error) => {
          if (error) {
            console.error("an error happened during hydration", error);
          } else {
            console.log("hydration finished");
          }
        };
      },
    }
  )
);
