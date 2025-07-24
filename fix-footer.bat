@echo off
chcp 65001 >nul
echo ==========================================
echo    AGREGANDO FOOTER A JOYASJP
echo ==========================================
echo.

cd /d "%~dp0"
if not exist "src\app\layout.tsx" (
    echo ERROR: No estoy en la carpeta correcta del proyecto
    echo Por favor ejecuta este script desde la carpeta "Proyecto Limpio JoyasJP"
    pause
    exit /b 1
)

echo [1/3] Creando backup del layout actual...
copy "src\app\layout.tsx" "layout_backup.tsx" >nul

echo [2/3] Agregando import del Footer...
powershell -Command "& {$content = Get-Content 'src\app\layout.tsx' -Raw; $content = $content -replace \"import { Header } from '@/components/layout/header';\", \"import { Header } from '@/components/layout/header';`nimport { Footer } from '@/components/layout/footer';\"; Set-Content 'src\app\layout.tsx' -Value $content}"

echo [3/3] Agregando componente Footer al JSX...
powershell -Command "& {$content = Get-Content 'src\app\layout.tsx' -Raw; $content = $content -replace \"          </main>`n`n        </div>\", \"          </main>`n          <Footer />`n        </div>\"; Set-Content 'src\app\layout.tsx' -Value $content}"

echo.
echo ===== VERIFICANDO CAMBIOS =====
echo.
echo Buscando import del Footer:
findstr /i "Footer" src\app\layout.tsx

echo.
echo ===== PROBANDO EL SITIO =====
echo Ejecuta: npm run dev
echo Ve a localhost:3000 y verifica que el footer aparezca al final

echo.
if exist "layout_backup.tsx" (
    echo ✅ Backup creado en: layout_backup.tsx
    echo    Si algo sale mal, puedes restaurar con:
    echo    copy layout_backup.tsx src\app\layout.tsx
)

echo.
echo ==========================================
echo    FOOTER AGREGADO EXITOSAMENTE
echo ==========================================
echo.
pause