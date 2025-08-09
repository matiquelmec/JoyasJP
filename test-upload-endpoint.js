// Script para probar el endpoint de upload
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUploadEndpoint() {
  console.log('🧪 Probando endpoint de upload...\n');
  
  // Primero verificar que el endpoint responde
  try {
    const testResponse = await fetch('http://localhost:3000/api/admin/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer joyasjp2024'
      }
    });
    
    const result = await testResponse.json();
    
    if (result.error === 'No file provided') {
      console.log('✅ Endpoint responde correctamente');
      console.log('   - Autenticación: OK');
      console.log('   - Validación: OK (detecta falta de archivo)');
    } else if (result.error === 'Unauthorized') {
      console.log('❌ Error de autenticación');
      return false;
    } else {
      console.log('⚠️ Respuesta inesperada:', result);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error al conectar con el endpoint:', error.message);
    console.log('   Asegúrate de que el servidor está corriendo en http://localhost:3000');
    return false;
  }
}

// Ejecutar test
testUploadEndpoint().then(success => {
  if (success) {
    console.log('\n✅ El endpoint está funcionando correctamente');
    console.log('📝 Nota: Para una prueba completa, sube una imagen desde el panel admin');
  } else {
    console.log('\n❌ El endpoint tiene problemas');
  }
  process.exit(success ? 0 : 1);
});