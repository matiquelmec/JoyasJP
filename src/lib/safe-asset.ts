/**
 * Sistema de Assets Seguro "Foolproof"
 * Centraliza la lógica de rutas y versionado para evitar 404s y descargas dobles.
 */

// Versión única para cache busting
export const ASSET_VERSION = 'v20240523';

/**
 * Genera una URL absoluta y versionada para un asset.
 * @param path - Nombre del archivo (ej: 'logo.webp') o ruta relativa (ej: '/assets/logo.webp')
 * @returns Ruta absoluta sanitizada con versionado (ej: '/assets/logo.webp?v=v20240523')
 */
export function getSafeUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Ignorar URLs externas

    // 1. Sanitizar ruta: Asegurar que empiece con /assets/
    let cleanPath = path;

    // Si solo pasan el nombre "logo.webp", agregamos el prefijo
    if (!cleanPath.startsWith('/') && !cleanPath.startsWith('assets/')) {
        cleanPath = `/assets/${cleanPath}`;
    }
    // Si pasan "assets/logo.webp" sin slash
    else if (cleanPath.startsWith('assets/')) {
        cleanPath = `/${cleanPath}`;
    }
    // Si pasan "/logo.webp" (asumimos que es asset si no está en assets)
    else if (cleanPath.startsWith('/') && !cleanPath.startsWith('/assets/')) {
        cleanPath = `/assets${cleanPath}`;
    }

    // 2. Agregar Versionado (Evita doble descarga si todos usan esta función)
    const separator = cleanPath.includes('?') ? '&' : '?';
    return `${cleanPath}${separator}v=${ASSET_VERSION}`;
}
