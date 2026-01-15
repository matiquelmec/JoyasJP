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
