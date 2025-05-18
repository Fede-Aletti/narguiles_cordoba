"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"

import { ProductSearch } from "../product-search"
import { ProductSort } from "../product-sort"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import type { Product } from "@/lib/store"
import { ProductCard } from "../product-card"
import { ProductFilters } from "../product-filters"

export function ProductsPage() {
  const { products } = useStore()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [sortOption, setSortOption] = useState<string>("featured")
  const [showFilters, setShowFilters] = useState(false)
  const isMobile = useMobile()

  // Apply filters and search
  useEffect(() => {
    let result = [...products]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category))
    }

    // Apply price range filter
    result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // 'featured' - no additional sorting
        break
    }

    setFilteredProducts(result)
  }, [products, searchQuery, selectedCategories, priceRange, sortOption])

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setPriceRange([0, 500])
    setSortOption("featured")
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products.map((product) => product.category)))

  // Calculate price range from products
  const maxPrice = Math.max(...products.map((product) => product.price))

  return (
    <div className="bg-black min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-12 md:py-16">
        <div className="container  pt-24 px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white text-center">
            Premium <span className="text-gold-400">Collection</span>
          </h1>
          <p className="mt-4 text-gray-400 text-center max-w-2xl mx-auto">
            Descubre nuestra colección de productos premium, diseñados para ofrecerte la mejor experiencia.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        {/* Mobile Filter Toggle */}
        {isMobile && (
          <div className="mb-4">
            <Button
              variant="outline"
              className="w-full border-gold-500 text-gold-400 hover:bg-gold-500/10"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <>
                  <X className="mr-2 h-4 w-4" /> Hide Filters
                </>
              ) : (
                <>
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Show Filters
                </>
              )}
            </Button>
          </div>
        )}

        {/* Search and Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <ProductSearch value={searchQuery} onChange={setSearchQuery} />
          <ProductSort value={sortOption} onChange={setSortOption} />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          {(!isMobile || showFilters) && (
            <div className="w-full md:w-64 flex-shrink-0 bg-gray-900 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-white">Filters</h2>
                <Button variant="link" className="text-gold-400 p-0 h-auto" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
              <ProductFilters
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                priceRange={priceRange}
                maxPrice={maxPrice}
                onPriceRangeChange={setPriceRange}
              />
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
                <p className="text-gray-400">Try adjusting your filters or search query</p>
                <Button variant="outline" className="mt-4 border-gold-500 text-gold-400" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-400">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
