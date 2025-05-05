
import { ProductDetail } from "@/components/pages/product-detail"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    productId: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  // In a real app, you would fetch the product data from an API or database
  // For now, we'll use a placeholder to demonstrate the UI
  const productId = Number.parseInt(params.productId)

  if (isNaN(productId)) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1 pt-16">
        <ProductDetail productId={productId} />
      </main>

    </div>
  )
}
