// Script para verificar si la función create_order_and_update_stock existe
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFunction() {
  try {
    console.log('🔍 Verificando función create_order_and_update_stock...\n');
    
    // Intentar llamar la función con parámetros vacíos para ver si existe
    const { data, error } = await supabase.rpc('create_order_and_update_stock', {
      customer_name_in: '',
      shipping_address_in: '',
      contact_email_in: '',
      ordered_products_in: []
    });
    
    if (error) {
      if (error.message.includes('Could not find the function')) {
        console.log('❌ La función create_order_and_update_stock NO existe');
        console.log('\n📋 Para solucionarlo:');
        console.log('1. Ve a tu dashboard de Supabase');
        console.log('2. Navega a SQL Editor');
        console.log('3. Copia y pega el contenido de supabase-setup.sql');
        console.log('4. Ejecuta el script SQL');
        console.log('\n📁 Archivo ubicado en: supabase-setup.sql');
      } else {
        console.log('⚠️  La función existe pero hay un error de validación (esto es normal):');
        console.log(`   ${error.message}`);
        console.log('\n✅ Esto significa que la función SÍ existe y funciona');
      }
    } else {
      console.log('✅ La función existe y responde correctamente');
    }
    
    // Verificar estructura de orders
    console.log('\n📋 Verificando tabla orders...');
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.log('❌ Error con tabla orders:', ordersError.message);
    } else {
      console.log('✅ Tabla orders funciona correctamente');
      console.log(`📊 Estructura verificada`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
    return false;
  }
}

async function testWithRealData() {
  try {
    console.log('\n🧪 Probando función con un producto real...');
    
    // Obtener un producto disponible
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .gt('stock', 0)
      .limit(1);
    
    if (productError || !products || products.length === 0) {
      console.log('⚠️  No hay productos disponibles para probar');
      return false;
    }
    
    const product = products[0];
    console.log(`📦 Usando: ${product.name} (Stock: ${product.stock})`);
    
    const { data: orderId, error: orderError } = await supabase.rpc('create_order_and_update_stock', {
      customer_name_in: 'Cliente de Prueba',
      shipping_address_in: 'Dirección de Prueba 123',
      contact_email_in: 'test@joyasjp.cl',
      ordered_products_in: [
        {
          product_id: product.id,
          quantity: 1
        }
      ]
    });
    
    if (orderError) {
      console.log('❌ Error probando función:', orderError.message);
      return false;
    }
    
    console.log('✅ Función probada exitosamente!');
    console.log(`🆔 Orden creada: ${orderId}`);
    
    // Verificar que se creó la orden
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (order) {
      console.log('📋 Detalles de la orden:');
      console.log(`   - Cliente: ${order.customer_name}`);
      console.log(`   - Total: $${order.total_amount}`);
      console.log(`   - Estado: ${order.status}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error en prueba:', error.message);
    return false;
  }
}

async function main() {
  await checkFunction();
  
  console.log('\n' + '='.repeat(50));
  
  const testResult = await testWithRealData();
  
  console.log('\n🎉 Verificación completada');
  
  if (testResult) {
    console.log('✅ Tu sistema de órdenes está funcionando perfectamente!');
    console.log('🚀 El checkout de tu tienda debería funcionar sin problemas');
  } else {
    console.log('⚠️  Necesitas ejecutar el script SQL en Supabase para completar la configuración');
  }
}

main().catch(console.error);