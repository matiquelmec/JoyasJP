// Script para configurar el sistema de órdenes en Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Error: Variables de entorno faltantes');
  console.log('Necesitas NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Configurando sistema de órdenes...\n');

async function checkOrdersTable() {
  try {
    console.log('📋 Verificando tabla orders...');
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Error:', error.message);
      return false;
    }
    
    console.log('✅ Tabla orders existe');
    
    if (data && data.length > 0) {
      console.log('📝 Estructura detectada:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof data[0][key]}`);
      });
    } else {
      console.log('📝 Tabla vacía, verificando estructura...');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error verificando tabla orders:', error.message);
    return false;
  }
}

async function createOrdersTable() {
  try {
    console.log('\n🏗️  Creando tabla orders...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        customer_name TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        total_amount DECIMAL(10,2),
        status TEXT DEFAULT 'pending',
        payment_status TEXT DEFAULT 'pending',
        payment_id TEXT,
        ordered_products JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error } = await supabase.rpc('exec_sql', { query: createTableSQL });
    
    if (error) {
      console.log('⚠️  La tabla puede ya existir o hay un problema:', error.message);
    } else {
      console.log('✅ Tabla orders creada/verificada');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error creando tabla:', error.message);
    return false;
  }
}

async function createOrderFunction() {
  try {
    console.log('\n🔧 Creando función create_order_and_update_stock...');
    
    const functionSQL = `
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
      BEGIN
        -- Validar que los productos existan y tengan stock suficiente
        FOR product_item IN SELECT * FROM jsonb_array_elements(ordered_products_in)
        LOOP
          SELECT * INTO product_record 
          FROM products 
          WHERE id = (product_item->>'product_id')::TEXT;
          
          IF NOT FOUND THEN
            RAISE EXCEPTION 'Product not found: %', product_item->>'product_id';
          END IF;
          
          IF product_record.stock < (product_item->>'quantity')::INTEGER THEN
            RAISE EXCEPTION 'Insufficient stock for product: %. Available: %, Requested: %', 
              product_record.name, product_record.stock, product_item->>'quantity';
          END IF;
        END LOOP;
        
        -- Crear la orden
        INSERT INTO orders (
          customer_name,
          shipping_address,
          contact_email,
          ordered_products,
          total_amount,
          status
        )
        VALUES (
          customer_name_in,
          shipping_address_in,
          contact_email_in,
          ordered_products_in,
          (
            SELECT SUM((item->>'quantity')::INTEGER * (
              SELECT price FROM products WHERE id = (item->>'product_id')::TEXT
            ))
            FROM jsonb_array_elements(ordered_products_in) AS item
          ),
          'pending'
        )
        RETURNING id INTO new_order_id;
        
        -- Actualizar stock de los productos
        FOR product_item IN SELECT * FROM jsonb_array_elements(ordered_products_in)
        LOOP
          UPDATE products 
          SET stock = stock - (product_item->>'quantity')::INTEGER,
              updated_at = NOW()
          WHERE id = (product_item->>'product_id')::TEXT;
        END LOOP;
        
        RETURN new_order_id;
      END;
      $$;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { query: functionSQL });
    
    if (error) {
      console.log('❌ Error creando función:', error.message);
      return false;
    }
    
    console.log('✅ Función create_order_and_update_stock creada');
    return true;
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
    return false;
  }
}

async function testFunction() {
  try {
    console.log('\n🧪 Probando función con datos de prueba...');
    
    // Obtener un producto real para la prueba
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .gt('stock', 0)
      .limit(1);
    
    if (productError || !products || products.length === 0) {
      console.log('⚠️  No hay productos disponibles para probar');
      return false;
    }
    
    const testProduct = products[0];
    console.log(`📦 Usando producto de prueba: ${testProduct.name}`);
    
    const testOrderData = [
      {
        product_id: testProduct.id,
        quantity: 1,
        price: testProduct.price
      }
    ];
    
    const { data: orderId, error: orderError } = await supabase
      .rpc('create_order_and_update_stock', {
        customer_name_in: 'Cliente de Prueba',
        shipping_address_in: 'Dirección de Prueba 123',
        contact_email_in: 'prueba@test.com',
        ordered_products_in: testOrderData
      });
    
    if (orderError) {
      console.log('❌ Error en prueba:', orderError.message);
      return false;
    }
    
    console.log('✅ Función probada exitosamente');
    console.log(`🆔 ID de orden creada: ${orderId}`);
    
    // Verificar que la orden se creó
    const { data: order, error: orderSelectError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderSelectError) {
      console.log('⚠️  Error verificando orden:', orderSelectError.message);
    } else {
      console.log('📋 Orden verificada:', {
        id: order.id,
        customer: order.customer_name,
        total: order.total_amount,
        status: order.status
      });
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error en prueba:', error.message);
    return false;
  }
}

async function main() {
  const ordersTableExists = await checkOrdersTable();
  
  if (!ordersTableExists) {
    await createOrdersTable();
  }
  
  const functionCreated = await createOrderFunction();
  if (!functionCreated) {
    console.log('\n❌ No se pudo crear la función');
    return;
  }
  
  const testPassed = await testFunction();
  
  console.log('\n🎉 Configuración de órdenes completada');
  console.log('📋 Resumen:');
  console.log(`   - Tabla orders: ${ordersTableExists ? '✅' : '🔧'}`);
  console.log(`   - Función create_order_and_update_stock: ${functionCreated ? '✅' : '❌'}`);
  console.log(`   - Prueba de función: ${testPassed ? '✅' : '⚠️'}`);
  
  if (functionCreated && testPassed) {
    console.log('\n🚀 Sistema de órdenes listo para producción!');
    console.log('💡 Ahora tu checkout debería funcionar perfectamente');
  }
}

main().catch(console.error);