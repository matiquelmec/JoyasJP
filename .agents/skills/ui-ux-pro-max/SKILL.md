---
name: ui-ux-pro-max
description: Estándar de diseño Urban Luxury & Dual Vault para Joyas JP. Define la paleta cromática OKLCH/Hex (Negro Obsidiana, Oro Milano, Plata Italiana 925), jerarquía tipográfica Playfair + Bebas + Inter, retícula Base 8, ergonomía táctil (>= 44px), Sticky Vault Bar móvil y canal oficial de WhatsApp Concierge.
---

# UI/UX Pro Max — Joyas JP Luxury Design System

Esta skill guía el diseño e implementación de interfaces de usuario para **Joyas JP**, garantizando una experiencia de compra fluida, de alto impacto visual y adaptada a la cultura urbana y alta joyería en Chile.

## 1. Paleta Cromática Dual (Obsidian Vault & Italian Silver 925)

| Token Semántico | Hex | Equivalente OKLCH | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Negro Obsidiana** | `#09090B` | `oklch(0.12 0.005 260)` | Fondo principal de páginas y vitrina |
| **Noche Abisal** | `#020617` | `oklch(0.08 0.015 255)` | Fondo ambiental de Bóveda Plata 925 |
| **Oro Milano 18k** | `#D4AF37` | `oklch(0.76 0.120 85)` | Acento principal de marca, precios y CTAs |
| **Oro Champagne Suave** | `#F3E5AB` | `oklch(0.92 0.040 85)` | Bordes sutiles y textos secundarios destacados |
| **Plata Italiana 925** | `#E2E8F0` | `oklch(0.92 0.010 255)` | Badges de Ley 925, brillo metálico y cromo |
| **Rojo Terciopelo** | `#B91C1C` | `oklch(0.55 0.220 25)` | Badges de descuento y ofertas por tiempo limitado |
| **Esmeralda WhatsApp** | `#059669` | `oklch(0.60 0.150 160)` | Botones de WhatsApp Concierge (+56 9 8299 0513) |

## 2. Jerarquía Tipográfica & Retícula Base 8
- **Titulares de Marca e Impacto:** `Bebas Neue` / `Playfair Display`. Mayúsculas con tracking calibrado (`tracking-wider` o `tracking-tight`).
- **Cuerpo y Precios:** `Inter` o `PT Sans`. Números claros y legibles en formato CLP con separadores de miles (`$49.990`).
- **Retícula Base 8:** Espaciados consistentes en múltiplos de 8px (`p-4`, `p-6`, `p-8`, `gap-4`, `gap-6`, `py-16`, `py-24`).

## 3. Ergonomía Móvil y Touch Targets (WCAG 2.2 AA)
1. **Touch Targets $\ge 44\text{px}$:** Todo control interactivo (selectores de largo de cadena, filtros de categoría, carrusel y botón de añadir al carrito) debe medir como mínimo 44x44px (48px en móvil).
2. **Sticky Vault Bar Móvil:** En `/productos/[id]`, mantener la barra fija inferior con el precio activo, selector de variante y botón de compra en la zona del pulgar (*Thumb Zone*), acompañada de un enlace directo a **WhatsApp Concierge**.
3. **Contraste Innegociable:** Prohibido texto gris oscuro sobre fondo negro. Todo texto sobre lienzo obsidiana debe mantener una relación de contraste $\ge 4.5:1$.
