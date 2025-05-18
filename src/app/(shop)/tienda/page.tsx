// import { ProductsPage } from "@/components/products-page"
// import { SiteHeader } from "@/components/site-header"
// import { SiteFooter } from "@/components/site-footer"

import { ProductsPage } from "@/components/pages/products-page"

export const metadata = {
  title: "Shop Premium Hookahs & Accessories | Luxury Hookah",
  description: "Browse our exclusive collection of premium hookahs, tobacco, and accessories.",
}

export default function ShopPage() {
  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1">
        <ProductsPage />
      </main>

    </div>
  )
}
