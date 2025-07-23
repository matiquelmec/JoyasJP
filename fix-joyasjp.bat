@echo off
chcp 65001 >nul
echo ==========================================
echo    CORRIGIENDO JOYASJP PARA NETLIFY
echo ==========================================
echo.

cd /d "%~dp0"
if not exist "next.config.js" (
    echo ERROR: No estoy en la carpeta correcta del proyecto
    echo Por favor ejecuta este script desde la carpeta "Proyecto Limpio JoyasJP"
    pause
    exit /b 1
)

echo [1/6] Creando backup de archivos actuales...
if exist "next.config.js" copy "next.config.js" "next.config.js.backup" >nul
if exist "netlify.toml" copy "netlify.toml" "netlify.toml.backup" >nul
if exist ".gitignore" copy ".gitignore" ".gitignore.backup" >nul

echo [2/6] Actualizando next.config.js...
(
echo /** @type {import^('next'^).NextConfig} */
echo const nextConfig = {
echo   // CRITICO: Static export para Netlify
echo   output: 'export',
echo.  
echo   // CRITICO: Desactivar optimizacion de imagenes
echo   images: {
echo     unoptimized: true
echo   },
echo.  
echo   // Configuracion de trailing slash
echo   trailingSlash: true,
echo.  
echo   // ESLint configuration
echo   eslint: {
echo     ignoreDuringBuilds: true
echo   },
echo.  
echo   // TypeScript configuration
echo   typescript: {
echo     ignoreBuildErrors: false
echo   }
echo }
echo.
echo module.exports = nextConfig
) > "next.config.js"

echo [3/6] Actualizando netlify.toml...
(
echo [build]
echo   command = "npm run build"
echo   publish = "out"
echo.
echo [build.environment]
echo   NODE_VERSION = "18"
echo   NPM_FLAGS = "--production=false"
echo   NEXT_TELEMETRY_DISABLED = "1"
echo.
echo [[redirects]]
echo   from = "/*"
echo   to = "/index.html"
echo   status = 200
echo.
echo [[headers]]
echo   for = "/*"
echo   [headers.values]
echo     X-Frame-Options = "DENY"
echo     X-XSS-Protection = "1; mode=block"
echo     X-Content-Type-Options = "nosniff"
) > "netlify.toml"

echo [4/6] Actualizando .gitignore...
(
echo # Dependencies
echo node_modules/
echo /.pnp
echo .pnp.js
echo.
echo # Testing
echo /coverage
echo.  
echo # Next.js
echo /.next/
echo /out/
echo.
echo # Production
echo /build
echo.
echo # Misc
echo .DS_Store
echo *.pem
echo.
echo # Debug
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo.
echo # Local env files
echo .env*.local
echo .env
echo.
echo # Vercel
echo .vercel
echo.
echo # TypeScript
echo *.tsbuildinfo
echo next-env.d.ts
echo.
echo # Netlify
echo .netlify/
) > ".gitignore"

echo [5/6] Limpiando builds anteriores...
if exist ".next" rmdir /s /q ".next" 2>nul
if exist "out" rmdir /s /q "out" 2>nul

echo [6/6] Probando el build...
echo.
npm run build
echo.

if exist "out\index.html" (
    echo ==========================================
    echo    ✅ EXITO! Tu proyecto esta corregido
    echo ==========================================
    echo.
    echo Proximos pasos:
    echo 1. git add .
    echo 2. git commit -m "Fix Next.js config for Netlify"
    echo 3. git push origin main
    echo.
    echo Tu sitio deberia desplegarse automaticamente en Netlify!
) else (
    echo ==========================================
    echo    ❌ ERROR en el build
    echo ==========================================
    echo Revisa los errores arriba y contacta soporte.
)

echo.
pause