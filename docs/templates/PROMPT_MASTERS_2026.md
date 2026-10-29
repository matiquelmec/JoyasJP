# 🏛️ PLANTILLAS MAESTRAS DE PROMPTS — JOYAS JP (2026)
### Estándar Oficial: Titanium Vault Flow & Luxury UI Craftsmanship

Este documento contiene las plantillas ejecutivas calibradas para el stack de **Joyas JP** (Next.js 14 App Router, Turso LibSQL, Drizzle ORM, Zod, Tailwind Urban Luxury, Vitest) y sus reglas de negocio.

---

## 📋 PLANTILLA 1: REFINAMIENTO VISUAL & CRAFTSMANSHIP UI/UX (DUAL VAULT LUXURY)
> **Uso:** Rediseño de componentes, vitrina, fichas de joyas, redes sociales, carruseles y Sticky Bar móvil.

```markdown
Actúa como Principal Frontend Architect & Luxury E-Commerce Designer bajo AGENTS.md y el skill 'ui-ux-pro-max'.

OBJETIVO VISUAL:
[Describir la mejora visual, ej.: "Rediseñar la sección de Redes Sociales y la Sticky Vault Bar móvil con botón a WhatsApp (+56 9 8299 0513)"].

EJECUTA EL PROTOCOLO DE REFINAMIENTO VISUAL NIVEL 6:
1. Especialización de Diseño Urban Luxury:
   - Paleta OKLCH: Negro Obsidiana (#09090B), Oro Milano (#D4AF37), Plata Italiana 925 (#E2E8F0) y Rojo Terciopelo para ofertas.
   - Retícula Base 8 (8/16/24/32/48px) y Touch Targets ergonómicos >= 44px (48px en móvil).
   - Micro-interacciones sutiles: zoom suave en joyas, estados focus-visible nítidos y loaders fluidos sin CLS.
   - Contraste certificado WCAG 2.2 AA (>= 4.5:1 en textos y precios; prohibido texto oscuro sobre fondo oscuro).
2. Comprobación Sensorial en Navegador:
   - Inspecciona y certifica en móvil (390px) y escritorio (1440px) con Chrome DevTools MCP.
   - Certifica cero desbordamiento horizontal (overflow-x: hidden), legibilidad en la Thumb Zone y animaciones GPU fluidas.
3. Doble Puerta de Calidad:
   - Ejecuta npm run typecheck (0 errores).
   - Ejecuta npm test (100% pasando).
4. Entrega Ejecutiva & Git:
   - Commit semántico (style(ui): ... o feat(ui): ...).
   - Resumen visual con tabla de componentes impactados y confirmación del estado git.
```

---

## 🏛️ PLANTILLA 2: FEATURE DE NEGOCIO, BUNDLES O CHECKOUT (TITANIUM VAULT FLOW)
> **Uso:** Creación de endpoints, mutaciones de catálogo, cupones, lógica de conjuntos o procesamiento de pagos.

```markdown
Actúa como Staff Principal Software Engineer & Lead E-Commerce Architect bajo AGENTS.md y docs/architecture/BLUEPRINT_2026.md.

TAREA DE ALTO IMPACTO:
[Describir la tarea, ej.: "Implementar validación Zod en checkout con deducción atómica de stock para conjuntos y conciliación dual"].

EJECUTA EL PROTOCOLO TITANIUM VAULT FLOW EN 6 FASES:
FASE 0: PRE-FLIGHT & ACTIVACIÓN DE SKILLS
- Verifica que el working tree esté limpio en la rama correspondiente.
- Activa skills: 'vault-commerce-audit', 'turso-drizzle-engine' y 'ui-ux-pro-max'.
FASE 1: ARQUITECTURA UNIDIRECCIONAL & SEGURIDAD BLINDADA
- Cumplimiento unidireccional estricto (app ➔ components/features ➔ db/lib).
- Validación de entradas al 100% con Zod (safeParse).
- Guardrails administrativos con verificación de cookie HttpOnly JWT (cero localStorage para tokens).
- Integridad financiera: recálculo estricto de precios en servidor y deducción atómica en turso.batch para productos simples y bundle_items.
FASE 2: CRAFTSMANSHIP VISUAL & PERFORMANCE EDGE
- Estados completos: loading esqueletal (shimmer), estado vacío expresivo y feedback de error elegante.
- Sincronización instantánea en 0ms: ISR (revalidate = 60) + revalidatePath automático tras compras o guardados en /admin.
FASE 3: TRIPLE PUERTA DE CALIDAD
- Añade/actualiza tests unitarios en tests/unit/*.test.ts.
- Ejecuta y aprueba: npm run typecheck (0 errores) y npm test (100% pasando).
FASE 4: GOBERNANZA DOC-AS-CODE EN CASCADA
- Actualiza atómicamente README.md, BLUEPRINT_2026.md y AGENTS.md según aplique.
FASE 5: CICLO GIT & ENTREGA EJECUTIVA
- Git add selectivo y commit semántico bajo Conventional Commits (feat, fix, refactor, test, docs).
- Push a origin y reporte con tabla de cambios y hash de commit.
```
