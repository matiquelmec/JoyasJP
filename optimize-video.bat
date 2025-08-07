@echo off
echo ========================================
echo OPTIMIZACION DE VIDEO PARA WEB
echo ========================================
echo.

REM Verificar si ffmpeg está instalado
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: FFmpeg no está instalado
    echo.
    echo Para instalar FFmpeg:
    echo 1. Ve a https://ffmpeg.org/download.html
    echo 2. Descarga la version para Windows
    echo 3. Agrega ffmpeg.exe al PATH del sistema
    echo.
    pause
    exit /b 1
)

echo [1/4] Verificando archivo de video original...
if not exist "public\assets\mi-video.mp4" (
    echo ERROR: No se encuentra public\assets\mi-video.mp4
    echo Asegurate de que el archivo existe
    pause
    exit /b 1
)

echo [2/4] Creando version optimizada para desktop (1.5MB aprox)...
ffmpeg -i "public\assets\mi-video.mp4" ^
       -c:v libx264 ^
       -crf 26 ^
       -preset medium ^
       -profile:v main ^
       -level 4.0 ^
       -movflags +faststart ^
       -c:a aac ^
       -b:a 128k ^
       -ar 44100 ^
       -y "public\assets\mi-video-optimized.mp4"

echo [3/4] Creando version mobile (800KB aprox)...
ffmpeg -i "public\assets\mi-video.mp4" ^
       -vf "scale=1280:720" ^
       -c:v libx264 ^
       -crf 28 ^
       -preset medium ^
       -profile:v main ^
       -level 3.1 ^
       -movflags +faststart ^
       -c:a aac ^
       -b:a 96k ^
       -ar 44100 ^
       -y "public\assets\mi-video-mobile.mp4"

echo [4/4] Generando poster de alta calidad...
ffmpeg -i "public\assets\mi-video.mp4" ^
       -ss 00:00:01 ^
       -vframes 1 ^
       -vf "scale=1920:1080" ^
       -q:v 2 ^
       -y "public\assets\video-poster-hd.jpg"

echo.
echo ========================================
echo OPTIMIZACION COMPLETADA!
echo ========================================
echo.
echo Archivos generados:
echo - mi-video-optimized.mp4 (Desktop)
echo - mi-video-mobile.mp4 (Mobile)
echo - video-poster-hd.jpg (Poster)
echo.
echo Ahora actualiza tu componente HeroBackground para usar:
echo - mi-video-optimized.mp4 para desktop
echo - mi-video-mobile.mp4 para mobile
echo - video-poster-hd.jpg como poster
echo.
pause