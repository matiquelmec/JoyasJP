// Utility functions for generating URL-friendly slugs

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

export function generateUniqueSlug(baseName: string, existingSlugs: string[] = []): string {
  let slug = generateSlug(baseName)
  let counter = 1
  const originalSlug = slug

  // If slug already exists, append number
  while (existingSlugs.includes(slug)) {
    slug = `${originalSlug}-${counter}`
    counter++
  }

  return slug
}

// Examples:
// "Cadena de Oro 18k" → "cadena-de-oro-18k"
// "Anillo con Diamante (Talla M)" → "anillo-con-diamante-talla-m"
// "Pulsera Corazón & Estrella" → "pulsera-corazon-estrella"