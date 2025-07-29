"use client";

import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger, logUserAction } from '@/lib/logger';

interface AdminUser {
  email: string;
  name: string;
  loginTime: number;
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => boolean;
}

// Configuración de admin (en producción esto estaría en variables de entorno)
const ADMIN_CREDENTIALS = {
  email: 'admin@joyasjp.cl',
  password: 'JoyasJP2024!', // Cambiar por una contraseña segura
  name: 'Administrador JoyasJP'
};

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 horas en milisegundos

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string): Promise<boolean> => {
        try {
          // Simular delay de autenticación
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Validar credenciales
          if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            const user: AdminUser = {
              email: ADMIN_CREDENTIALS.email,
              name: ADMIN_CREDENTIALS.name,
              loginTime: Date.now()
            };

            set({ 
              user, 
              isAuthenticated: true 
            });

            logUserAction('admin_login_success', { email });
            logger.info('Admin login successful', { email });
            
            return true;
          } else {
            logUserAction('admin_login_failed', { email, reason: 'invalid_credentials' });
            logger.warn('Admin login failed - invalid credentials', { email });
            return false;
          }
        } catch (error) {
          logger.error('Admin login error', { email }, error as Error);
          return false;
        }
      },

      logout: () => {
        const { user } = get();
        if (user) {
          logUserAction('admin_logout', { email: user.email });
          logger.info('Admin logout', { email: user.email });
        }

        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },

      checkSession: (): boolean => {
        const { user, isAuthenticated } = get();
        
        if (!isAuthenticated || !user) {
          return false;
        }

        // Verificar si la sesión ha expirado
        const now = Date.now();
        const sessionAge = now - user.loginTime;
        
        if (sessionAge > SESSION_DURATION) {
          logger.info('Admin session expired', { 
            email: user.email, 
            sessionAge: Math.round(sessionAge / 1000 / 60) + ' minutes' 
          });
          
          // Sesión expirada, hacer logout automático
          get().logout();
          return false;
        }

        return true;
      }
    }),
    {
      name: 'admin-auth-storage',
      // Solo persistir datos esenciales
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Hook personalizado para verificar autenticación en componentes
export const useRequireAuth = () => {
  const { isAuthenticated, checkSession, logout } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión al cargar el componente
    const isValidSession = checkSession();
    
    if (!isValidSession && isAuthenticated) {
      // Si la sesión no es válida pero el estado dice que está autenticado, hacer logout
      logout();
    }

    setIsLoading(false);
  }, [checkSession, logout, isAuthenticated]);

  return {
    isAuthenticated: isAuthenticated && !isLoading,
    isLoading
  };
};

// Hook para obtener información del usuario admin
export const useAdminUser = () => {
  const { user, isAuthenticated, checkSession } = useAdminAuth();
  
  useEffect(() => {
    // Solo verificar sesión si estamos en rutas admin
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
      return;
    }
    
    // Verificar sesión periódicamente (cada 5 minutos) SOLO en admin
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkSession();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkSession]);

  return {
    user: isAuthenticated ? user : null,
    isAuthenticated
  };
};