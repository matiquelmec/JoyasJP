import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  price: real('price').notNull(),
  discount_price: real('discount_price'),
  stock: integer('stock').notNull().default(0),
  category: text('category').notNull(),
  imageUrl: text('imageUrl'),
  dimensions: text('dimensions'),
  materials: text('materials'),
  color: text('color'),
  detail: text('detail'),
  description: text('description'),
  specifications: text('specifications'), // JSON string
  gallery: text('gallery'), // JSON string
  variants: text('variants'), // JSON string
  sku: text('sku'),
  seo: text('seo'), // JSON string
  image_hint: text('image_hint'),
  is_priority: integer('is_priority', { mode: 'boolean' }).default(false),
  is_bundle: integer('is_bundle', { mode: 'boolean' }).default(false),
  custom_label: text('custom_label'),
  deleted_at: text('deleted_at'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
})

export const bundleItems = sqliteTable('bundle_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bundle_id: text('bundle_id').notNull(),
  product_id: text('product_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  customer_email: text('customer_email').notNull(),
  customer_phone: text('customer_phone'),
  shipping_address: text('shipping_address').notNull(),
  shipping_city: text('shipping_city'),
  shipping_commune: text('shipping_commune'),
  shipping_method: text('shipping_method'),
  items: text('items').notNull(), // JSON string
  total_amount: real('total_amount').notNull(),
  shipping_cost: real('shipping_cost').default(0),
  status: text('status').notNull().default('pending'),
  payment_id: text('payment_id'),
  payment_status: text('payment_status').default('pending'),
  payment_detail: text('payment_detail'),
  coupon_code: text('coupon_code'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
})

export const coupons = sqliteTable('coupons', {
  code: text('code').primaryKey(),
  discount_type: text('discount_type').notNull(), // 'percentage' | 'fixed'
  discount_value: real('discount_value').notNull(),
  min_cart_amount: real('min_cart_amount').default(0),
  usage_limit: integer('usage_limit'),
  usage_count: integer('usage_count').default(0),
  expires_at: text('expires_at'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  affiliate_name: text('affiliate_name'),
  created_at: text('created_at'),
})

export const configuration = sqliteTable('configuration', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  store_name: text('store_name').notNull().default('Joyas JP'),
  store_email: text('store_email'),
  store_description: text('store_description'),
  store_slogan: text('store_slogan'),
  whatsapp_number: text('whatsapp_number'),
  shipping_cost: real('shipping_cost').default(3000),
  free_shipping_from: real('free_shipping_from').default(50000),
  instagram_url: text('instagram_url'),
  tiktok_url: text('tiktok_url'),
})
