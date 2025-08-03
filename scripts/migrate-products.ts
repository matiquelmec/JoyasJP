import { createClient } from '@supabase/supabase-js';
import { products } from '../src/lib/products';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateProducts() {
  console.log('🚀 Iniciando migración de productos a Supabase...');
  
  try {
    // Verificar si la tabla existe y tiene productos
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error al verificar productos:', countError);
      return;
    }
    
    if (count && count > 0) {
      console.log(`⚠️  La tabla ya tiene ${count} productos. ¿Deseas continuar? (esto agregará productos duplicados)`);
      console.log('Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Migrar productos en lotes de 50
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize));
    }
    
    console.log(`📦 Migrando ${products.length} productos en ${batches.length} lotes...`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`  Procesando lote ${i + 1}/${batches.length}...`);
      
      const { error } = await supabase
        .from('products')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error en lote ${i + 1}:`, error);
        continue;
      }
      
      console.log(`  ✅ Lote ${i + 1} migrado exitosamente`);
    }
    
    // Verificar migración
    const { count: finalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✨ Migración completada! Total de productos en la base de datos: ${finalCount}`);
    
    // Crear índices para optimización
    console.log('\n🔧 Creando índices para optimización...');
    
    // Nota: Estos índices deben crearse directamente en Supabase SQL Editor
    console.log(`
Por favor, ejecuta estos comandos en el SQL Editor de Supabase:

-- Índices para búsqueda y filtrado
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- Índice compuesto para queries comunes
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category, price);

-- Full text search
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector 
  GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, ''))) STORED;
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);
    `);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

// Ejecutar migración
migrateProducts();