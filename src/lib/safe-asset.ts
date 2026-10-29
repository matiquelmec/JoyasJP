/**
 * Sistema de Assets Seguro y Versionado ("Foolproof")
 * Centraliza la lógica de rutas y versionado para evitar 404s y descargas dobles.
 */

export const ASSET_VERSION = 'v20240523'

export const ASSET_VERSIONS: Record<string, string> = {
  'mi-video.mp4': 'v1',
  'mi-video.webm': 'v1',
  'mi-video2.mp4': 'v3',
  'mi-video2.webm': 'v1',
  'logo.webp': 'v2',
  'nosotros.webp': 'v1',
}

/**
 * Genera una URL absoluta y versionada para un asset local en /assets/.
 * @param path - Nombre del archivo (ej: 'logo.webp') o ruta relativa (ej: '/assets/logo.webp')
 * @returns Ruta absoluta sanitizada con versionado
 */
export function getSafeUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path

  let cleanPath = path

  if (!cleanPath.startsWith('/') && !cleanPath.startsWith('assets/')) {
    cleanPath = `/assets/${cleanPath}`
  } else if (cleanPath.startsWith('assets/')) {
    cleanPath = `/${cleanPath}`
  } else if (cleanPath.startsWith('/') && !cleanPath.startsWith('/assets/')) {
    cleanPath = `/assets${cleanPath}`
  }

  const fileName = cleanPath.split('/').pop()?.split('?')[0] || ''
  const version = ASSET_VERSIONS[fileName] || ASSET_VERSION
  const separator = cleanPath.includes('?') ? '&' : '?'

  return `${cleanPath}${separator}v=${version}`
}

export function getVideoUrl(videoFileName: string): string {
  return getSafeUrl(videoFileName)
}

export function getImageUrl(imageFileName: string): string {
  return getSafeUrl(imageFileName)
}
