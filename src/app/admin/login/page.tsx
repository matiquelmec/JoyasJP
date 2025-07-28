"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, checkSession } = useAdminAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verificar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && checkSession()) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, checkSession, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa email y contraseña",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Llamando función de login...', { email: email.trim() });
      const success = await login(email.trim(), password);
      console.log('📋 Resultado del login:', { success });
      
      if (success) {
        console.log('✅ Login exitoso, redirigiendo...');
        toast({
          title: "Acceso autorizado",
          description: "Bienvenido al panel de administración",
          variant: "default"
        });
        
        // Mostrar botón de acceso manual después del login exitoso
        console.log('✅ Login exitoso - mostrar acceso manual');
        
        // Crear y mostrar botón de acceso manual
        setTimeout(() => {
          const loginContainer = document.querySelector('.min-h-screen');
          if (loginContainer) {
            const successDiv = document.createElement('div');
            successDiv.innerHTML = `
              <div style="
                position: fixed; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%); 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
                text-align: center; 
                z-index: 9999;
                border: 2px solid #22c55e;
              ">
                <h2 style="color: #22c55e; margin-bottom: 20px;">✅ Login Exitoso</h2>
                <p style="margin-bottom: 20px;">Haz clic para acceder al panel:</p>
                <a href="/admin/test" style="
                  background: #22c55e; 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  font-weight: bold;
                  display: inline-block;
                ">🚀 Ir al Panel Admin</a>
              </div>
            `;
            document.body.appendChild(successDiv);
          }
        }, 1000);
      } else {
        console.log('❌ Login falló');
        toast({
          title: "Acceso denegado",
          description: "Credenciales incorrectas",
          variant: "destructive"
        });
        
        // Limpiar contraseña por seguridad
        setPassword('');
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "Intenta nuevamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo y título */}
        <div className="text-center space-y-4">
          <Image
            src="/assets/logo.webp"
            alt="Joyas JP"
            width={120}
            height={120}
            className="mx-auto"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Joyas JP</p>
          </div>
        </div>

        {/* Formulario de login */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Acceso Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@joyasjp.cl"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Botón de acceso */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Acceder al Panel
                  </>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* Información de seguridad */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>🔒 Acceso restringido a administradores</p>
          <p>⏰ Sesión válida por 8 horas</p>
        </div>

        {/* Credenciales de desarrollo (remover en producción) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <p className="text-sm text-yellow-800 text-center">
                <strong>Demo:</strong> admin@joyasjp.cl / JoyasJP2024!
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}