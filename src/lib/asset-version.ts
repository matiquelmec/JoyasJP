/**
 * Sistema de versionado de assets para cache busting
 * Cada vez que se actualiza un asset crítico, incrementa su versión
 */

// Versión automática basada en build time + hash de contenido
const BUILD_ID = process.env.NEXT_BUILD_ID || Date.now().toString()

export const ASSET_VERSIONS = {
  // Videos principales - incrementa cuando cambies el contenido
  'mi-video1.mp4': 'v2',
  'mi-video2.mp4': 'v3', 
  
  // Logo WebP optimizado - incrementa cuando cambies el logo
  'logo.webp': 'v2',
  
  // Imágenes WebP optimizadas
  'nosotros.webp': 'v2'
} as const

export function getAssetUrl(assetPath: string): string {
  // Extraer el nombre del archivo
  const fileName = assetPath.split('/').pop()
  
  if (!fileName || !ASSET_VERSIONS[fileName as keyof typeof ASSET_VERSIONS]) {
    return assetPath
  }
  
  const version = ASSET_VERSIONS[fileName as keyof typeof ASSET_VERSIONS]
  const separator = assetPath.includes('?') ? '&' : '?'
  
  return `${assetPath}${separator}v=${version}&t=${BUILD_ID}`
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