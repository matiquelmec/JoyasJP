import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const colorMap: { [key: string]: string } = {
  pleteado: 'plateado',
  plateada: 'plateado',
  plateado: 'plateado',
  dorado: 'dorado',
  dorada: 'dorado',
  negro: 'negro',
  negra: 'negro',
  mixto: 'mixto',
  mixta: 'mixto',
  multicolor: 'mixto', // Compatibilidad con datos antiguos
}

export function normalizeColor(color: string | null | undefined): string {
  if (!color || typeof color !== 'string') return ''

  const trimmed = color.trim()
  if (!trimmed) return ''

  const lowerColor = trimmed.toLowerCase()

  // Filtrar colores de prueba o inválidos
  if (lowerColor === 'prueba' || lowerColor === 'test' || lowerColor === '') {
    return ''
  }

  return colorMap[lowerColor] || lowerColor
}

export function getLocalFallbackImage(productId: string | number, category?: string): string {
  const idNum = typeof productId === 'number' 
    ? productId 
    : parseInt(productId.toString().replace(/\D/g, '')) || 1
  const cleanCategory = (category || '').toLowerCase()

  if (cleanCategory.includes('cadena')) {
    const index = (idNum % 7) + 1
    return `/assets/Cadena ${index}.jpeg`
  } else if (cleanCategory.includes('dije')) {
    const index = (idNum % 13) + 1
    return `/assets/Dijes ${index}.jpeg`
  } else if (cleanCategory.includes('pulsera')) {
    const index = (idNum % 12) + 1
    return `/assets/Pulsera ${index}.jpeg`
  } else {
    const index = (idNum % 6) + 1
    return `/assets/Producto ${index}.jpg`
  }
}

