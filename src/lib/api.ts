import { createClient } from '@supabase/supabase-js';
import { Product } from "./types";
import { normalizeColor } from './utils';
import { withCache, memoryCache } from './cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProducts(): Promise<Product[]> {
  return withCache('products-in-stock', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, stock')
      .gt('stock', 0);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    // Define the desired category order
    const categoryOrder: { [key: string]: number } = {
      'cadenas': 1,
      'dijes': 2,
      'pulseras': 3,
      'aros': 4,
    };

    // Sort the products based on the category order
    const sortedData = (data as Product[]).sort((a, b) => {
      const orderA = categoryOrder[a.category] || Infinity;
      const orderB = categoryOrder[b.category] || Infinity;
      return orderA - orderB;
    });

    return sortedData;
  }, 3 * 60 * 1000); // Cache por 3 minutos
}

export async function getColors(): Promise<string[]> {
  return withCache('product-colors', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('color');

    if (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }

    const uniqueColors = data
      .map(item => {
        const normalized = normalizeColor(item.color);
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
      })
      .filter((value, index, self) => self.indexOf(value) === index); // Get unique colors

    const customOrder = ['Dorado', 'Plateado', 'Negro', 'Mixto'];
    const orderedColors: string[] = [];
    const otherColors: string[] = [];

    // Add colors in custom order first
    customOrder.forEach(color => {
      if (uniqueColors.includes(color)) {
        orderedColors.push(color);
      }
    });

    // Add remaining unique colors, sorted alphabetically
    uniqueColors.forEach(color => {
      if (!customOrder.includes(color)) {
        otherColors.push(color);
      }
    });

    otherColors.sort(); // Sort remaining colors alphabetically

    return [...orderedColors, ...otherColors];
  }, 10 * 60 * 1000); // Cache por 10 minutos
}

export async function createOrder(orderDetails: { 
  customer_name: string; 
  shipping_address: string; 
  contact_email: string; 
  ordered_products: { product_id: string; quantity: number }[]; 
}) {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderDetails),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create order.');
  }

  // Invalidar cache después de crear pedido (stock puede haber cambiado)
  memoryCache.delete('products-in-stock');
  orderDetails.ordered_products.forEach(item => {
    memoryCache.delete(`product-${item.product_id}`);
  });

  return response.json();
}

export async function getProductById(id: string): Promise<Product | null> {
  return withCache(`product-${id}`, async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, stock')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }

    return data as Product;
  }, 5 * 60 * 1000); // Cache por 5 minutos
}

export async function getRelatedProducts(currentProductId: string, category: string, limit?: number): Promise<Product[]> {
  const cacheKey = `related-${currentProductId}-${category}-${limit || 4}`;
  
  return withCache(cacheKey, async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, imageUrl, category, description, materials, color')
      .eq('category', category)
      .neq('id', currentProductId)
      .gt('stock', 0)
      .order('updated_at', { ascending: false })
      .limit(limit || 4); // Usa el límite proporcionado o 4 por defecto

    if (error) {
      console.error('Error fetching related products:', error);
      return [];
    }

    return data as Product[];
  }, 5 * 60 * 1000); // Cache por 5 minutos
}

// You can add more API functions here, e.g., getProductById, createProduct, etc.
