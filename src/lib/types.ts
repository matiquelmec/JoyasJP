export interface NavLink {
  href: string;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  price: number; // Cambiado a number
  imageUrl: string;
  category: string;
  dimensions?: string; // Añadido
  materials?: string; // Añadido
  color?: string;
  detail?: string; // Añadido
  stock?: number;
  description?: string; // Mantener como opcional si no todos los productos tienen una descripción larga
  imageHint?: string;
  specifications?: { name: string; value: string }[];
  gallery?: { imageUrl: string; imageHint: string; isPrimary?: boolean; }[];
  quantity?: number;
  sku?: string; // Stock Keeping Unit
  variants?: { // For product variations like size, color
    type: string; // e.g., "color", "size"
    options: {
      value: string; // e.g., "red", "small"
      price?: string; // Optional price adjustment for variant
      imageUrl?: string; // Optional image for variant
    }[];
  }[];
  seo?: { // SEO metadata
    title?: string;
    description?: string;
    keywords?: string[];
  };
  created_at?: string; // Add created_at field
  featured?: boolean; // Added featured field
}