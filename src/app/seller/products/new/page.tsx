'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { createProductSchema } from '@/lib/validations'
import { toast } from 'sonner'
import { Upload, Sparkles, Loader2, Image as ImageIcon, X, Package, Camera } from 'lucide-react'

const GENDERS = ['MEN', 'WOMEN', 'KIDS', 'UNISEX']
const FITS = ['SLIM', 'REGULAR', 'LOOSE', 'OVERSIZED']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', 'Free Size']

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [storeId, setStoreId] = useState<string>('')
  const [categories, setCategories] = useState<any[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    short_description: '',
    category_id: '',
    gender: 'UNISEX',
    color: '',
    material: '',
    fit: 'REGULAR',
    price: '',
    original_price: '',
    tags: [] as string[],
    sizes: ['M', 'L', 'XL'],
  })

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get store ID
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single()
      
      if (store) setStoreId(store.id)

      // Get categories
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        
      if (cats) setCategories(cats)
    }
    init()
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  const handleAIAnalysis = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first')
      return
    }

    setAnalyzing(true)
    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.readAsDataURL(imageFile)
      
      reader.onload = async () => {
        const base64 = reader.result as string
        const base64Data = base64.split(',')[1]

        const res = await fetch('/api/ai/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: imageFile.type,
          }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to analyze image')
        }

        const analysis = await res.json()
        
        // Find category ID based on slug/name returned by AI
        let catId = form.category_id
        if (analysis.category) {
          const matchedCat = categories.find(c => 
            c.name.toLowerCase() === analysis.category.toLowerCase() || 
            c.slug.toLowerCase() === analysis.category.toLowerCase()
          )
          if (matchedCat) catId = matchedCat.id
        }

        // Fill form with AI suggestions
        setForm(prev => ({
          ...prev,
          name: analysis.title || prev.name,
          description: analysis.description || prev.description,
          short_description: analysis.short_description || prev.short_description,
          category_id: catId,
          gender: analysis.gender || prev.gender,
          color: analysis.color || prev.color,
          material: analysis.material || prev.material,
          fit: analysis.fit || prev.fit,
          tags: analysis.tags?.length > 0 ? analysis.tags : prev.tags,
        }))

        toast.success('AI successfully drafted product details!', {
          description: 'Please review the AI suggestions and fill in prices.'
        })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) {
      toast.error('Store not found')
      return
    }
    if (!imageFile) {
      toast.error('Product image is required')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      
      // 1. Upload Image
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `${storeId}/${fileName}`
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('products-original')
        .upload(filePath, imageFile)
        
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products-original')
        .getPublicUrl(filePath)

      // 2. Validate and Insert Product
      const productData = {
        name: form.name,
        description: form.description,
        short_description: form.short_description,
        category_id: form.category_id || null,
        gender: form.gender as any,
        color: form.color,
        material: form.material,
        fit: form.fit as any,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        tags: form.tags,
        sizes: form.sizes,
        store_id: storeId,
      }

      const parsed = createProductSchema.safeParse(productData)
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || 'Invalid product data')
      }

      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert({
          ...parsed.data,
          is_active: true,
          is_published: true,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 3. Insert Product Image Record
      await supabase.from('product_images').insert({
        product_id: product.id,
        image_url: publicUrl,
        image_type: 'original',
        sort_order: 1,
        storage_path: filePath
      })

      // 4. Create initial inventory records for selected sizes
      const inventoryRecords = form.sizes.map(size => ({
        product_id: product.id,
        size,
        quantity: 10, // Default MVP quantity
        status: 'IN_STOCK'
      }))
      
      await supabase.from('inventory').insert(inventoryRecords)

      toast.success('Product published successfully!')
      router.push('/seller/products')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const toggleSize = (size: string) => {
    setForm(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
      return { ...prev, sizes }
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in-up relative">
      {analyzing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-xl shadow-xl border border-border">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">AI is analyzing...</h3>
              <p className="text-sm text-muted-foreground">Extracting product details from image</p>
            </div>
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse rounded-full w-full" />
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Left Column - Image & AI */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                id="gallery-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <input
                id="camera-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div 
                className={`aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden ${
                  imagePreview ? 'border-primary cursor-pointer' : 'border-border hover:border-primary hover:bg-primary/5'
                }`}
                onClick={() => {
                  if (imagePreview) document.getElementById('gallery-upload')?.click()
                }}
              >
                {imagePreview ? (
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${imagePreview})` }} />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <div className="flex flex-col gap-2">
                      <label 
                        htmlFor="camera-upload"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3 cursor-pointer"
                        onClick={e => e.stopPropagation()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </label>
                      <label 
                        htmlFor="gallery-upload"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 cursor-pointer"
                        onClick={e => e.stopPropagation()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Gallery
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">JPEG, PNG up to 5MB</p>
                  </div>
                )}
              </div>

              {imagePreview && (
                <Button 
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
                  onClick={handleAIAnalysis}
                  disabled={analyzing}
                  type="button"
                >
                  {analyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> AI is thinking...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> Auto-fill with AI</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="name">Product Title</Label>
                <Input 
                  id="name" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="e.g. Men's Cotton Checkered Shirt"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Selling Price (₹)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                    placeholder="999"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="original_price">MRP / Original Price (₹)</Label>
                  <Input 
                    id="original_price" 
                    type="number" 
                    value={form.original_price} 
                    onChange={e => setForm({...form, original_price: e.target.value})} 
                    placeholder="1499"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={form.category_id} onValueChange={v => setForm({...form, category_id: v || ''})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Available Sizes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SIZES.map(size => (
                    <Badge
                      key={size}
                      variant={form.sizes.includes(size) ? 'default' : 'outline'}
                      className={`cursor-pointer px-3 py-1 ${form.sizes.includes(size) ? 'bg-primary text-white' : ''}`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Product Description</Label>
                <Textarea 
                  id="description" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  rows={4}
                  placeholder="Describe the fabric, styling, wash care, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input 
                    id="color" 
                    value={form.color || ''} 
                    onChange={e => setForm({...form, color: e.target.value})} 
                    placeholder="e.g. Navy Blue"
                  />
                </div>
                <div>
                  <Label htmlFor="material">Material / Fabric</Label>
                  <Input 
                    id="material" 
                    value={form.material || ''} 
                    onChange={e => setForm({...form, material: e.target.value})} 
                    placeholder="e.g. 100% Cotton"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={v => setForm({...form, gender: v || ''})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fit Type</Label>
                  <Select value={form.fit} onValueChange={v => setForm({...form, fit: v || ''})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FITS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full brand-gradient text-white" 
            size="lg"
            disabled={loading || !imageFile || form.sizes.length === 0}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Package className="h-5 w-5 mr-2" />}
            Publish Product
          </Button>
        </form>
      </div>
    </div>
  )
}
