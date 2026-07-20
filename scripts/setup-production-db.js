const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const url = process.env.TURSO_CONNECTION_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌ Error: TURSO_CONNECTION_URL o TURSO_AUTH_TOKEN no están configurados en .env.local');
  process.exit(1);
}

// Inicializar el cliente SQLite apuntando a la base de datos de Turso en la nube
const client = createClient({
  url: url,
  authToken: authToken
});

// Importar los mocks iniciales para poblar la base de datos de producción
const initialProducts = [
  {
    id: "1",
    name: "Cadena Cubana Premium",
    slug: "cadena-cubana-premium",
    price: 49990,
    discount_price: 39990,
    stock: 15,
    category: "cadenas",
    imageUrl: "/assets/Cadena 1.jpeg",
    gallery: JSON.stringify(["/assets/Cadena 1.jpeg", "/assets/Cadena 2.jpeg"]),
    description: "Cadena estilo cubano premium chapada en oro de 18k. Diseño exclusivo y duradero.",
    color: "dorado",
    materials: "Oro 18k",
    custom_label: "HOT",
    is_priority: 1
  },
  {
    id: "2",
    name: "Dije Alien Hype",
    slug: "dije-alien-hype",
    price: 24990,
    stock: 8,
    category: "dijes",
    imageUrl: "/assets/Dijes 1.jpeg",
    gallery: JSON.stringify(["/assets/Dijes 1.jpeg", "/assets/Dijes 2.jpeg"]),
    description: "Dije con diseño de Alien en plata 925. Un toque futurista e intrépido.",
    color: "plateado",
    materials: "Plata 925",
    custom_label: "NUEVO",
    is_priority: 0
  },
  {
    id: "3",
    name: "Pulsera Tennis Ice",
    slug: "pulsera-tennis-ice",
    price: 89990,
    discount_price: 74990,
    stock: 5,
    category: "pulseras",
    imageUrl: "/assets/Pulsera 1.jpeg",
    gallery: JSON.stringify(["/assets/Pulsera 1.jpeg", "/assets/Pulsera 2.jpeg"]),
    description: "Pulsera estilo tennis con incrustaciones de circonia premium. Brillo inigualable.",
    color: "plateado",
    materials: "Plata 925",
    custom_label: "EXCLUSIVO",
    is_priority: 1
  },
  {
    id: "4",
    name: "Cadena Rope Twist",
    slug: "cadena-rope-twist",
    price: 34990,
    stock: 12,
    category: "cadenas",
    imageUrl: "/assets/Cadena 3.jpeg",
    gallery: JSON.stringify(["/assets/Cadena 3.jpeg"]),
    description: "Cadena trenzada estilo soga fina, ideal para usar con o sin dijes. Plata de ley.",
    color: "plateado",
    materials: "Plata 925",
    is_priority: 0
  },
  {
    id: "5",
    name: "Dije Cruz Templaria",
    slug: "dije-cruz-templaria",
    price: 29990,
    stock: 10,
    category: "dijes",
    imageUrl: "/assets/Dijes 3.jpeg",
    gallery: JSON.stringify(["/assets/Dijes 3.jpeg"]),
    description: "Dije de Cruz tallada con acabados premium y pulidos a mano.",
    color: "dorado",
    materials: "Oro 18k",
    is_priority: 0
  },
  {
    id: "6",
    name: "Pulsera Esferas Premium",
    slug: "pulsera-esferas-premium",
    price: 42990,
    stock: 7,
    category: "pulseras",
    imageUrl: "/assets/Pulsera 3.jpeg",
    gallery: JSON.stringify(["/assets/Pulsera 3.jpeg"]),
    description: "Pulsera elástica de esferas premium con broche ajustable de plata.",
    color: "mixto",
    materials: "Plata Bañada en Oro",
    is_priority: 0
  }
];

async function main() {
  console.log('⚡ Conectando e inicializando base de datos en Turso Cloud...');
  console.log(`🔗 URL: ${url}`);

  // 1. Crear tabla de productos
  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL,
      imageUrl TEXT,
      category TEXT,
      dimensions TEXT,
      materials TEXT,
      color TEXT,
      stock REAL DEFAULT 0,
      detail TEXT,
      description TEXT,
      specifications TEXT DEFAULT '[]',
      gallery TEXT DEFAULT '[]',
      variants TEXT DEFAULT '[]',
      sku TEXT,
      seo TEXT DEFAULT '{}',
      image_hint TEXT,
      deleted_at TEXT,
      slug TEXT UNIQUE,
      discount_price REAL,
      custom_label TEXT,
      is_priority INTEGER DEFAULT 0,
      is_bundle INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabla "products" creada o ya existente en la nube.');

  // 2. Crear tabla de configuración
  await client.execute(`
    CREATE TABLE IF NOT EXISTS configuration (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT DEFAULT 'Joyas JP',
      store_email TEXT DEFAULT 'contacto@joyasjp.cl',
      store_description TEXT DEFAULT 'Alta joyería para la escena urbana con diseños únicos y calidad premium.',
      instagram_url TEXT,
      tiktok_url TEXT,
      whatsapp_number TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabla "configuration" creada o ya existente en la nube.');

  // 2.5 Crear tabla de órdenes
  await client.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT,
      shipping_city TEXT,
      shipping_commune TEXT,
      items TEXT NOT NULL,
      total_amount REAL NOT NULL,
      shipping_cost REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      payment_id TEXT,
      payment_status TEXT DEFAULT 'pending',
      shipping_method TEXT DEFAULT 'starken',
      payment_detail TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabla "orders" creada o ya existente en la nube.');

  // 2.7 Crear tabla de bundle_items para conjuntos dinámicos
  await client.execute(`
    CREATE TABLE IF NOT EXISTS bundle_items (
      bundle_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      PRIMARY KEY (bundle_id, product_id),
      FOREIGN KEY (bundle_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ Tabla "bundle_items" creada o ya existente en la nube.');

  // 3. Poblar configuración por defecto
  const configRows = await client.execute('SELECT COUNT(*) as count FROM configuration');
  if (configRows.rows[0].count === 0) {
    await client.execute(`
      INSERT INTO configuration (store_name, store_email, store_description)
      VALUES ('Joyas JP', 'contacto@joyasjp.cl', 'Alta joyería para la escena urbana con diseños únicos y calidad premium.');
    `);
    console.log('✅ Configuración por defecto insertada en la nube.');
  }

  // 4. Poblar productos de demostración iniciales
  const productRows = await client.execute('SELECT COUNT(*) as count FROM products');
  if (productRows.rows[0].count === 0) {
    console.log('📦 Insertando productos iniciales de demostración en la nube...');
    for (const p of initialProducts) {
      await client.execute({
        sql: `INSERT INTO products (
          id, name, slug, price, discount_price, stock, category, imageUrl, gallery, description, color, materials, custom_label, is_priority
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.id, p.name, p.slug, p.price, p.discount_price || null, p.stock, p.category, p.imageUrl, p.gallery, p.description, p.color, p.materials, p.custom_label || null, p.is_priority
        ]
      });
    }
    console.log(`🎉 Se insertaron ${initialProducts.length} productos iniciales en Turso Cloud.`);
  }

  console.log('\n🌟 Base de datos en Turso Cloud inicializada de forma impecable.');
  client.close();
}

main().catch(err => {
  console.error('❌ Error durante la inicialización de Turso Cloud:', err);
  process.exit(1);
});
