-- Configuración completa del sistema de órdenes para Joyas JP
-- Ejecutar en el Editor SQL de Supabase Dashboard

-- 1. Crear tabla orders si no existe
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  mercadopago_id TEXT,
  ordered_products JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders(contact_email);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);

-- 3. Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Función principal para crear órdenes y actualizar stock
CREATE OR REPLACE FUNCTION create_order_and_update_stock(
  customer_name_in TEXT,
  shipping_address_in TEXT,
  contact_email_in TEXT,
  ordered_products_in JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_order_id UUID;
  product_item JSONB;
  product_record RECORD;
  calculated_total DECIMAL(10,2) := 0;
BEGIN
  -- Validar email format básico
  IF contact_email_in !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'Invalid email format: %', contact_email_in;
  END IF;
  
  -- Validar que ordered_products_in no esté vacío
  IF jsonb_array_length(ordered_products_in) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one product';
  END IF;
  
  -- Validar productos y calcular total
  FOR product_item IN SELECT * FROM jsonb_array_elements(ordered_products_in)
  LOOP
    -- Verificar campos requeridos
    IF NOT (product_item ? 'product_id' AND product_item ? 'quantity') THEN
      RAISE EXCEPTION 'Each product must have product_id and quantity';
    END IF;
    
    -- Obtener producto de la base de datos
    SELECT * INTO product_record 
    FROM products 
    WHERE id = (product_item->>'product_id')::TEXT;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', product_item->>'product_id';
    END IF;
    
    -- Verificar stock disponible
    IF product_record.stock < (product_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for product: %. Available: %, Requested: %', 
        product_record.name, product_record.stock, product_item->>'quantity';
    END IF;
    
    -- Calcular total
    calculated_total := calculated_total + (product_record.price * (product_item->>'quantity')::INTEGER);
  END LOOP;
  
  -- Crear la orden
  INSERT INTO orders (
    customer_name,
    shipping_address,
    contact_email,
    ordered_products,
    total_amount,
    status,
    payment_status
  )
  VALUES (
    customer_name_in,
    shipping_address_in,
    contact_email_in,
    ordered_products_in,
    calculated_total,
    'pending',
    'pending'
  )
  RETURNING id INTO new_order_id;
  
  -- Actualizar stock de los productos
  FOR product_item IN SELECT * FROM jsonb_array_elements(ordered_products_in)
  LOOP
    UPDATE products 
    SET stock = stock - (product_item->>'quantity')::INTEGER
    WHERE id = (product_item->>'product_id')::TEXT;
    
    -- Log para debugging (opcional)
    RAISE NOTICE 'Updated stock for product %: reduced by %', 
      product_item->>'product_id', product_item->>'quantity';
  END LOOP;
  
  -- Devolver el ID de la nueva orden
  RETURN new_order_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Re-lanzar el error para que llegue al cliente
    RAISE;
END;
$$;

-- 5. Función para actualizar estado de pago (útil para webhooks de MercadoPago)
CREATE OR REPLACE FUNCTION update_payment_status(
  order_id_in UUID,
  payment_status_in TEXT,
  payment_id_in TEXT DEFAULT NULL,
  mercadopago_id_in TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders 
  SET 
    payment_status = payment_status_in,
    payment_id = COALESCE(payment_id_in, payment_id),
    mercadopago_id = COALESCE(mercadopago_id_in, mercadopago_id),
    status = CASE 
      WHEN payment_status_in = 'paid' THEN 'confirmed'
      WHEN payment_status_in = 'failed' THEN 'cancelled'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = order_id_in;
  
  RETURN FOUND;
END;
$$;

-- 6. Función para obtener órdenes con información de productos
CREATE OR REPLACE FUNCTION get_order_details(order_id_in UUID)
RETURNS TABLE (
  order_id UUID,
  customer_name TEXT,
  contact_email TEXT,
  shipping_address TEXT,
  total_amount DECIMAL(10,2),
  status TEXT,
  payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  product_details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.customer_name,
    o.contact_email,
    o.shipping_address,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'product_id', item->>'product_id',
          'quantity', (item->>'quantity')::INTEGER,
          'name', p.name,
          'price', p.price,
          'image_url', p."imageUrl",
          'total', p.price * (item->>'quantity')::INTEGER
        )
      )
      FROM jsonb_array_elements(o.ordered_products) AS item
      LEFT JOIN products p ON p.id = (item->>'product_id')::TEXT
    ) AS product_details
  FROM orders o
  WHERE o.id = order_id_in;
END;
$$;

-- 7. Habilitar RLS (Row Level Security) - Opcional pero recomendado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver solo sus propias órdenes (si implementas auth)
-- CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.email() = contact_email);

-- 8. Comentarios para documentación
COMMENT ON TABLE orders IS 'Tabla de órdenes del e-commerce Joyas JP';
COMMENT ON FUNCTION create_order_and_update_stock IS 'Crea una orden y actualiza el stock de productos automáticamente';
COMMENT ON FUNCTION update_payment_status IS 'Actualiza el estado de pago de una orden';
COMMENT ON FUNCTION get_order_details IS 'Obtiene detalles completos de una orden incluyendo información de productos';

-- Insertar datos de prueba (opcional)
-- INSERT INTO orders (customer_name, shipping_address, contact_email, ordered_products, total_amount)
-- VALUES (
--   'Cliente Prueba',
--   'Av. Providencia 123, Santiago',
--   'prueba@joyasjp.cl',
--   '[{"product_id": "PCD_1", "quantity": 1}]'::jsonb,
--   5000
-- );