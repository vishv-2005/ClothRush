'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ProductCard } from '@/components/product-card'
import { ProductGridSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/empty-state'
import { calculateETA, CATEGORY_ICONS } from '@/lib/constants'
import { Search, SlidersHorizontal, X } from 'lucide-react'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  
  // Filters state
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [gender, setGender] = useState(searchParams.get('gender') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category && category !== 'all') params.set('category', category)
      if (gender && gender !== 'all') params.set('gender', gender)
      if (sort) params.set('sort', sort)

      const res = await fetch(`/api/products?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [q, category, gender, sort])

  useEffect(() => {
    // Fetch categories on mount
    fetch('/api/categories').then(res => res.json()).then(data => {
      if (data.categories) setCategories(data.categories)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    // Debounce search input
    const timer = setTimeout(() => {
      fetchProducts()
      
      // Update URL without reload
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category && category !== 'all') params.set('category', category)
      if (gender && gender !== 'all') params.set('gender', gender)
      if (sort && sort !== 'relevance') params.set('sort', sort)
      
      router.push(`/search?${params.toString()}`, { scroll: false })
    }, 500)

    return () => clearTimeout(timer)
  }, [q, category, gender, sort, fetchProducts, router])

  const clearFilters = () => {
    setQ('')
    setCategory('all')
    setGender('all')
    setSort('relevance')
  }

  const hasActiveFilters = q || category !== 'all' || gender !== 'all' || sort !== 'relevance'

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in-up">
      {/* Search Header */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for clothes, stores, trends..."
            className="pl-9 bg-card border-border shadow-sm rounded-xl"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Sheet>
          <SheetTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-card hover:bg-accent hover:text-accent-foreground h-9 w-9 shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Filters</SheetTitle>
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={category === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => setCategory('all')}
                  >
                    All
                  </Badge>
                  {categories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={category === cat.slug ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/90"
                      onClick={() => setCategory(cat.slug)}
                    >
                      {CATEGORY_ICONS[cat.slug] || ''} {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select value={gender} onValueChange={(v) => setGender(v || 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="MEN">Men</SelectItem>
                    <SelectItem value="WOMEN">Women</SelectItem>
                    <SelectItem value="KIDS">Kids</SelectItem>
                    <SelectItem value="UNISEX">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sort} onValueChange={(v) => setSort(v || 'relevance')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results */}
      {loading ? (
        <ProductGridSkeleton count={10} />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((product) => {
            const storeData = Array.isArray(product.store) ? product.store[0] : product.store
            const { eta, distance } = storeData
              ? calculateETA(storeData.latitude, storeData.longitude, undefined, undefined, storeData.preparation_time)
              : { eta: 17, distance: 1.5 }
            return (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  store: storeData,
                  images: product.images || [],
                }}
                distance={distance}
                eta={eta}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="No results found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={
            hasActiveFilters ? (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            ) : null
          }
        />
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6"><ProductGridSkeleton count={10} /></div>}>
      <SearchContent />
    </Suspense>
  )
}
