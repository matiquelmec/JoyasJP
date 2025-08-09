// Debug script para capturar el rectángulo blanco en la parte superior central
console.log('🔍 INICIANDO DEBUG DEL RECTÁNGULO BLANCO');

// Monitor específico para la zona superior central del header
function monitorTopCenter() {
  const checkInterval = 50; // Check cada 50ms
  let checkCount = 0;
  const maxChecks = 100; // 5 segundos total
  
  const interval = setInterval(() => {
    checkCount++;
    
    // Buscar elementos en la zona superior central
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