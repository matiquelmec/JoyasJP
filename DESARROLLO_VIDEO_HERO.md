# Desarrollo del Video Hero - Joyas JP

## Resumen del Proyecto
Implementación de un hero con video de fondo para la página principal de Joyas JP, usando el video `mi-video1.mp4` (~5MB) con reproducción en bucle.

## Objetivo Inicial
- Video de fondo a pantalla completa con bucle
- Secuencia de carga: video → logo → contenido
- Efecto inmersivo con el slogan "Atrévete a jugar"

## Desarrollo Técnico

### Fase 1: Sistema de Carga Secuencial
**Implementación**: Sistema complejo con framer-motion
- BrandLoader con animaciones escalonadas
- LoadingProvider con contexto de estado
- ProductSkeleton para páginas de productos
- Detección de carga completa de página

**Resultado**: Funcionaba pero causaba problemas de carga
**Decisión**: Eliminado por solicitud del usuario

### Fase 2: Video Hero Simple
**Implementación**: VideoHero component básico
```tsx
<video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
  <source src="/assets/mi-video1.mp4" type="video/mp4" />
</video>
```

**Problemas encontrados**:
- Errores de service worker: "Failed to execute 'put' on 'Cache': Partial response (status code 206)"
- Video no cubría completamente los costados en algunas pantallas

### Fase 3: Intento de Efecto Cinematográfico
**Objetivo**: Centro nítido del video con costados difuminados (estilo Netflix)

**Enfoques probados**:

1. **Doble video con máscara CSS**:
   - Video base difuminado con `filter: blur()`
   - Video superior con `maskImage` radial
   - **Resultado**: No funcionó correctamente

2. **Clip-path con elipse**:
   - Video difuminado de fondo
   - Video nítido con `clip-path: ellipse()`
   - **Resultado**: Efecto poco natural

3. **Videos superpuestos con dimensiones limitadas**:
   - Limitación de `maxWidth` del video principal
   - **Resultado**: Efectos no visibles

**Problemas técnicos**:
- CSS masks tienen soporte limitado en videos
- Múltiples instancias de video causan problemas de rendimiento
- Z-index conflictivo con overlays

### Fase 4: Solución Final
**Implementación**: Video hero limpio y confiable
```tsx
<section className="relative h-screen w-screen overflow-hidden">
  <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
    <source src="/assets/mi-video1.mp4" type="video/mp4" />
  </video>
  <div className="absolute inset-0 bg-black/40" />
  <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-4 pt-40 md:pt-44">
    {/* Contenido */}
  </div>
</section>
```

**Características**:
- Video a pantalla completa con `object-cover`
- Overlay semi-transparente (`bg-black/40`)
- Contenido posicionado con z-index apropiado
- Sin efectos complejos que puedan fallar

## Errores Resueltos

### Service Worker Errors
**Error**: `TypeError: Failed to execute 'put' on 'Cache': Partial response (status code 206)`
**Solución**: 
- Eliminadas configuraciones de caché específicas para videos
- Removido `crossOrigin` y headers problemáticos
- Simplificación de la estructura de video

### Multiple GoTrueClient Instances
**Error**: Advertencias de Supabase sobre múltiples instancias
**Estado**: No crítico, advertencia informativa

## Configuraciones Aplicadas

### Next.js Config
- Headers de caché optimizados para assets
- Eliminadas configuraciones específicas de video que causaban problemas

### Componente Final
- Un solo video sin duplicaciones
- Z-index limpio: video base → overlay → contenido
- Responsive design mantenido
- Performance optimizada

## Recomendación para Efecto Cinematográfico

Para el efecto de "centro nítido, costados difuminados", se recomienda **edición de video externa**:

### DaVinci Resolve (Gratuito)
1. Importar `mi-video1.mp4`
2. Duplicar en 2 capas
3. Capa inferior: Aplicar Gaussian Blur (20-30px)
4. Capa superior: Aplicar Power Window elíptica (60-70% ancho)
5. Ajustar Softness para transición suave
6. Exportar como `mi-video1-efecto.mp4`

### Alternativas
- Adobe Premiere Pro
- Final Cut Pro
- CapCut (simple y gratuito)

## Estado Actual
✅ **Video hero funcionando correctamente**
✅ **Sin errores de service worker**
✅ **Carga rápida y confiable**
✅ **Responsive en todos los dispositivos**
✅ **Contenido bien posicionado**

## Archivos Modificados
- `src/components/layout/video-hero.tsx` - Componente principal
- `src/app/page.tsx` - Integración en homepage
- `next.config.js` - Configuraciones de caché
- Eliminados: sistema de loading, contextos, skeletons

## Lecciones Aprendidas
1. **CSS effects en videos son limitados** - Mejor usar edición externa
2. **Simplicidad > Complejidad** - Soluciones simples son más confiables
3. **Service workers y videos** - Evitar configuraciones de caché complejas
4. **Z-index hierarchy** - Mantener estructura clara y simple
5. **Browser compatibility** - Efectos avanzados no funcionan consistentemente

## Tiempo Total
Aproximadamente 2 horas de desarrollo e iteraciones para llegar a la solución final estable.