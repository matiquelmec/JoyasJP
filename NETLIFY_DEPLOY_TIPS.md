# 🚀 Consejos para Desplegar Proyectos Next.js en Netlify

Este documento resume los aprendizajes clave y soluciones a problemas comunes encontrados durante el despliegue de proyectos Next.js en Netlify, especialmente útiles para evitar futuros inconvenientes.

---

## 💡 Problemas Comunes y Soluciones

### 1. Errores de "Module not found" con alias de ruta (`@/`)

**Diagnóstico:**
Netlify falla la compilación con errores como `Module not found: Can't resolve '@/components/...'` a pesar de que los alias de ruta están configurados en `tsconfig.json` y funcionan localmente. Esto ocurre porque Webpack en el entorno de compilación de Netlify no siempre resuelve los alias automáticamente.

**Solución:**
Configura explícitamente los alias de ruta en `next.config.js` usando la propiedad `webpack`.

**Ejemplo en `next.config.js`:**

```javascript
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... otras configuraciones ...

  webpack: (config) => {
    config.resolve.alias['@/hooks'] = path.resolve(__dirname, 'src/hooks');
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'src/components');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'src/lib');
    // Añade aquí cualquier otro alias que uses (ej: '@/utils', '@/styles')
    return config;
  },
};

module.exports = nextConfig;
```

### 2. "TypeScript not found" o dependencias de desarrollo faltantes

**Diagnóstico:**
El build de Netlify falla indicando que no encuentra `typescript` o cualquier otra dependencia listada en `devDependencies` en `package.json`. Esto sucede si Netlify está configurado para instalar solo dependencias de producción.

**Solución:**
Asegúrate de que `NPM_FLAGS` en tu `netlify.toml` esté configurado para permitir la instalación de todas las dependencias.

**Ejemplo en `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18" # O la versión de Node.js que uses
  NPM_FLAGS = "--production=false" # ¡CRÍTICO! Permite instalar devDependencies
  NEXT_TELEMETRY_DISABLED = "1"
```

### 3. Problemas con "Submódulos" o directorios Git anidados

**Diagnóstico:**
Netlify falla al preparar el repositorio con errores como `fatal: No url found for submodule path '...'`. Esto ocurre cuando tienes un repositorio Git dentro de otro (como una carpeta de respaldo `.git` anidada) y Git lo interpreta como un submódulo no configurado.

**Solución:**
1.  **Elimina el directorio problemático:** La forma más efectiva es eliminar manualmente la carpeta que contiene el `.git` anidado de tu proyecto local.
    *   Ejemplo: `rmdir /s /q "path/to/your/problematic/backup/folder"` (Windows) o `rm -rf path/to/your/problematic/backup/folder` (Linux/macOS).
2.  **Añade el directorio a `.gitignore`:** Asegúrate de que la ruta de la carpeta eliminada esté en tu archivo `.gitignore` para que Git la ignore en el futuro.
3.  **Realiza un commit:** Confirma la eliminación del directorio en tu repositorio Git.

### 4. Desalineación de versiones de paquetes

**Diagnóstico:**
Aunque no siempre causa fallos directos, tener versiones desalineadas de paquetes relacionados (ej. `next` y `eslint-config-next`) puede llevar a advertencias o comportamientos inesperados.

**Solución:**
Mantén las versiones de paquetes relacionados (especialmente los de Next.js y sus configuraciones de ESLint) lo más alineadas posible. Revisa tu `package.json` y actualiza las versiones si es necesario.

---

## ✅ Checklist para Futuros Despliegues

Antes de cada despliegue, considera revisar lo siguiente:

*   **`next.config.js`:**
    *   `output: 'export'` (si es un sitio estático)
    *   `images: { unoptimized: true }` (si no usas la optimización de imágenes de Next.js en Netlify)
    *   Configuración `webpack` con alias de ruta explícitos.
*   **`netlify.toml`:**
    *   `command = "npm run build"`
    *   `publish = "out"`
    *   `NPM_FLAGS = "--production=false"` en `[build.environment]`
    *   `NODE_VERSION` configurado a una versión compatible.
*   **`package.json`:**
    *   Script `"build": "next build"`
    *   Versiones de `next` y `eslint-config-next` alineadas.
*   **`.gitignore`:**
    *   Excluye `node_modules/`, `.next/`, `out/` y cualquier directorio de respaldo o temporal.
*   **Variables de Entorno en Netlify UI:**
    *   Todas las variables necesarias configuradas con nombres EXACTOS (sensibles a mayúsculas y minúsculas).
    *   Realiza un "Trigger deploy" después de cambiar variables.

---

## 🚀 Flujo de Trabajo Recomendado

1.  **Desarrollo Local:** Trabaja y prueba tu aplicación localmente.
2.  **Commit de Cambios:** Realiza commits atómicos y con mensajes claros.
3.  **Push a Git:** Sube tus cambios al repositorio remoto.
4.  **Monitoreo en Netlify:** Observa el log de despliegue en Netlify. Si falla, revisa los errores y consulta esta guía.
5.  **Debugging:** Si el problema persiste, intenta replicar el build localmente (`npm run build`) para ver si los errores son los mismos.

---

**¡Esperamos que esta guía te ahorre tiempo y frustraciones en tus próximos despliegues!**
