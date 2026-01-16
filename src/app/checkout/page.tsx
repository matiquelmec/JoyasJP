'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
// Removed Vercel analytics tracking
import { ArrowLeft, Loader2, ShoppingBag, User, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'

import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { useSiteConfig } from '@/hooks/use-site-config'

interface CheckoutFormData {
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  region: string
}

const chileanRegions = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana de Santiago',
  'O\'Higgins',
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes y de la Antártica Chilena'
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  // const { toast } = useToast()
  const { config } = useSiteConfig()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: ''
  })

  // ⚡ Memoize expensive calculations
  const cartStats = useMemo(() => ({
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }), [items])
  // Shipping will be paid separately - not included in online payment
  const total = cartStats.subtotal

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { customerName, email, phone, address, city, region } = formData

    if (!customerName.trim()) {
      toast.error('Campo requerido', {
        description: 'Por favor ingresa tu nombre completo'
      })
      return false
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Email inválido', {
        description: 'Por favor ingresa un email válido'
      })
      return false
    }

    if (!phone.trim()) {
      toast.error('Campo requerido', {
        description: 'Por favor ingresa tu número de teléfono'
      })
      return false
    }

    if (!address.trim()) {
      toast.error('Campo requerido', {
        description: 'Por favor ingresa tu dirección completa'
      })
      return false
    }

    if (!city.trim()) {
      toast.error('Campo requerido', {
        description: 'Por favor ingresa tu ciudad'
      })
      return false
    }

    if (!region) {
      toast.error('Error', {
        description: 'Hubo un problema al procesar tu pedido. Por favor intenta nuevamente.'
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (items.length === 0) return

    setIsLoading(true)

    try {
      // Analytics tracking removed (Vercel -> Netlify migration)

      // Preparar datos para crear la orden
      // Proceder con el pago en MercadoPago y guardar orden
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items,
          customerInfo: {
            name: formData.customerName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            commune: formData.region,
            shippingCost: 0
          }
        })
      })

      const checkoutData = await checkoutResponse.json()

      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || 'Error en la comunicación con el servidor.')
      }

      if (checkoutData.checkoutUrl) {
        // Redirigir a MercadoPago
        window.location.href = checkoutData.checkoutUrl
      } else {
        throw new Error('No se recibió la URL de pago.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
      toast.error('Error al Procesar la Orden', {
        description: errorMessage,
      })
      // console.error('Error al procesar checkout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Redirect si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-6">
          Agrega algunos productos antes de proceder al checkout
        </p>
        <Button asChild>
          <Link href="/productos">Ir a la Tienda</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/productos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">
              Completa tu información para finalizar la compra
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario de datos */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Nombre Completo *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Ej: María González Silva"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="maria@ejemplo.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+56 9 1234 5678"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Dirección Completa *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Av. Providencia 1234, Depto 56"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Santiago"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="region">Región *</Label>
                    <select
                      id="region"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Selecciona región</option>
                      {chileanRegions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen del pedido */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-lg bg-black"
                      />
                      <div className="flex-grow">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="text-sm font-medium">
                          ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cartStats.totalItems} productos)</span>
                      <span>${cartStats.subtotal.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Envío</span>
                      <span className="text-orange-600">Por pagar</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      El envío se coordina y paga por separado
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Proceder al Pago
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Al continuar, serás redirigido a MercadoPago para completar tu pago de forma segura.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}