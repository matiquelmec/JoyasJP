/**
 * Sistema de versionado de assets para cache busting
 * Cada vez que se actualiza un asset crítico, incrementa su versión
 */

// Versión automática basada en build time + hash de contenido
const BUILD_ID = '20240523' // Versión fija para consistencia SSR/Client

export const ASSET_VERSIONS = {
  // Videos principales - incrementa cuando cambies el contenido
  'mi-video.mp4': 'v1',
  'mi-video2.mp4': 'v3',

  // Logo WebP optimizado - incrementa cuando cambies el logo
  'logo.webp': 'v2',

  // Imagen de nosotros - incrementa cuando cambies la imagen
  'nosotros.webp': 'v1'
} as const

export function getAssetUrl(assetPath: string): string {
  // Extraer el nombre del archivo
  const fileName = assetPath.split('/').pop()

  if (!fileName || !ASSET_VERSIONS[fileName as keyof typeof ASSET_VERSIONS]) {
    return assetPath
  }

  const version = ASSET_VERSIONS[fileName as keyof typeof ASSET_VERSIONS]
  const separator = assetPath.includes('?') ? '&' : '?'

  return `${assetPath}${separator}v=${version}`
}

export function getVideoUrl(videoFileName: string): string {
  return getAssetUrl(`/assets/${videoFileName}`)
}

export function getImageUrl(imageFileName: string): string {
  return getAssetUrl(`/assets/${imageFileName}`)
}

// Hook para componentes React
export function useAssetUrl(assetPath: string): string {
  return getAssetUrl(assetPath)
}