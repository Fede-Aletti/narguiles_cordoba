import { ProductDetail } from "@/components/pages/product-detail"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const slug = params.slug

  if (slug === undefined) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1 pt-16">
        <ProductDetail slug={slug} />
      </main>

    </div>
  )
}
