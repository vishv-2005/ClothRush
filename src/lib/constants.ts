// ==========================================
// VastraNow Application Constants
// ==========================================

export const APP_NAME = 'ClothRush'
export const APP_TAGLINE = 'Local Fashion. Delivered Fast.'

// ==========================================
// Delivery & Fees Configuration
// ==========================================

export const DEFAULT_CITY = process.env.NEXT_PUBLIC_DEFAULT_CITY || 'Vadodara'
export const DELIVERY_FEE = Number(process.env.NEXT_PUBLIC_DEFAULT_DELIVERY_FEE) || 29
export const PLATFORM_FEE = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE) || 10
export const PREP_TIME = Number(process.env.NEXT_PUBLIC_DEFAULT_PREP_TIME) || 5 // minutes
export const DELIVERY_TIME = Number(process.env.NEXT_PUBLIC_DEFAULT_DELIVERY_TIME) || 10 // minutes
export const BUFFER_TIME = Number(process.env.NEXT_PUBLIC_DEFAULT_BUFFER_TIME) || 2 // minutes
export const DEFAULT_ETA = PREP_TIME + DELIVERY_TIME + BUFFER_TIME // 17 minutes

// ==========================================
// Demo Mode
// ==========================================

export const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// ==========================================
// Default Locations (Vadodara, Gujarat)
// ==========================================

export const DEFAULT_CUSTOMER_LOCATION = {
  latitude: 22.3072,
  longitude: 73.1812,
}

// ==========================================
// Order Statuses
// ==========================================

export const ORDER_STATUSES = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CONFIRMED: 'CONFIRMED',
  SELLER_ACCEPTED: 'SELLER_ACCEPTED',
  PREPARING: 'PREPARING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  DELIVERY_ASSIGNED: 'DELIVERY_ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
} as const

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Payment Pending',
  PAYMENT_FAILED: 'Payment Failed',
  CONFIRMED: 'Order Confirmed',
  SELLER_ACCEPTED: 'Seller Accepted',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  DELIVERY_ASSIGNED: 'Delivery Assigned',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUND_PENDING: 'Refund Pending',
  REFUNDED: 'Refunded',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAYMENT_FAILED: 'bg-red-100 text-red-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SELLER_ACCEPTED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  READY_FOR_PICKUP: 'bg-purple-100 text-purple-800',
  DELIVERY_ASSIGNED: 'bg-indigo-100 text-indigo-800',
  PICKED_UP: 'bg-cyan-100 text-cyan-800',
  OUT_FOR_DELIVERY: 'bg-teal-100 text-teal-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUND_PENDING: 'bg-amber-100 text-amber-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

// ==========================================
// Valid Order State Transitions
// ==========================================

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
  CONFIRMED: ['SELLER_ACCEPTED', 'CANCELLED'],
  SELLER_ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['DELIVERY_ASSIGNED', 'CANCELLED'],
  DELIVERY_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: ['REFUND_PENDING'],
  REFUND_PENDING: ['REFUNDED'],
  REFUNDED: [],
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

// ==========================================
// User Roles
// ==========================================

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  ADMIN: 'ADMIN',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// ==========================================
// Categories (for frontend display)
// ==========================================

export const CATEGORY_ICONS: Record<string, string> = {
  men: '👔',
  women: '👗',
  kids: '🧸',
  shirts: '👕',
  't-shirts': '🎽',
  jeans: '👖',
  kurtis: '🥻',
  dresses: '💃',
  sarees: '🪷',
  jackets: '🧥',
  footwear: '👟',
  trousers: '👖',
}

// ==========================================
// Sizes
// ==========================================

export const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
export const DENIM_SIZES = ['28', '30', '32', '34', '36', '38']
export const KIDS_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y']
export const SHOE_SIZES = ['UK5', 'UK6', 'UK7', 'UK8', 'UK9', 'UK10', 'UK11']

// ==========================================
// File Upload Constraints
// ==========================================

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ==========================================
// Pagination
// ==========================================

export const PRODUCTS_PER_PAGE = 20
export const ORDERS_PER_PAGE = 10

// ==========================================
// ETA Calculation
// ==========================================

/**
 * Calculate estimated delivery time in minutes.
 * Uses Haversine formula for distance and configurable speeds.
 */
export function calculateETA(
  storeLat: number,
  storeLng: number,
  customerLat: number = DEFAULT_CUSTOMER_LOCATION.latitude,
  customerLng: number = DEFAULT_CUSTOMER_LOCATION.longitude,
  prepTime: number = PREP_TIME
): { eta: number; distance: number } {
  const distance = calculateDistance(storeLat, storeLng, customerLat, customerLng)
  // Assume average speed of 20 km/h for delivery
  const deliveryMinutes = Math.ceil((distance / 20) * 60)
  const eta = prepTime + deliveryMinutes + BUFFER_TIME
  return { eta, distance: Math.round(distance * 10) / 10 }
}

/**
 * Haversine distance between two points in km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// ==========================================
// Currency Formatting
// ==========================================

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPriceDecimal(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}
