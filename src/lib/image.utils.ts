/**
 * Utilidades de manipulación de imágenes en el cliente para Joyas JP
 */

/**
 * Recibe un archivo de imagen (JPEG, PNG, etc.), lo redimensiona a un ancho máximo
 * de 1200px (manteniendo el aspecto) y lo convierte a formato WebP comprimido.
 * 
 * @param file Archivo original subido desde el input HTML
 * @param maxDimension Ancho o alto máximo en píxeles (por defecto 1200)
 * @param quality Calidad de compresión WebP entre 0 y 1 (por defecto 0.82)
 */
export function compressToWebP(
  file: File,
  maxDimension: number = 1200,
  quality: number = 0.82
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Si el navegador no soporta FileReader o Canvas, devolver archivo original como fallback de seguridad
    if (typeof window === 'undefined' || !window.FileReader || !window.HTMLCanvasElement) {
      return resolve(file)
    }

    // Omitir si ya es un WebP pequeño
    if (file.type === 'image/webp' && file.size < 300 * 1024) {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        // Calcular dimensiones óptimas proporcionales
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        // Crear lienzo canvas para renderizar
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return resolve(file) // Fallback si no hay contexto
        }

        // Dibujar imagen escalada en el canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Exportar a blob WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file)
            }

            // Crear el nuevo objeto File WebP
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
            const webpFile = new File([blob], `${nameWithoutExt}.webp`, {
              type: 'image/webp',
              lastModified: Date.now()
            })

            console.log(`⚡ Imagen optimizada en el cliente: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) -> ${webpFile.name} (${(webpFile.size / 1024).toFixed(1)} KB)`)
            resolve(webpFile)
          },
          'image/webp',
          quality
        )
      }

      img.onerror = (err) => {
        reject(err)
      }
    }

    reader.onerror = (err) => {
      reject(err)
    }
  })
}
