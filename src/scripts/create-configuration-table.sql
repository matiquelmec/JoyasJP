-- Crear tabla de configuración para Joyas JP
CREATE TABLE IF NOT EXISTS configuration (
  id SERIAL PRIMARY KEY,
  store_name TEXT DEFAULT 'Joyas JP',
  store_email TEXT DEFAULT 'contacto@joyasjp.cl',
  store_description TEXT DEFAULT 'Alta joyería para la escena urbana con diseños únicos y calidad premium.',
  shipping_cost INTEGER DEFAULT 3000,
  free_shipping_from INTEGER DEFAULT 50000,
  shipping_zones TEXT DEFAULT 'Santiago, Regiones',
  admin_email TEXT DEFAULT 'admin@joyasjp.cl',
  notify_new_orders BOOLEAN DEFAULT true,
  notify_low_stock BOOLEAN DEFAULT true,
  notify_new_customers BOOLEAN DEFAULT false,
  mercadopago_public_key TEXT DEFAULT '',
  mercadopago_access_token TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insertar configuración inicial si no existe
INSERT INTO configuration (id)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM configuration WHERE id = 1);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a la tabla configuration
DROP TRIGGER IF EXISTS update_configuration_updated_at ON configuration;
CREATE TRIGGER update_configuration_updated_at 
BEFORE UPDATE ON configuration 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();