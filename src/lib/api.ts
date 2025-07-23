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

  return data as Product[];
}

export async function getColors(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('color');

  if (error) {
    console.error('Error fetching colors:', error);
    throw error;
  }

  let colors = data
    .map(item => {
      const normalized = normalizeColor(item.color);
      // Capitalize the first letter
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort(); // Sort alphabetically

  // Find and remove "Mixto" if it exists, then add it to the beginning
  const mixtoIndex = colors.indexOf('Mixto');
  if (mixtoIndex > -1) {
    colors.splice(mixtoIndex, 1);
    colors.unshift('Mixto');
  }

  return colors;
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
