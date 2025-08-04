'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminAPI } from '@/lib/admin-api'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

export default function ConfigurationTestPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    setTests([])

    // Test 1: Fetch current configuration via admin API
    const test1: TestResult = {
      name: '1. Obtener configuración (Admin API)',
      status: 'pending',
      message: 'Obteniendo configuración...'
    }
    setTests([test1])

    try {
      const config = await adminAPI.getConfiguration()
      test1.status = 'success'
      test1.message = 'Configuración obtenida correctamente'
      test1.data = config
      setTests([{ ...test1 }])
    } catch (error) {
      test1.status = 'error'
      test1.message = `Error: ${error.message}`
      setTests([{ ...test1 }])
    }

    // Test 2: Update configuration
    const test2: TestResult = {
      name: '2. Actualizar configuración (Admin API)',
      status: 'pending',
      message: 'Actualizando free_shipping_from a 30000...'
    }
    setTests(prev => [...prev, test2])

    try {
      const currentConfig = await adminAPI.getConfiguration()
      const updatedConfig = await adminAPI.updateConfiguration({
        ...currentConfig,
        free_shipping_from: 30000
      })
      test2.status = 'success'
      test2.message = 'Configuración actualizada correctamente'
      test2.data = { free_shipping_from: updatedConfig.free_shipping_from }
      setTests(prev => [...prev.slice(0, -1), { ...test2 }])
    } catch (error) {
      test2.status = 'error'
      test2.message = `Error: ${error.message}`
      setTests(prev => [...prev.slice(0, -1), { ...test2 }])
    }

    // Test 3: Fetch public configuration
    const test3: TestResult = {
      name: '3. Obtener configuración pública',
      status: 'pending',
      message: 'Obteniendo configuración pública...'
    }
    setTests(prev => [...prev, test3])

    try {
      const response = await fetch('/api/configuration')
      const data = await response.json()
      test3.status = 'success'
      test3.message = 'Configuración pública obtenida'
      test3.data = data.configuration
      setTests(prev => [...prev.slice(0, -1), { ...test3 }])
    } catch (error) {
      test3.status = 'error'
      test3.message = `Error: ${error.message}`
      setTests(prev => [...prev.slice(0, -1), { ...test3 }])
    }

    // Test 4: Verify values match
    const test4: TestResult = {
      name: '4. Verificar sincronización',
      status: 'pending',
      message: 'Verificando que los valores coincidan...'
    }
    setTests(prev => [...prev, test4])

    try {
      const adminConfig = await adminAPI.getConfiguration()
      const response = await fetch('/api/configuration')
      const { configuration: publicConfig } = await response.json()
      
      const match = publicConfig.free_shipping_from === adminConfig.free_shipping_from
      
      test4.status = match ? 'success' : 'error'
      test4.message = match 
        ? 'Los valores coinciden correctamente' 
        : 'Los valores NO coinciden'
      test4.data = {
        admin: adminConfig.free_shipping_from,
        public: publicConfig.free_shipping_from
      }
      setTests(prev => [...prev.slice(0, -1), { ...test4 }])
    } catch (error) {
      test4.status = 'error'
      test4.message = `Error: ${error.message}`
      setTests(prev => [...prev.slice(0, -1), { ...test4 }])
    }

    setTesting(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Test de Configuración</h1>
        <p className="mt-2 text-muted-foreground">
          Verifica que el sistema de configuración esté funcionando correctamente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pruebas de Conectividad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={testing}>
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ejecutando pruebas...
              </>
            ) : (
              'Ejecutar Pruebas'
            )}
          </Button>

          {tests.length > 0 && (
            <div className="space-y-3 mt-6">
              {tests.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    {test.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {test.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    {test.status === 'pending' && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                    <h3 className="font-semibold">{test.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                  {test.data && (
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Abre la consola del navegador (F12) para ver los logs</p>
          <p>2. Ejecuta las pruebas para verificar la conectividad</p>
          <p>3. Revisa que todos los tests pasen (círculo verde)</p>
          <p>4. Si algún test falla, revisa los logs en la consola</p>
        </CardContent>
      </Card>
    </div>
  )
}