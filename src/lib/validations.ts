import { z } from 'zod'

// ==========================================
// Auth Schemas
// ==========================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER'),
})

// ==========================================
// Product Schemas
// ==========================================

export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  category_id: z.string().optional().nullable(),
  gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']).default('UNISEX'),
  color: z.string().optional(),
  material: z.string().optional(),
  fit: z.enum(['SLIM', 'REGULAR', 'LOOSE', 'OVERSIZED']).optional().nullable(),
  price: z.number().positive('Price must be positive'),
  original_price: z.number().positive().optional().nullable(),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.string()).min(1, 'At least one size required'),
  store_id: z.string().uuid(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid(),
  is_active: z.boolean().optional(),
  is_published: z.boolean().optional(),
})

// ==========================================
// Inventory Schema
// ==========================================

export const updateInventorySchema = z.object({
  product_id: z.string().uuid(),
  size: z.string().min(1),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
})

// ==========================================
// Cart Schemas
// ==========================================

export const addToCartSchema = z.object({
  product_id: z.string().uuid(),
  size: z.string().min(1, 'Size is required'),
  quantity: z.number().int().positive('Quantity must be positive').default(1),
})

export const updateCartSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
})

// ==========================================
// Address Schema
// ==========================================

export const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address_line: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6),
  is_default: z.boolean().default(false),
})

// ==========================================
// Order Schemas
// ==========================================

export const createOrderSchema = z.object({
  address_id: z.string().uuid(),
  notes: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum([
    'PENDING_PAYMENT', 'PAYMENT_FAILED', 'CONFIRMED', 'SELLER_ACCEPTED',
    'PREPARING', 'READY_FOR_PICKUP', 'DELIVERY_ASSIGNED', 'PICKED_UP',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED',
  ]),
  reason: z.string().optional(),
})

// ==========================================
// Payment Schema
// ==========================================

export const verifyPaymentSchema = z.object({
  order_id: z.string().uuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
})

// ==========================================
// Delivery Assignment Schema
// ==========================================

export const assignDeliverySchema = z.object({
  order_id: z.string().uuid(),
  delivery_partner_id: z.string().uuid(),
})

// ==========================================
// Store Schema
// ==========================================

export const createStoreSchema = z.object({
  name: z.string().min(3, 'Store name must be at least 3 characters'),
  description: z.string().optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  city: z.string().default('Vadodara'),
  state: z.string().default('Gujarat'),
  pincode: z.string().optional(),
  latitude: z.number().default(22.3072),
  longitude: z.number().default(73.1812),
})

// ==========================================
// Search Schema
// ==========================================

export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']).optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  size: z.string().optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'newest']).default('relevance'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartInput = z.infer<typeof updateCartSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
export type AssignDeliveryInput = z.infer<typeof assignDeliverySchema>
export type SearchInput = z.infer<typeof searchSchema>
