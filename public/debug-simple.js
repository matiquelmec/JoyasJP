// Script simple para capturar TODO elemento blanco visible
console.log('🔍 INICIANDO DETECCIÓN SIMPLE DE ELEMENTOS BLANCOS');

let checkCount = 0;

function scanForWhiteElements() {
  checkCount++;
  console.log(`🔄 Scan #${checkCount} - ${new Date().toISOString()}`);
  
  // Obtener TODOS los elementos visibles
  const allElements = document.querySelectorAll('*');
  let found = 0;
  
  allElements.forEach((el, index) => {
    try {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      
      // Solo elementos que ocupan espacio visible
      if (rect.width > 5 && rect.height > 5) {
        const bg = styles.backgroundColor;
        const color = styles.color;
        
        // Detectar blanco en background
        if (bg === 'rgb(255, 255, 255)' || bg === 'white' || bg === 'rgba(255, 255, 255, 1)') {
          found++;
          console.log(`⚪ FONDO BLANCO #${found}:`, {
            tag: el.tagName,
            class: el.className || '',
            id: el.id || '',
            text: el.textContent?.substring(0, 20) || '',
            pos: `${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}x${Math.round(rect.height)}`,
            bg: bg,
            opacity: styles.opacity,
            zIndex: styles.zIndex
          });
          
          // Marcar con borde rojo por 1 segundo
          el.style.border = '3px solid red';
          setTimeout(() => el.style.border = '', 1000);
        }
        
        // Detectar texto blanco (puede ser placeholder)
        if (color === 'rgb(255, 255, 255)' || color === 'white') {
          // Solo reportar si tiene texto visible
          if (el.textContent && el.textContent.trim().length > 0) {
            found++;
            console.log(`⚪ TEXTO BLANCO #${found}:`, {
              tag: el.tagName,
              class: el.className || '',
              text: el.textContent.substring(0, 30),
              pos: `${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}x${Math.round(rect.height)}`,
              color: color
            });
            
            el.style.outline = '2px solid blue';
            setTimeout(() => el.style.outline = '', 1000);
          }
        }
      }
    } catch (e) {
      // Ignorar errores de elementos que no se pueden inspeccionar
    }
  });
  
  if (found === 0) {
    console.log('✅ No se encontraron elementos blancos en este scan');
  }
}

// Ejecutar inmediatamente y luego cada 100ms por 8 segundos
scanForWhiteElements();

const interval = setInterval(() => {
  scanForWhiteElements();
}, 100);

// Detener después de 8 segundos
setTimeout(() => {
  clearInterval(interval);
  console.log('🏁 Detección completada');
}, 8000);