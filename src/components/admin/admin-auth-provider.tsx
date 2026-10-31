'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { useSiteConfig } from '@/hooks/use-site-config'
import Image from 'next/image'

interface AdminAuthContextType {
  token: string | null
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType>({ token: null, logout: async () => { } })

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { config } = useSiteConfig()

  useEffect(() => {
    // Verificar si la cookie de sesión HttpOnly es válida consultando un endpoint ligero
    async function verifySession() {
      try {
        const res = await fetch('/api/admin/products?limit=1')
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Ignorar error de red al salir
    }
    setIsAuthenticated(false)
    setPassword('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setError('Credenciales inválidas')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="absolute inset-0 bg-[url('/assets/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 ring-1 ring-gray-900/5">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24">
                <Image
                  src="/assets/logo.webp"
                  alt={`${config?.store_name || 'Joyas JP'} Logo`}
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Panel de Administración</CardTitle>
            <p className="text-muted-foreground mt-2">Acceso protegido mediante sesión encriptada</p>
          </CardHeader>
          <CardContent className="pb-10 px-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña Maestra"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-gray-50/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md animate-in fade-in-50 slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all">
                Ingresar al Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AdminAuthContext.Provider value={{ token: null, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}
