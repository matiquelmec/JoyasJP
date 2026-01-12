'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function DatabaseSetup() {
  const [isSetupRunning, setIsSetupRunning] = useState(false)
  const [setupStatus, setSetupStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const runDatabaseSetup = async () => {
    setIsSetupRunning(true)
    setSetupStatus('idle')

    try {
      const response = await fetch('/api/admin/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer joyasjp2024'
        }
      })

      const result = await response.json()

      if (response.ok) {
        setSetupStatus('success')
        toast({
          title: 'Base de datos configurada',
          description: result.message,
        })
      } else {
        setSetupStatus('error')
        if (result.instructions) {
          toast({
            title: 'Configuración manual requerida',
            description: 'Ve la consola para instrucciones detalladas.',
            variant: 'destructive'
          })
          // Manual setup instructions available in result
        } else {
          toast({
            title: 'Error en configuración',
            description: result.error || 'Error desconocido',
            variant: 'destructive'
          })
        }
      }
    } catch (error) {
      setSetupStatus('error')
    // console.error('Setup error:', error)
      toast({
        title: 'Error',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive'
      })
    } finally {
      setIsSetupRunning(false)
    }
  }

  const getStatusIcon = () => {
    switch (setupStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Database className="w-5 h-5 text-blue-600" />
    }
  }

  const getStatusMessage = () => {
    switch (setupStatus) {
      case 'success':
        return 'Base de datos configurada correctamente'
      case 'error':
        return 'Error en la configuración - revisar consola'
      default:
        return 'Configurar funciones avanzadas de eliminación'
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración de Base de Datos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">{getStatusMessage()}</p>
              <p className="text-sm text-muted-foreground">
                Agrega la columna 'deleted_at' para eliminación avanzada con restauración
              </p>
            </div>
          </div>
          
          <Button 
            onClick={runDatabaseSetup}
            disabled={isSetupRunning || setupStatus === 'success'}
            variant={setupStatus === 'success' ? 'outline' : 'default'}
          >
            {isSetupRunning ? 'Configurando...' : 
             setupStatus === 'success' ? 'Configurado' : 'Configurar DB'}
          </Button>
        </div>
        
        {setupStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>Configuración manual:</strong> Ve a tu dashboard de Supabase → Tabla 'products' → 
              Agregar columna 'deleted_at' tipo 'timestamptz' (nullable)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}