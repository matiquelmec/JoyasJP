// Script para verificar la conexión y estructura de Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando conexión a Supabase...\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log(`✅ SUPABASE_URL: ${supabaseUrl ? '✓ Configurada' : '❌ FALTANTE'}`);
console.log(`✅ SUPABASE_ANON_KEY: ${supabaseKey ? '✓ Configurada' : '❌ FALTANTE'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Error: Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
  try {
    console.log('\n🔗 Probando conexión...');
    
    // Test básico de conexión
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      return false;
    }
    
    console.log('✅ Conexión exitosa');
    console.log(`📊 Total de productos: ${data ? data.length : 'N/A'}`);
    return true;
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
    return false;
  }
}

async function verifyTables() {
  try {
    console.log('\n📋 Verificando estructura de tablas...');
    
    // Verificar tabla products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.log('❌ Error en tabla products:', productsError.message);
      return false;
    }
    
    console.log('✅ Tabla products: OK');
    
    if (products && products.length > 0) {
      console.log('📝 Estructura del producto:');
      const product = products[0];
      Object.keys(product).forEach(key => {
        console.log(`   - ${key}: ${typeof product[key]}`);
      });
    }
    
    // Verificar tabla orders si existe
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.log('⚠️  Tabla orders:', ordersError.message);
    } else {
      console.log('✅ Tabla orders: OK');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Error verificando tablas:', error.message);
    return false;
  }
}

async function testOperations() {
  try {
    console.log('\n🧪 Probando operaciones CRUD...');
    
    // Test SELECT
    const { data: selectData, error: selectError } = await supabase
      .from('products')
      .select('id, name, price, category')
      .limit(3);
    
    if (selectError) {
      console.log('❌ Error en SELECT:', selectError.message);
      return false;
    }
    
    console.log('✅ SELECT: OK');
    console.log(`📊 Productos encontrados: ${selectData?.length || 0}`);
    
    if (selectData && selectData.length > 0) {
      console.log('📦 Muestra de productos:');
      selectData.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price} (${product.category})`);
      });
    }
    
    // Test de función stored procedure (si existe)
    try {
      const { data: functionData, error: functionError } = await supabase
        .rpc('create_order_and_update_stock', {
          customer_name_in: 'TEST',
          shipping_address_in: 'TEST',
          contact_email_in: 'test@test.com',
          ordered_products_in: []
        });
      
      if (functionError) {
        console.log('⚠️  Función create_order_and_update_stock:', functionError.message);
      } else {
        console.log('✅ Función stored procedure: OK');
      }
    } catch (funcError) {
      console.log('⚠️  Función stored procedure no disponible');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Error en operaciones:', error.message);
    return false;
  }
}

async function main() {
  const connectionOK = await verifyConnection();
  if (!connectionOK) {
    console.log('\n❌ Verificación fallida: No se pudo conectar a Supabase');
    process.exit(1);
  }
  
  const tablesOK = await verifyTables();
  if (!tablesOK) {
    console.log('\n⚠️  Advertencia: Problemas con la estructura de tablas');
  }
  
  const operationsOK = await testOperations();
  if (!operationsOK) {
    console.log('\n⚠️  Advertencia: Problemas con las operaciones');
  }
  
  console.log('\n🎉 Verificación de Supabase completada');
  console.log('📋 Resumen:');
  console.log(`   - Conexión: ${connectionOK ? '✅' : '❌'}`);
  console.log(`   - Tablas: ${tablesOK ? '✅' : '⚠️'}`);
  console.log(`   - Operaciones: ${operationsOK ? '✅' : '⚠️'}`);
  
  if (connectionOK && tablesOK && operationsOK) {
    console.log('\n🚀 Todo funciona correctamente. Listo para producción!');
  } else {
    console.log('\n🔧 Hay algunos problemas que requieren atención');
  }
}

main().catch(console.error);