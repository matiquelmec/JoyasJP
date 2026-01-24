'use client'

import ReactDOM from 'react-dom'

export function PreloadVideo({ src }: { src: string }) {
    // ⚡ INTELLIGENCE: Ejecutar en el cuerpo del componente (render phase)
    // Esto permite que el preload se inyecte lo antes posible, incluso durante el SSR/Hydration
    // en lugar de esperar al 'useEffect' (que corre después del paint).
    ReactDOM.preload(src, { as: 'video' })

    return null
}
