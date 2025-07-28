-- MIGRACIÓN SEGURA para completar la tabla orders existente
-- Ejecutar en SQL Editor de Supabase

-- 1. Primero, agregar las columnas faltantes de manera segura
DO $$ 
BEGIN
    -- Agregar payment_status si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
        ALTER TABLE orders ADD CONSTRAINT payment_status_check 
            CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
    END IF;
    
    -- Agregar status con constraint si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'status'
    ) THEN
        ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    
    -- Agregar constraint para status si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'orders' AND constraint_name = 'orders_status_check'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_status_check 
            CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
    END IF;
    
    -- Agregar payment_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_id TEXT;
    END IF;
    
    -- Agregar mercadopago_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'mercadopago_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN mercadopago_id TEXT;
    END IF;
    
    -- Agregar notes si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'notes'
    ) THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Agregar updated_at si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    RAISE NOTICE 'Columnas agregadas exitosamente';
END $$;

-- 2. Crear índices para mejor performance (solo si no existen)
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders(contact_email);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);

-- 3. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Crear trigger para updated_at (reemplaza si existe)
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Crear la función principal (corregida y segura)
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
    
    -- Crear la orden (usando solo las columnas que sabemos que existen)
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
        
        -- Log para debugging
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

-- 6. Función para actualizar estado de pago
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

-- 7. Función para obtener detalles de orden
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

-- 8. Comentarios
COMMENT ON FUNCTION create_order_and_update_stock IS 'Función migrada - Crea orden y actualiza stock automáticamente';
COMMENT ON FUNCTION update_payment_status IS 'Actualiza estado de pago de una orden';
COMMENT ON FUNCTION get_order_details IS 'Obtiene detalles completos de una orden';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Migración completada exitosamente!';
    RAISE NOTICE '🚀 Función create_order_and_update_stock lista para usar';
END $$;