'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import type React from 'react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you could send to Sentry, LogRocket, etc.
    // console.error('Production error:', { error, errorInfo })
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>¡Algo salió mal!</AlertTitle>
              <AlertDescription className="mt-2">
                Lo sentimos, ocurrió un error inesperado. Por favor, intenta
                recargar la página.
              </AlertDescription>
            </Alert>

            <div className="mt-4 space-y-2">
              <Button
                onClick={this.handleReset}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar nuevamente
              </Button>

              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                variant="default"
              >
                Recargar página
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-gray-100 rounded-md">
                <summary className="cursor-pointer font-medium">
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar con componentes funcionales
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Error boundary específico para componentes de tienda
export function ShopErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-[300px] p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error en la tienda</h3>
            <p className="text-gray-600 mb-4">
              No pudimos cargar algunos productos. Por favor, intenta
              nuevamente.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log specific shop errors
    // console.error('Shop component error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Error boundary para el panel administrativo
export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Error en el panel administrativo
            </h3>
            <p className="text-gray-600 mb-4">
              Ocurrió un error en el sistema administrativo. Por favor, recarga
              la página o contacta al soporte técnico.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar panel
              </Button>
              <Button
                onClick={() => (window.location.href = '/admin')}
                variant="outline"
                className="w-full"
              >
                Volver al dashboard
              </Button>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log admin errors with higher priority
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
