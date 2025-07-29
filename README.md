# 💎 Joyas JP - E-commerce de Alta Joyería Urbana

> Plataforma e-commerce moderna para joyería premium con diseños únicos y experiencia de usuario optimizada.

![Next.js 15](https://img.shields.io/badge/Next.js-15.4.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.52.0-green)

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# Configurar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
joyas-jp/
├── docs/                    # 📚 Documentación técnica
│   ├── MEMORIA_DESARROLLO.md
│   ├── OPTIMIZACIONES-IMPLEMENTADAS.md
│   └── deployment-guides/
├── tools/                   # 🔧 Scripts de desarrollo
│   ├── fix-footer.bat
│   └── commit_message.txt
├── src/
│   ├── app/                # 📄 Pages (App Router)
│   ├── components/         # 🧩 Componentes React
│   ├── hooks/              # 🎣 Custom hooks
│   ├── lib/                # 📚 Utilidades y configuración
│   └── utils/              # 🛠️ Funciones auxiliares
├── public/                 # 🌐 Assets estáticos
└── scripts/                # ⚙️ Scripts de base de datos
```

## ✨ Características Principales

- **🎨 UI/UX Premium**: Design system con Radix UI y Tailwind CSS
- **📱 Responsive**: Optimizado para mobile, tablet y desktop
- **🚀 Performance**: Image optimization, code splitting, caching avanzado
- **🔒 Seguridad**: Headers HTTP, validación de datos, sanitización
- **🛒 E-commerce**: Carrito, wishlist, checkout con MercadoPago
- **📊 Analytics**: Performance monitoring y Web Vitals
- **♿ Accesibilidad**: WCAG 2.1 compliance

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Estado**: Zustand + persistence
- **Forms**: React Hook Form + Zod

### Backend & Database
- **BaaS**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (imágenes)
- **Auth**: Supabase Auth
- **Pagos**: MercadoPago SDK

### Deployment & Monitoring
- **Hosting**: Netlify
- **CDN**: Netlify Edge
- **Performance**: Web Vitals, Custom monitoring

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run typecheck    # TypeScript compiler check
```

## 📊 Performance

- **First Load JS**: ~170KB (optimizado)
- **LCP**: < 1.5s
- **CLS**: < 0.1
- **FID**: < 100ms

## 🚦 Estado del Proyecto

- ✅ **Core E-commerce**: Completado
- ✅ **Payment Integration**: MercadoPago implementado
- ✅ **Admin Panel**: Dashboard funcional
- ✅ **Performance Optimization**: Cache y optimizaciones
- 🔄 **SEO Enhancement**: En progreso
- ⏳ **Testing Suite**: Pendiente

## 📚 Documentación

Consulta la carpeta `docs/` para documentación técnica detallada:

- **[Memoria de Desarrollo](docs/MEMORIA_DESARROLLO.md)**: Proceso completo de desarrollo
- **[Optimizaciones](docs/OPTIMIZACIONES-IMPLEMENTADAS.md)**: Detalles de performance
- **[Deploy Guide](docs/NETLIFY_DEPLOY_TIPS.md)**: Guía de despliegue

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de **Joyas JP**. Todos los derechos reservados.

---

**Desarrollado con ❤️ para la comunidad urbana chilena**