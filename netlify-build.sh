#!/bin/bash

# Script de build para Netlify - fuerza instalación de TypeScript
echo "🔧 Instalando dependencias de TypeScript..."
npm install --save-dev typescript @types/node @types/react @types/react-dom

echo "📋 Verificando instalación..."
npm list typescript

echo "🚀 Ejecutando build..."
npm run build