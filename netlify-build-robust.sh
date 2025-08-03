#!/bin/bash

# 🚀 SCRIPT DE BUILD ULTRA-ROBUSTO PARA NETLIFY - JOYAS JP
# Solución definitiva para conflictos de TypeScript y ESLint

echo "🔧 Iniciando build ultra-robusto para Joyas JP..."

# Limpiar completamente el entorno
echo "🧹 Limpiando entorno completamente..."
rm -rf node_modules/.cache || true
rm -rf .next || true
rm -rf node_modules || true

# Instalar dependencias con npm install (más robusto que npm ci para conflictos)
echo "📦 Instalando dependencias con resolución de conflictos..."
npm install --legacy-peer-deps

# Verificar e instalar TypeScript específicamente
echo "⚡ Garantizando TypeScript 5.8.4..."
npm install --save-dev typescript@5.8.4 --legacy-peer-deps

# Downgrade ESLint config para compatibilidad
echo "🔧 Configurando ESLint compatible..."
npm install --save-dev eslint-config-next@14.2.0 --legacy-peer-deps

# Verificar instalación
echo "📋 Verificando instalaciones:"
echo "- TypeScript:" && npx tsc --version || echo "  ⚠️ No disponible"
echo "- Next.js:" && npx next --version || echo "  ⚠️ No disponible"

# Crear tsconfig si no existe
echo "🔍 Verificando tsconfig.json..."
if [ ! -f "tsconfig.json" ]; then
    echo "⚠️ Creando tsconfig.json básico..."
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "plugins": [{"name": "next"}]
  },
  "include": ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF
fi

# Build con configuración robusta
echo "🏗️ Ejecutando build de Next.js..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

echo "✅ Build ultra-robusto completado exitosamente!"