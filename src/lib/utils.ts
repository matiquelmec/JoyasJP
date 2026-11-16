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
  multicolor: 'mixto',
}

export function normalizeColor(color: string | null | undefined): string {
  if (!color || typeof color !== 'string') return ''

  const trimmed = color.trim()
  if (!trimmed) return ''

  const lowerColor = trimmed.toLowerCase()

  if (lowerColor === 'prueba' || lowerColor === 'test' || lowerColor === '') {
    return ''
  }

  return colorMap[lowerColor] || lowerColor
}

/**
 * Optimiza automáticamente URLs de Cloudinary inyectando f_auto,q_auto:good,w_...,c_limit
 */
export function optimizeCloudinaryUrl(url: string | null | undefined, maxWidth: number = 800): string {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url
  }
  if (url.includes('f_auto') || url.includes('q_auto')) {
    return url
  }
  return url.replace('/upload/', `/upload/f_auto,q_auto:good,w_${maxWidth},c_limit/`)
}

export function getLocalFallbackImage(productId: string | number, category?: string): string {
  const idNum =
    typeof productId === 'number'
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

/**
 * Construye una URL segura de WhatsApp (https://wa.me/...) normalizando el número
 * y sanitizando emojis/surrogates para evitar errores de encoding en cualquier dispositivo.
 */
export function buildWhatsAppUrl(phone: string | null | undefined, message?: string): string {
  let digits = (phone || '56982990513').replace(/\D/g, '')
  if (digits.length === 9 && digits.startsWith('9')) {
    digits = `56${digits}`
  }
  if (!digits) {
    digits = '56982990513'
  }

  if (!message || !message.trim()) {
    return `https://wa.me/${digits}`
  }

  const sanitized = message
    .normalize('NFC')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\uD800-\uDFFF]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

  return `https://wa.me/${digits}?text=${encodeURIComponent(sanitized)}`
}
