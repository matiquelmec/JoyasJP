# Joyas JP 💍✨

> E-commerce premium y plataforma de administración avanzada para **Joyas JP**, una tienda de joyería fina especializada en Chile.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![MercadoPago](https://img.shields.io/badge/MercadoPago-SDK-blueviolet?style=for-the-badge)](https://www.mercadopago.cl/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify)](https://www.netlify.com/)

---

## 📖 Resumen del Proyecto

**Joyas JP** es una aplicación web moderna de comercio electrónico (E-commerce) de extremo a extremo diseñada para la exhibición y venta de piezas de joyería exclusivas. Cuenta con una experiencia de usuario (UX) sumamente fluida y visualmente atractiva en el frontend, y un panel de administración robusto para la gestión de productos, inventario en tiempo real y seguimiento de pedidos.

---

## 🛠️ Stack Tecnológico

La plataforma está construida utilizando tecnologías modernas de desarrollo web:

*   **Frontend**: [Next.js 14.2.3](https://nextjs.org/) (App Router) con [React 18](https://react.dev/) y [TypeScript](https://www.typescriptlang.org/).
*   **Base de Datos y Autenticación**: [Supabase](https://supabase.com/) (PostgreSQL) para la gestión dinámica de datos y consistencia atómica de stock.
*   **Gestión de Estado**: [Zustand](https://zustand.docs.pmnd.rs/) para el manejo del carrito de compras y lista de favoritos (wishlist).
*   **Pasarela de Pagos**: [Mercado Pago SDK](https://www.mercadopago.cl/developers) para transacciones locales seguras y fluidas en Chile.
*   **Diseño y Estilos**: [Tailwind CSS](https://tailwindcss.com/) para una UI responsiva, moderna y premium.
*   **Herramientas de Calidad de Código**: [Biome](https://biomejs.dev/) para formateo ultra rápido y linting de código.
*   **Optimización de Imágenes**: [Sharp](https://sharp.pixelplumbing.com/) para el procesamiento y optimización de assets.

---

## 🌟 Características Principales

### 1. Experiencia de Usuario Premium (Frontend)
*   **Sección Hero Inmersiva**: Integración de video de fondo (`mi-video.mp4`) optimizado que se extiende hasta el borde de navegación superior.
*   **Optimización de Carga**: Carga ultrarrápida del catálogo de joyas (menos de 1.2s en LCP) gracias al Server-Side Rendering (SSR).
*   **Favicon Personalizado**: Asset dedicado con cache-busting integrado para garantizar actualizaciones visuales inmediatas.
*   **Navegación Dinámica e Intuitiva**: Sección de catálogo de productos, servicios exclusivos para artistas y flujo de compra simplificado.

### 2. Algoritmo de Productos Destacados
Para maximizar las conversiones y visibilidad de las joyas, se implementó un sistema dinámico que baraja de forma inteligente los productos en vitrina usando el algoritmo **Fisher-Yates** con 4 estrategias alternativas:
*   `pure_random`: Aleatoriedad pura sobre el catálogo.
*   `weighted_categories`: Ponderación inteligente basada en categorías de productos.
*   `stock_weighted`: Impulso automático de productos con mayor stock disponible.
*   `time_based`: Estrategia temporal para destacar novedades.

### 3. Flujo de Checkout Completo 🛒
*   **Formulario de Despacho Optimizado**: Captura inteligente de datos de envío incluyendo validación de correos, teléfonos y selector nativo de las 16 regiones de Chile.
*   **Generación de Órdenes Seguras**: Las órdenes se registran en la base de datos de Supabase *antes* de redirigir al portal de Mercado Pago para garantizar trazabilidad.
*   **Integración con Mercado Pago**: Transferencia automática de datos del cliente (nombre, email y teléfono) a la pasarela de pagos para evitar rellenados repetitivos.
*   **Auto-limpieza del Carrito**: Limpieza reactiva del estado local del carrito tras una compra completada con éxito.

### 4. Panel de Administración Avanzado (`/admin`)
Panel protegido por contraseña para la administración general del negocio:
*   **Dashboard con KPIs**: Métricas clave de rendimiento en tiempo real (ventas del mes, número de pedidos, alerta de productos con stock bajo).
*   **Gestión de Inventario**: Edición interactiva y en tiempo real del stock de los más de 126 productos disponibles.
*   **Filtros de Búsqueda**: Filtrado ágil por categoría, nombre e indicador visual del estado de stock.
*   **Control de Pedidos**: Visualización y actualización del estado de los pedidos (Pendiente, Procesando, Enviado, Entregado, Cancelado) sincronizado con las notificaciones de pago de Mercado Pago.

---

## 📂 Estructura del Proyecto

```bash
src/
├── app/                  # Rutas principales (Next.js App Router)
│   ├── (legal)/          # Términos, condiciones y políticas de privacidad
│   ├── admin/            # Panel de control de administración y login
│   ├── api/              # Endpoints API (checkout, webhook de Mercado Pago, etc.)
│   ├── checkout/         # Flujo de recolección de datos y checkout
│   ├── contacto/         # Formulario de contacto
│   ├── favoritos/        # Sección de Wishlist del cliente
│   ├── productos/        # Catálogo detallado e inventario
│   ├── nosotros/         # Historia de Joyas JP
│   └── servicios/        # Servicio especial para artistas y orfebrería
├── components/           # Componentes modulares y reutilizables
│   ├── admin/            # AuthProvider, Sidebar, ProductsManager, OrdersManager
│   ├── layout/           # Header, Footer, Navegación responsiva
│   └── ui/               # Componentes atómicos (Table, Buttons, Dialogs, etc.)
├── config/               # Configuraciones del sitio y SEO
├── contexts/             # Contextos globales de React
├── hooks/                # Hooks personalizados
├── lib/                  # Clientes de servicios (Supabase client)
└── public/               # Assets públicos (Videos, logotipos, favicon)
```

---

## 🚀 Guía de Configuración Local

Sigue los siguientes pasos para poner en marcha el proyecto en tu entorno local:

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/JoyasJP.git
cd JoyasJP
```

### 2. Instalar Dependencias
Se recomienda utilizar `npm` para mantener la consistencia del package-lock:
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes claves:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-tu-access-token-de-mercado-pago
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-tu-public-key-de-mercado-pago

# Administración
NEXT_PUBLIC_ADMIN_KEY=joyasjp2024 # Contraseña para acceder a /admin
```

### 4. Inicializar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 📦 Scripts Disponibles

*   `npm run dev`: Inicia el servidor de desarrollo local.
*   `npm run build`: Genera el build de producción optimizado y crea el sitemap.
*   `npm run start`: Inicia el servidor de Next.js en producción.
*   `npm run lint`: Ejecuta el análisis estático de errores (ESLint).
*   `npm run typecheck`: Valida los tipos de TypeScript sin emitir archivos.
*   `npm run clean`: Formatea y corrige automáticamente el código utilizando Biome.
*   `npm run check`: Ejecuta el análisis completo de Biome (formato + linter).

---

## 🔒 Seguridad y Buenas Prácticas

1.  **Protección de Credenciales**: Las claves secretas de producción de Supabase y Mercado Pago están configuradas como variables del sistema en el entorno del servidor y nunca se exponen al cliente.
2.  **Optimización SEO**: Configuración automatizada de sitemaps (`next-sitemap`), datos estructurados en formato JSON-LD y etiquetas meta optimizadas para el mercado en Chile.
3.  **Consistencia de Código**: Formateo estricto del código con **Biome** y chequeos automatizados de tipos antes de cada compilación para prevenir fallos en producción.
4.  **Trazabilidad**: Conciliación directa a través de identificadores únicos entre las órdenes registradas en Supabase y las transacciones reportadas vía Webhooks por Mercado Pago.

---
*Desarrollado con pasión para Joyas JP. Todos los derechos reservados.* 💍✨
