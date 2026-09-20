import Link from 'next/link'
import { ArrowRight, Zap, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/product-card'
import { createClient } from '@/lib/supabase/server'
import { calculateETA, DEFAULT_CITY, CATEGORY_ICONS } from '@/lib/constants'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  // Fetch trending products (highest rated)
  const { data: trendingProducts } = await supabase
    .from('products')
    .select(`
      *,
      store:stores!inner(id, name, latitude, longitude, preparation_time),
      images:product_images(*)
    `)
    .eq('is_active', true)
    .eq('is_published', true)
    .order('rating', { ascending: false })
    .limit(10)

  // Fetch new arrivals
  const { data: newArrivals } = await supabase
    .from('products')
    .select(`
      *,
      store:stores!inner(id, name, latitude, longitude, preparation_time),
      images:product_images(*)
    `)
    .eq('is_active', true)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch affordable products
  const { data: affordableProducts } = await supabase
    .from('products')
    .select(`
      *,
      store:stores!inner(id, name, latitude, longitude, preparation_time),
      images:product_images(*)
    `)
    .eq('is_active', true)
    .eq('is_published', true)
    .lt('price', 1000)
    .order('price')
    .limit(10)

  return (
    <div className="animate-fade-in-up">
      {/* Hero Section */}
      <section className="brand-gradient text-white">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
            <MapPin className="h-4 w-4" />
            <span>{DEFAULT_CITY}</span>
            <span className="mx-1">·</span>
            <Zap className="h-4 w-4" />
            <span className="font-semibold text-white">Delivering in 15–20 min</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
            LOCAL FASHION
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white/90 mb-4">
            DELIVERED FAST
          </h2>
          <p className="text-white/70 text-lg mb-6 max-w-md">
            Discover trendy clothes from stores near you. Get them delivered in minutes, not days.
          </p>

          <div className="flex gap-3">
            <Link href="/search">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold rounded-xl">
                Shop Now
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="container mx-auto px-4 -mt-5">
        <Link href="/search">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-3 flex items-center gap-3 hover:shadow-xl transition-shadow cursor-pointer">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              Search shirts, kurtis, jeans...
            </span>
          </div>
        </Link>
      </div>

      <div className="container mx-auto px-4 mt-8 space-y-10">
        {/* Categories */}
        <section>
          <h2 className="text-lg font-bold mb-4">Shop by Category</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex-shrink-0"
              >
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all min-w-[80px]">
                  <span className="text-2xl">{CATEGORY_ICONS[cat.slug] || '👕'}</span>
                  <span className="text-xs font-medium text-center whitespace-nowrap">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Near You */}
        {trendingProducts && trendingProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">🔥 Trending Near You</h2>
              <Link href="/search?sort=rating" className="text-sm text-primary font-medium flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {trendingProducts.map((product) => {
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
          </section>
        )}

        {/* Available Under 20 Min */}
        {affordableProducts && affordableProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">⚡ Under ₹1,000</h2>
              <Link href="/search?max_price=1000" className="text-sm text-primary font-medium flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {affordableProducts.map((product) => {
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
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals && newArrivals.length > 0 && (
          <section className="pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">✨ New Arrivals</h2>
              <Link href="/search?sort=newest" className="text-sm text-primary font-medium flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {newArrivals.map((product) => {
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
          </section>
        )}
      </div>
    </div>
  )
}
