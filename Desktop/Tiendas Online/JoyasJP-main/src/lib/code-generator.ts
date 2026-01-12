// Utility for generating product codes automatically

const categoryPrefixes = {
  'cadenas': 'PCA',
  'dijes': 'PDD', 
  'pulseras': 'PPU',
  'aros': 'PAR'
}

export function generateProductCode(category: string, existingCodes: string[] = []): string {
  const prefix = categoryPrefixes[category.toLowerCase()] || 'PRD'
  
  // Find the next available number for this category
  let nextNumber = 1
  
  // Get all existing codes for this category
  const categoryCodes = existingCodes
    .filter(code => code.startsWith(prefix))
    .map(code => {
      const match = code.match(/_(\d+)$/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(num => num > 0)
  
  // Find the next available number
  if (categoryCodes.length > 0) {
    nextNumber = Math.max(...categoryCodes) + 1
  }
  
  return `${prefix}_${nextNumber}`
}

// Examples:
// generateProductCode('cadenas', ['PCA_1', 'PCA_2']) → 'PCA_3'
// generateProductCode('dijes', ['PDD_5', 'PDD_11']) → 'PDD_12'
// generateProductCode('pulseras', []) → 'PPU_1'