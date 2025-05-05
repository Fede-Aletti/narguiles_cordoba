import { create } from "zustand"

export type Product = {
  id: number
  name: string
  description: string
  price: number
  image?: string
  category: string
}

type CartItem = {
  product: Product
  quantity: number
}

type StoreState = {
  products: Product[]
  cartItems: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
}

export const useStore = create<StoreState>((set) => ({
  products: [
    {
      id: 1,
      name: "Royal Sultan Hookah",
      description: "Hand-crafted premium hookah with gold accents and crystal embellishments.",
      price: 299.99,
      category: "hookahs",
    },
    {
      id: 2,
      name: "Midnight Bliss Tobacco",
      description: "A rich blend of exotic flavors with notes of berries and mint.",
      price: 24.99,
      category: "tobacco",
    },
    {
      id: 3,
      name: "Diamond Glass Bowl",
      description: "Premium heat-resistant glass bowl with intricate diamond pattern.",
      price: 49.99,
      category: "accessories",
    },
    {
      id: 4,
      name: "Velvet Smoke Hose",
      description: "Luxury silicone hose with velvet exterior and gold-plated tips.",
      price: 39.99,
      category: "accessories",
    },
    {
      id: 5,
      name: "Celestial Hookah",
      description: "Modern design with LED lighting and premium stainless steel construction.",
      price: 249.99,
      category: "hookahs",
    },
    {
      id: 6,
      name: "Exotic Spice Tobacco",
      description: "A warm, spicy blend with cinnamon, cardamom, and a hint of vanilla.",
      price: 22.99,
      category: "tobacco",
    },
  ],
  cartItems: [],

  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cartItems.find((item) => item.product.id === product.id)

      if (existingItem) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }

      return {
        cartItems: [...state.cartItems, { product, quantity: 1 }],
      }
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    })),
}))
