-- ==============================================================================
-- 💎 JOYAS JP - E-COMMERCE COMPLETE DATABASE SCHEMA
-- ==============================================================================
-- This file represents the exact current state of the production database.
-- It includes the tables, constraints, and RPC functions required for the shop.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CONFIGURATION TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuration (
  id integer NOT NULL DEFAULT nextval('configuration_id_seq'::regclass),
  store_name text DEFAULT 'Joyas JP'::text,
  store_email text DEFAULT 'contacto@joyasjp.cl'::text,
  store_description text DEFAULT 'Alta joyería para la escena urbana con diseños únicos y calidad premium.'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  instagram_url text,
  tiktok_url text,
  whatsapp_number text,
  CONSTRAINT configuration_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id text NOT NULL,
  name text NOT NULL,
  price numeric,
  "imageUrl" text, -- Frontend property mapped (camelCase is supported via client maps)
  category text,
  dimensions text,
  materials text,
  color text,
  stock numeric,
  detail text,
  description text,
  specifications jsonb DEFAULT '[]'::jsonb,
  gallery jsonb DEFAULT '[]'::jsonb,
  variants jsonb DEFAULT '[]'::jsonb,
  sku text,
  seo jsonb DEFAULT '{}'::jsonb,
  image_hint text,
  deleted_at timestamp with time zone,
  slug text UNIQUE,
  discount_price numeric,
  custom_label text,
  is_priority boolean DEFAULT false,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 3. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address text,
  shipping_city text,
  shipping_commune text,
  items jsonb NOT NULL,
  total_amount numeric NOT NULL,
  shipping_cost numeric DEFAULT 0,
  -- ✅ CRITICAL: status constraint includes 'paid' to allow automated webhook processing
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  payment_id text,
  payment_status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  shipping_method text DEFAULT 'starken'::text,
  payment_detail text,
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);

-- ------------------------------------------------------------------------------
-- 4. ATOMIC CHECKOUT TRANSACTION FUNCTION
-- ------------------------------------------------------------------------------
-- This RPC handles the concurrency race conditions natively on the DB level.
CREATE OR REPLACE FUNCTION public.process_order_payment(
  p_order_id text,
  p_payment_status text,
  p_payment_detail text
) RETURNS jsonb AS $$
DECLARE
  v_order RECORD;
  v_item JSONB;
  v_product_id TEXT;  -- Using TEXT since product IDs are TEXT in schema
  v_quantity INT;
  v_items_json JSONB;
BEGIN
  -- 1. Lock order row for update
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;

  -- 2. Idempotency Check
  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order already paid (Idempotent)');
  END IF;

  -- 3. Update Order Status
  UPDATE orders 
  SET 
    status = CASE WHEN p_payment_status = 'approved' THEN 'paid' ELSE p_payment_status END,
    payment_status = p_payment_status,
    payment_detail = p_payment_detail,
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- 4. Decrement Stock (Only if approved)
  IF p_payment_status = 'approved' THEN
    
    -- Handle items type (Text or JSONB)
    BEGIN
        v_items_json := v_order.items::jsonb;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid items format');
    END;

    FOR v_item IN SELECT * FROM jsonb_array_elements(v_items_json) LOOP
      v_product_id := (v_item->>'id')::TEXT;
      v_quantity := (v_item->>'quantity')::INT;

      -- Check and Update Stock (Atomic operation)
      UPDATE products
      SET stock = stock - v_quantity
      WHERE id = v_product_id AND stock >= v_quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Order processed successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;
