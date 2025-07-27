import { createClient } from '@supabase/supabase-js';
import { Product } from "./types";
import { normalizeColor } from './utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProducts(): Promise<Product[]> {
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
}

export async function getColors(): Promise<string[]> {
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

  return response.json();
}

export async function getProductById(id: string): Promise<Product | null> {
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
}

export async function getRelatedProducts(currentProductId: string, category: string, limit?: number): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, stock')
    .eq('category', category)
    .neq('id', currentProductId)
    .gt('stock', 0)
    .limit(limit || 4); // Usa el límite proporcionado o 4 por defecto

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return data as Product[];
}

// You can add more API functions here, e.g., getProductById, createProduct, etc.
