'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  // In a full implementation, this would fetch from a wishlist table
  const [wishlistItems, setWishlistItems] = useState([])

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-24">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6 text-primary fill-primary" />
        <h1 className="text-2xl font-bold">My Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Save your favorite clothing items here so you can easily find them later and purchase them when you're ready.
            </p>
            <Link href="/search">
              <Button size="lg" className="brand-gradient text-white border-0">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start Browsing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Wishlist items would map here */}
        </div>
      )}
    </div>
  )
}
