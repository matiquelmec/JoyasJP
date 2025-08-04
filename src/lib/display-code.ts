// Generate display codes from product ID and category for URLs and display

const categoryPrefixes = {
  'cadenas': 'PCA',
  'dijes': 'PDD', 
  'pulseras': 'PPU',
  'aros': 'PAR'
}

export function generateDisplayCode(id: string, category: string): string {
  const prefix = categoryPrefixes[category.toLowerCase()] || 'PRD'
  
  // Extract numeric part from UUID (take last 8 characters and convert to number)
  const numericId = parseInt(id.replace(/\D/g, '').slice(-6)) || 1
  
  return `${prefix}_${numericId}`
}

export function getProductDisplayCode(product: any): string {
  if (product.code) {
    return product.code // Use existing code if available
  }
  
  if (product.id && product.category) {
    return generateDisplayCode(product.id, product.category)
  }
  
  return product.id // Fallback to ID
}

// This way we can show PCA_12345 in URLs without needing a database column