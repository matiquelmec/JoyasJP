// Debug script para capturar el rectángulo blanco en la parte superior central
console.log('🔍 INICIANDO DEBUG DEL RECTÁNGULO BLANCO');

// PASO 1: Capturar estado inicial antes de cualquier carga
console.log('📸 SNAPSHOT INICIAL:', {
  body: document.body ? 'EXISTS' : 'NULL',
  head: document.head ? 'EXISTS' : 'NULL',
  readyState: document.readyState,
  timestamp: Date.now()
});

// Monitor específico para la zona superior central del header
function monitorTopCenter() {
  const checkInterval = 10; // Check cada 10ms (más frecuente)
  let checkCount = 0;
  const maxChecks = 500; // 5 segundos total
  
  const interval = setInterval(() => {
    checkCount++;
    
    // NUEVO: Buscar CUALQUIER elemento blanco visible en TODA la página
    const allElements = document.querySelectorAll('*');
    let whiteElementsFound = 0;
    
    allElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      
      // Solo elementos visibles
      if (rect.width > 0 && rect.height > 0 && styles.opacity !== '0' && styles.visibility !== 'hidden') {
        // Detectar CUALQUIER cosa blanca
        const isWhite = 
          styles.backgroundColor === 'white' ||
          styles.backgroundColor === 'rgb(255, 255, 255)' ||
          styles.backgroundColor === 'rgba(255, 255, 255, 1)' ||
          styles.color === 'white' ||
          styles.color === 'rgb(255, 255, 255)' ||
          styles.borderColor === 'white' ||
          styles.borderColor === 'rgb(255, 255, 255)' ||
          element.tagName === 'IMG' && !element.src ||
          element.hasAttribute('placeholder') ||
          element.hasAttribute('data-placeholder') ||
          (element.className && element.className.includes && element.className.includes('placeholder'));
          
        if (isWhite) {
          whiteElementsFound++;
          console.log(`🎯 ELEMENTO BLANCO #${whiteElementsFound} (check ${checkCount}):`, {
            element: element,
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            src: element.src || 'N/A',
            textContent: element.textContent?.substring(0, 30) || '',
            position: {
              top: Math.round(rect.top),
              left: Math.round(rect.left),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            styles: {
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              borderColor: styles.borderColor,
              opacity: styles.opacity,
              visibility: styles.visibility,
              display: styles.display,
              position: styles.position,
              zIndex: styles.zIndex
            },
            attributes: Array.from(element.attributes || []).map(attr => `${attr.name}="${attr.value}"`).join(' '),
            parentElement: element.parentElement?.tagName || 'NULL'
          });
          
          // Marcar visualmente
          element.style.outline = '5px solid red';
          element.style.outlineOffset = '2px';
          element.style.boxShadow = '0 0 10px red';
          
          setTimeout(() => {
            if (element.style) {
              element.style.outline = '';
              element.style.boxShadow = '';
            }
          }, 2000);
        }
      }
    });
    
    if (whiteElementsFound > 0) {
      console.log(`📊 TOTAL ELEMENTOS BLANCOS EN CHECK ${checkCount}: ${whiteElementsFound}`);
    }

    // Buscar elementos en la zona superior central del header (código original)
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    if (header) {
      // Obtener todos los elementos en el header
      const headerElements = header.querySelectorAll('*');
      
      headerElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        
        // Si está en la zona superior central (aprox 40% central del ancho)
        const isInTopCenter = rect.top >= 0 && rect.top <= 200 && 
                             rect.left > window.innerWidth * 0.3 && 
                             rect.right < window.innerWidth * 0.7;
        
        // Detectar elementos blancos o con fondo blanco
        const hasWhiteBackground = 
          styles.backgroundColor.includes('255, 255, 255') ||
          styles.backgroundColor === 'white' ||
          styles.backgroundColor === 'rgb(255, 255, 255)' ||
          styles.backgroundColor === 'rgba(255, 255, 255';
        
        const hasWhiteColor = 
          styles.color.includes('255, 255, 255') ||
          styles.color === 'white' ||
          styles.color === 'rgb(255, 255, 255)';
          
        const hasWhiteBorder = 
          styles.borderColor.includes('255, 255, 255') ||
          styles.borderColor === 'white';
          
        if (isInTopCenter && (hasWhiteBackground || hasWhiteColor || hasWhiteBorder)) {
          console.log(`🎯 RECTÁNGULO BLANCO DETECTADO (check ${checkCount}):`, {
            element: element,
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            textContent: element.textContent?.substring(0, 50),
            position: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            },
            styles: {
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              borderColor: styles.borderColor,
              display: styles.display,
              visibility: styles.visibility,
              opacity: styles.opacity,
              position: styles.position,
              zIndex: styles.zIndex
            },
            attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`),
            innerHTML: element.innerHTML?.substring(0, 100)
          });
          
          // Marcar el elemento para identificación visual
          element.style.outline = '3px solid red';
          element.style.outlineOffset = '2px';
          
          setTimeout(() => {
            if (element.style) element.style.outline = '';
          }, 1000);
        }
      });
    }
    
    // También revisar elementos fuera del header que puedan estar superpuestos
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element === header) return; // Ya lo revisamos
      
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      
      // Si está en la zona superior central
      const isInTopCenter = rect.top >= 0 && rect.top <= 200 && 
                           rect.left > window.innerWidth * 0.3 && 
                           rect.right < window.innerWidth * 0.7 &&
                           rect.width > 10 && rect.height > 10; // Mínimo tamaño
      
      const hasWhiteBackground = 
        styles.backgroundColor.includes('255, 255, 255') ||
        styles.backgroundColor === 'white' ||
        styles.backgroundColor === 'rgb(255, 255, 255)';
        
      if (isInTopCenter && hasWhiteBackground && styles.opacity !== '0') {
        console.log(`🎯 ELEMENTO BLANCO FUERA DEL HEADER (check ${checkCount}):`, {
          element: element,
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          styles: {
            backgroundColor: styles.backgroundColor,
            opacity: styles.opacity,
            position: styles.position,
            zIndex: styles.zIndex
          }
        });
        
        element.style.outline = '3px solid blue';
        setTimeout(() => {
          if (element.style) element.style.outline = '';
        }, 1000);
      }
    });
    
    if (checkCount >= maxChecks) {
      clearInterval(interval);
      console.log('🔍 Debug terminado después de 5 segundos');
    }
  }, checkInterval);
}

// Iniciar cuando esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', monitorTopCenter);
} else {
  monitorTopCenter();
}

// También monitorear cambios en el DOM
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.tagName) {
        const rect = node.getBoundingClientRect();
        const styles = window.getComputedStyle(node);
        
        const isInTopCenter = rect.top >= 0 && rect.top <= 200 && 
                             rect.left > window.innerWidth * 0.3 && 
                             rect.right < window.innerWidth * 0.7;
        
        if (isInTopCenter && styles.backgroundColor.includes('255, 255, 255')) {
          console.log('🆕 NUEVO ELEMENTO BLANCO AÑADIDO:', {
            element: node,
            tagName: node.tagName,
            className: node.className,
            styles: {
              backgroundColor: styles.backgroundColor,
              position: styles.position
            }
          });
          
          node.style.outline = '3px solid green';
          setTimeout(() => {
            if (node.style) node.style.outline = '';
          }, 1000);
        }
      }
    });
  });
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}

console.log('🔍 Debug script cargado. Recarga la página para capturar el rectángulo blanco.');