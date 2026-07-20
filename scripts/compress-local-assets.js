const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directorio de assets a optimizar
const assetsDir = path.join(__dirname, '..', 'public', 'assets');

// Configuración de optimización
const MAX_DIMENSION = 1200; // Ancho o alto máximo
const QUALITY = 82; // Calidad de compresión (0-100)

// Extensiones soportadas
const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

async function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(await getFilesRecursively(filePath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (supportedExtensions.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stat = fs.statSync(filePath);
  const originalSizeKb = stat.size / 1024;

  // Evitar procesar archivos que ya son muy livianos (menos de 200 KB)
  if (originalSizeKb < 200) {
    return { status: 'skipped_light', originalSizeKb };
  }

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    let width = metadata.width;
    let height = metadata.height;

    // Calcular dimensiones si superan el máximo
    let needsResize = false;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      needsResize = true;
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }

    // Leer el buffer original para sobrescribir de forma segura
    const buffer = fs.readFileSync(filePath);
    let pipeline = sharp(buffer);

    if (needsResize) {
      pipeline = pipeline.resize(width, height);
    }

    // Configurar compresión según formato original
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 8 });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: QUALITY });
    }

    // Escribir de vuelta al mismo archivo
    await pipeline.toFile(filePath);
    
    const newStat = fs.statSync(filePath);
    const newSizeKb = newStat.size / 1024;
    const savingsPercent = ((originalSizeKb - newSizeKb) / originalSizeKb) * 100;

    return {
      status: 'optimized',
      originalSizeKb,
      newSizeKb,
      savingsPercent,
      resized: needsResize
    };
  } catch (error) {
    console.error(`❌ Error procesando ${path.basename(filePath)}:`, error.message);
    return { status: 'error', error: error.message };
  }
}

async function run() {
  console.log('⚡ Iniciando optimizador de imágenes por lotes...');
  console.log(`📂 Carpeta objetivo: ${assetsDir}`);
  console.log(`⚙️ Configuración: Max ${MAX_DIMENSION}px, Calidad ${QUALITY}%\n`);

  if (!fs.existsSync(assetsDir)) {
    console.error('❌ Error: El directorio public/assets no existe.');
    process.exit(1);
  }

  const files = await getFilesRecursively(assetsDir);
  console.log(`🔍 Se encontraron ${files.length} imágenes para evaluar.`);

  let optimizedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;

  for (const file of files) {
    const filename = path.basename(file);
    const result = await compressImage(file);

    if (result.status === 'optimized') {
      optimizedCount++;
      totalOriginalSize += result.originalSizeKb;
      totalNewSize += result.newSizeKb;
      console.log(`✅ [Optimizado] ${filename}: ${(result.originalSizeKb / 1024).toFixed(2)} MB -> ${(result.newSizeKb).toFixed(1)} KB (-${result.savingsPercent.toFixed(1)}%) ${result.resized ? '[Redimensionado]' : ''}`);
    } else if (result.status === 'skipped_light') {
      skippedCount++;
      totalOriginalSize += result.originalSizeKb;
      totalNewSize += result.originalSizeKb;
    } else if (result.status === 'error') {
      errorCount++;
    }
  }

  const totalSavedMb = (totalOriginalSize - totalNewSize) / 1024;
  console.log('\n📊 Resumen de Optimización:');
  console.log(`---------------------------------`);
  console.log(`✨ Imágenes optimizadas: ${optimizedCount}`);
  console.log(`⏭️ Imágenes omitidas (ya livianas): ${skippedCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  if (optimizedCount > 0) {
    console.log(`💾 Tamaño original total: ${(totalOriginalSize / 1024).toFixed(2)} MB`);
    console.log(`💾 Nuevo tamaño total: ${(totalNewSize / 1024).toFixed(2)} MB`);
    console.log(`🎉 Ahorro de espacio total: ${totalSavedMb.toFixed(2)} MB (-${((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1)}%)`);
  }
  console.log(`---------------------------------`);
}

run();
