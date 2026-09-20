// ==========================================
// VastraNow Database Types
// ==========================================

export type UserRole = 'CUSTOMER' | 'SELLER' | 'DELIVERY_PARTNER' | 'ADMIN'
export type StoreStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED'
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
export type OrderStatusType =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_FAILED'
  | 'CONFIRMED'
  | 'SELLER_ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERY_ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
export type DeliveryPartnerAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE'
export type GenderType = 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX'
export type FitType = 'SLIM' | 'REGULAR' | 'LOOSE' | 'OVERSIZED'

// ==========================================
// Table Row Types
// ==========================================

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  owner_id: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string
  state: string
  pincode: string | null
  latitude: number
  longitude: number
  logo_url: string | null
  banner_url: string | null
  status: StoreStatus
  rating: number
  total_ratings: number
  opening_time: string
  closing_time: string
  is_open: boolean
  preparation_time: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  description: string | null
  short_description: string | null
  category_id: string | null
  gender: GenderType
  color: string | null
  material: string | null
  fit: FitType | null
  price: number
  original_price: number | null
  tags: string[]
  sizes: string[]
  rating: number
  total_ratings: number
  is_active: boolean
  is_published: boolean
  ai_generated_title: string | null
  ai_generated_description: string | null
  ai_confidence_score: number | null
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  image_type: 'original' | 'ai_generated' | 'additional'
  alt_text: string | null
  sort_order: number
  storage_path: string | null
  created_at: string
}

export interface Inventory {
  id: string
  product_id: string
  size: string
  quantity: number
  reserved: number
  low_stock_threshold: number
  status: StockStatus
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  size: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  name: string
  phone: string
  address_line: string
  city: string
  state: string
  pincode: string
  latitude: number | null
  longitude: number | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  store_id: string
  address_id: string | null
  delivery_partner_id: string | null
  status: OrderStatusType
  subtotal: number
  delivery_fee: number
  platform_fee: number
  total: number
  estimated_delivery_time: number | null
  delivery_address_snapshot: Record<string, unknown> | null
  notes: string | null
  cancellation_reason: string | null
  admin_override_reason: string | null
  admin_override_by: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string | null
  size: string
  quantity: number
  price: number
  total: number
  created_at: string
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatusType
  changed_by: string | null
  notes: string | null
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  amount: number
  currency: string
  status: PaymentStatus
  failure_reason: string | null
  method: string | null
  created_at: string
  updated_at: string
}

export interface DeliveryPartner {
  id: string
  user_id: string
  name: string
  phone: string
  avatar_url: string | null
  availability: DeliveryPartnerAvailability
  current_order_id: string | null
  latitude: number | null
  longitude: number | null
  total_deliveries: number
  rating: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DeliveryAssignment {
  id: string
  order_id: string
  delivery_partner_id: string
  assigned_by: string | null
  status: string
  pickup_time: string | null
  delivery_time: string | null
  estimated_distance: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  order_id: string | null
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export interface AIGeneration {
  id: string
  product_id: string | null
  user_id: string
  input_image_url: string | null
  generated_title: string | null
  generated_description: string | null
  generated_tags: string[]
  generated_category: string | null
  generated_color: string | null
  generated_material: string | null
  generated_fit: string | null
  generated_image_url: string | null
  confidence_score: number | null
  model_used: string | null
  status: string
  error_message: string | null
  processing_time_ms: number | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

// ==========================================
// Extended Types (with joins)
// ==========================================

export interface ProductWithStore extends Product {
  store: Pick<Store, 'id' | 'name' | 'latitude' | 'longitude' | 'rating' | 'preparation_time'>
  images: ProductImage[]
  category: Pick<Category, 'id' | 'name' | 'slug'> | null
  inventory: Inventory[]
}

export interface CartItemWithProduct extends CartItem {
  product: Product & {
    store: Pick<Store, 'id' | 'name'>
    images: ProductImage[]
  }
}

export interface OrderWithDetails extends Order {
  items: (OrderItem & { product?: Product })[]
  store: Store
  user: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'>
  payment: Payment | null
  delivery_partner: DeliveryPartner | null
  delivery_assignment: DeliveryAssignment | null
  status_history: OrderStatusHistory[]
  address: Address | null
}
