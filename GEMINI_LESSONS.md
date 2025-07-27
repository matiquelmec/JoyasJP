```markdown
# Lecciones Aprendidas con Gemini

## Incidente: Eliminación de `src/lib/products.ts`

**Fecha:** 26 de julio de 2025

**Descripción del Incidente:**
Durante una fase de optimización del proyecto "Joyas JP", se identificó el archivo `src/lib/products.ts` (que contenía una lista estática de productos) como redundante, dado que la aplicación ya obtenía los datos de productos de forma dinámica desde Supabase. Se procedió a eliminar este archivo con la intención de limpiar y optimizar el codebase.

**Causa Raíz:**
Aunque la lógica principal de obtención de productos apuntaba a Supabase, existían dependencias o usos indirectos del archivo `src/lib/products.ts` en otras partes del código que no fueron identificadas exhaustivamente antes de la eliminación. Esto resultó en una ruptura de la funcionalidad del proyecto, a pesar de que la eliminación parecía lógica en el contexto de la centralización de datos en Supabase.

**Lección Aprendida:**
La eliminación de archivos, incluso aquellos que parecen redundantes, puede tener consecuencias no intencionadas si no se realiza un análisis de dependencias extremadamente minucioso y una validación funcional exhaustiva post-cambio. La "redundancia aparente" no siempre significa "ausencia de dependencia".

**Nuevas Directrices para Interacciones Futuras:**

1.  **Análisis de Dependencias Profundo:** Antes de proponer la eliminación de cualquier archivo (especialmente aquellos que contienen datos, configuraciones o componentes), se realizará un análisis más exhaustivo de sus dependencias, buscando no solo importaciones directas sino también posibles usos indirectos o configuraciones que puedan apuntar a ellos.
2.  **Validación Funcional Rigurosa Post-Cambio:** Después de cualquier modificación que implique la eliminación o cambios estructurales significativos, se priorizará la validación funcional. Esto incluirá:
    *   Sugerir la ejecución de pruebas unitarias/de integración (si existen).
    *   Solicitar la ejecución de `npm run dev` o `npm run build` para una validación funcional inmediata del proyecto.
    *   Confirmar con el usuario que la funcionalidad esperada no ha sido afectada.
3.  **Comunicación y Confirmación Explícita:** Se mantendrá una comunicación clara y se buscará una confirmación explícita del usuario antes de proceder con acciones que puedan tener un impacto significativo en la estabilidad del proyecto, como la eliminación de archivos.

Este documento servirá como un recordatorio para asegurar que futuras optimizaciones se realicen con la máxima cautela y precisión, garantizando la estabilidad y funcionalidad del proyecto en todo momento.
```