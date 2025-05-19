"use client"

import { useState, useEffect } from "react"
import { ProductSearch } from "../product-search"
import { ProductSort } from "../product-sort"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { ProductCard } from "../product-card"
import { ProductFilters } from "../product-filters"
import { useShopProducts, useShopCategories, useShopBrands } from "@/lib/queries/shop-queries"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductsPage() {
  // Fetch data using React Query
  const { data: products = [], isLoading: productsLoading } = useShopProducts()
  const { data: categories = [], isLoading: categoriesLoading } = useShopCategories()
  const { data: brands = [], isLoading: brandsLoading } = useShopBrands()

  // UI state
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedBrands, setSelectedBrands] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortOption, setSortOption] = useState<string>("featured")
  const [showFilters, setShowFilters] = useState(false)
  const isMobile = useMobile()

  // Initialize filtered products when products load
  useEffect(() => {
    if (products.length > 0) {
      setFilteredProducts(products)
      
      // Set initial price range based on actual product prices
      const maxPrice = Math.max(...products.map(p => p.price || 0)) + 100
      setPriceRange([0, maxPrice])
    }
  }, [products])

  // Apply filters when filter criteria change
  useEffect(() => {
    if (!products.length) return

    let result = [...products]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) => 
          product.name.toLowerCase().includes(query) || 
          (product.description && product.description.toLowerCase().includes(query)) ||
          (product.brand?.name?.toLowerCase().includes(query)) ||
          (product.category?.name?.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) => 
        product.category_id && selectedCategories.includes(product.category_id)
      )
    }

    // Apply brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((product) => 
        product.brand_id && selectedBrands.includes(product.brand_id)
      )
    }

    // Apply price range filter
    result = result.filter((product) => {
      const price = product.price || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price-desc":
        result.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "newest":
        result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      default:
        // 'featured' - no additional sorting
        break
    }

    setFilteredProducts(result)
  }, [products, searchQuery, selectedCategories, selectedBrands, priceRange, sortOption])

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([0, getMaxPrice()])
    setSortOption("featured")
  }

  // Calculate max price from products
  const getMaxPrice = () => {
    if (!products.length) return 1000
    return Math.max(...products.map((product) => product.price || 0)) + 100
  }

  // Loading state
  if (productsLoading) {
    return <ProductsPageSkeleton />
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-12 md:py-16">
        <div className="container pt-24 px-4 md:px-6">
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
                  <X className="mr-2 h-4 w-4" /> Ocultar Filtros
                </>
              ) : (
                <>
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Mostrar Filtros
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
                <h2 className="text-xl font-serif font-bold text-white">Filtros</h2>
                <Button 
                  variant="link" 
                  className="text-gold-400 p-0 h-auto" 
                  onClick={resetFilters}
                >
                  Resetear
                </Button>
              </div>
              <ProductFilters
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                brands={brands}
                selectedBrands={selectedBrands}
                onBrandChange={setSelectedBrands}
                priceRange={priceRange}
                maxPrice={getMaxPrice()}
                onPriceRangeChange={setPriceRange}
              />
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-white mb-2">No se encontraron productos</h3>
                <p className="text-gray-400">Intenta ajustar tus filtros o términos de búsqueda</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-gold-500 text-gold-400" 
                  onClick={resetFilters}
                >
                  Resetear Filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-400">
                  Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
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

// Loading skeleton for products page
function ProductsPageSkeleton() {
  return (
    <div className="bg-black min-h-screen">
      {/* Page Header Skeleton */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-12 md:py-16">
        <div className="container pt-24 px-4 md:px-6">
          <Skeleton className="h-10 w-64 bg-gray-800 mx-auto mb-4" />
          <Skeleton className="h-4 w-full max-w-2xl bg-gray-800 mx-auto" />
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        {/* Search/Sort Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1 bg-gray-800" />
          <Skeleton className="h-10 w-[180px] bg-gray-800" />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Skeleton */}
          <div className="hidden md:block w-64 flex-shrink-0 bg-gray-900 p-6 rounded-lg">
            <Skeleton className="h-6 w-32 bg-gray-800 mb-6" />
            <div className="space-y-8">
              <div>
                <Skeleton className="h-5 w-24 bg-gray-800 mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-5 w-full bg-gray-800" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-24 bg-gray-800 mb-4" />
                <Skeleton className="h-10 w-full bg-gray-800 mb-4" />
              </div>
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            <Skeleton className="h-5 w-40 bg-gray-800 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <Skeleton className="h-52 w-full bg-gray-800" />
                  <div className="p-6">
                    <div className="flex justify-between mb-4">
                      <Skeleton className="h-5 w-32 bg-gray-800" />
                      <Skeleton className="h-5 w-16 bg-gray-800" />
                    </div>
                    <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
                    <Skeleton className="h-4 w-3/4 bg-gray-800 mb-6" />
                    <Skeleton className="h-10 w-full bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
