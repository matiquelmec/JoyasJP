'use client'

import { Bell, Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AdminHeader() {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-gradient-to-r from-background via-card to-background px-4 shadow-lg backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="lg:hidden hover:bg-primary/5 hover:text-primary transition-colors"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Page title or breadcrumb could go here */}
      <div className="flex flex-1 items-center">
        <div className="block">
          <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <span className="hidden sm:inline">Panel de Administración</span>
            <span className="sm:hidden">Admin</span>
          </h2>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-x-3 lg:gap-x-4">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative hover:bg-primary/5 hover:text-primary transition-all duration-200 hover:scale-105"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Ver notificaciones</span>
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-primary/5 hover:text-primary transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent p-[1px]">
                  <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </div>
                <span className="hidden sm:block text-sm font-medium">Admin</span>
              </div>
              <span className="sr-only">Abrir menú de usuario</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border bg-card shadow-xl">
            <DropdownMenuLabel className="text-primary">Administrador</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary">
              <Bell className="mr-2 h-4 w-4" />
              <span>Notificaciones</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => {
                window.location.href = '/'
              }}
              className="hover:bg-destructive/5 hover:text-destructive focus:bg-destructive/5 focus:text-destructive"
            >
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}