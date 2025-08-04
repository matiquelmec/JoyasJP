import { createClient } from '@supabase/supabase-js';
import { products } from '../src/lib/products';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta configuración de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 Probando conexión a Supabase...');
  
  const { data, error } = await supabase
    .from('products')
    .select('count', { count: 'exact', head: true });
    
  if (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
  
  console.log('✅ Conexión exitosa');
  return true;
}

async function migrateProducts() {
  console.log('🚀 Iniciando migración de productos a Supabase...');
  console.log(`📦 Total de productos a migrar: ${products.length}`);
  
  // Probar conexión
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ No se pudo conectar a Supabase. Verifica:');
    console.error('  1. Que la URL y ANON_KEY sean correctos');
    console.error('  2. Que la tabla "products" exista en Supabase');
    console.error('  3. Que tengas permisos de escritura');
    process.exit(1);
  }
  
  // Limpiar tabla existente
  console.log('🧹 Limpiando productos existentes...');
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .gte('id', '');
    
  if (deleteError && !deleteError.message.includes('0 rows')) {
    console.log('⚠️  Error limpiando tabla:', deleteError.message);
  }
  
  // Migrar productos en lotes
  const batchSize = 100;
  let migrated = 0;
  let errors = 0;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    
    console.log(`📤 Procesando lote ${batchNumber}/${Math.ceil(products.length / batchSize)}: ${batch.length} productos...`);
    
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Error en lote ${batchNumber}:`, error.message);
      errors += batch.length;
    } else {
      migrated += data?.length || 0;
      console.log(`✅ Lote ${batchNumber} completado: ${data?.length || 0} productos`);
    }
    
    // Pausa entre lotes
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\n📊 RESUMEN DE MIGRACIÓN:');
  console.log(`✅ Productos migrados exitosamente: ${migrated}`);
  console.log(`❌ Productos con errores: ${errors}`);
  console.log(`📈 Total procesados: ${migrated + errors}/${products.length}`);
  
  // Verificar migración
  console.log('\n🔍 Verificando migración...');
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('❌ Error verificando migración:', countError.message);
  } else {
    console.log(`📊 Productos confirmados en base de datos: ${count}`);
    
    if (count === products.length) {
      console.log('🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
      console.log('🚀 Tu e-commerce está listo para funcionar con Supabase');
    } else {
      console.log(`⚠️  Advertencia: Esperados ${products.length}, encontrados ${count}`);
    }
  }
  
  // Mostrar ejemplos
  console.log('\n📝 Ejemplo de productos migrados:');
  const { data: sampleProducts } = await supabase
    .from('products')
    .select('id, name, price, category')
    .limit(3);
    
  if (sampleProducts) {
    sampleProducts.forEach(product => {
      console.log(`  • ${product.name} (${product.category}) - $${product.price}`);
    });
  }
}

// Ejecutar migración
migrateProducts();