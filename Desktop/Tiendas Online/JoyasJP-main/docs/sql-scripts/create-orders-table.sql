-- Crear tabla de pedidos si no existe
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_commune TEXT,
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los administradores vean todos los pedidos
-- Nota: En producción, deberías usar un sistema de autenticación más robusto
-- Primero eliminar la política si existe, luego crearla
DROP POLICY IF EXISTS "Allow admin access to orders" ON public.orders;
CREATE POLICY "Allow admin access to orders" ON public.orders
  FOR ALL USING (true);

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.orders IS 'Tabla de pedidos del e-commerce';
COMMENT ON COLUMN public.orders.id IS 'ID único del pedido (normalmente el ID de MercadoPago)';
COMMENT ON COLUMN public.orders.items IS 'Productos del pedido en formato JSON';
COMMENT ON COLUMN public.orders.total_amount IS 'Total del pedido en pesos chilenos';
COMMENT ON COLUMN public.orders.status IS 'Estado del pedido: pending, processing, shipped, delivered, cancelled';