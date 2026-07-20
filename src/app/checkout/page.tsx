'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Loader2, ShoppingBag, User, Mail, Phone, MapPin, Tag as TagIcon, CheckCircle2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

interface CheckoutFormData {
  customerName: string
  email: string
  phone: string
  instagram?: string
  address: string
  department?: string
  city: string
  region: string
  rut: string
  shippingMethod: 'starken' | 'metro'
}

interface AppliedCoupon {
  code: string
  discount_type: string
  discount_value: number
  discount_amount: number
  affiliate_name: string | null
}

function formatRUT(rut: string): string {
  let value = rut.replace(/\./g, '').replace(/-/g, '');
  if (value.length > 1) {
    const dv = value.slice(-1);
    let rutBody = value.slice(0, -1);
    rutBody = rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${rutBody}-${dv}`;
  }
  return value;
}

function validateRUT(rut: string): boolean {
  if (!rut || rut.trim().length < 8) return false;
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();

  if (!/^\d+$/.test(body)) return false;

  let suma = 0;
  let multiplo = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    suma += parseInt(body[i]) * multiplo;
    if (multiplo < 7) multiplo += 1;
    else multiplo = 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dv === dvCalculado;
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
  const { items } = useCart()
  const { config } = useSiteConfig()
  const [isLoading, setIsLoading] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    email: '',
    phone: '',
    instagram: '',
    address: '',
    department: '',
    city: '',
    region: '',
    rut: '',
    shippingMethod: 'starken'
  })

  // ⚡ Memoize expensive calculations
  const cartStats = useMemo(() => ({
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }), [items])

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setIsCouponLoading(true)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponInput.trim(), 
          cart_amount: cartStats.subtotal 
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Código no válido')
      }

      setAppliedCoupon(data)
      toast.success('¡Cupón aplicado!', {
        description: data.affiliate_name 
          ? `Descuento del afiliado ${data.affiliate_name} activado.`
          : `Se aplicó el descuento correctamente.`
      })
    } catch (err: any) {
      toast.error('Cupón inválido', {
        description: err.message || 'Código no válido o compra mínima no alcanzada.'
      })
      setAppliedCoupon(null)
    } finally {
      setIsCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    toast.info('Cupón removido')
  }

  // Descuento final en dinero
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0
    return appliedCoupon.discount_amount
  }, [appliedCoupon])

  // Total final con descuento aplicado
  const finalTotal = useMemo(() => {
    return Math.max(0, cartStats.subtotal - discountAmount)
  }, [cartStats.subtotal, discountAmount])

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => {
      const nextData = { ...prev, [field]: value }
      if (field === 'region' && value !== 'Metropolitana de Santiago' && prev.shippingMethod === 'metro') {
        nextData.shippingMethod = 'starken'
      }
      return nextData
    })
  }

  const validateForm = () => {
    const { customerName, email, phone, address, city, region } = formData

    if (!customerName.trim()) {
      toast.error('Campo requerido', { description: 'Por favor ingresa tu nombre completo' })
      return false
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Email inválido', { description: 'Por favor ingresa un email válido' })
      return false
    }

    if (!phone.trim()) {
      toast.error('Campo requerido', { description: 'Por favor ingresa tu número de teléfono' })
      return false
    }

    const isMetro = formData.shippingMethod === 'metro'

    if (!address.trim() && !isMetro) {
      toast.error('Campo requerido', { description: 'Por favor ingresa tu dirección completa (calle y número)' })
      return false
    }

    if (!city.trim() && !isMetro) {
      toast.error('Campo requerido', { description: 'Por favor ingresa tu ciudad' })
      return false
    }

    if (!region) {
      toast.error('Error', { description: 'Hubo un problema al procesar tu pedido. Por favor intenta nuevamente.' })
      return false
    }

    if (!validateRUT(formData.rut)) {
      toast.error('RUT inválido', { description: 'Por favor ingresa un RUT válido (ej: 12.345.678-9)' })
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
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items,
          couponCode: appliedCoupon?.code || null,
          customerInfo: {
            name: formData.customerName,
            email: formData.email,
            phone: formData.phone,
            instagram: formData.instagram,
            address: formData.address,
            department: formData.department,
            city: formData.city,
            commune: formData.region,
            rut: formData.rut,
            shippingCost: 0,
            shippingMethod: formData.shippingMethod
          }
        })
      })

      const checkoutData = await checkoutResponse.json()

      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || 'Error en la comunicación con el servidor.')
      }

      if (checkoutData.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl
      } else {
        throw new Error('No se recibió la URL de pago.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
      toast.error('Error al Procesar la Orden', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver a la vitrina
          </Link>
          <h1 className="text-3xl font-bold font-headline uppercase tracking-tighter">Confirmar tu Pedido</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario de información de despacho */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Datos de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nombre Completo *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT *</Label>
                    <Input
                      id="rut"
                      value={formData.rut}
                      onChange={(e) => handleInputChange('rut', formatRUT(e.target.value))}
                      placeholder="Ej: 12.345.678-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Ej: juan@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp / Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Ej: +56912345678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Usuario de Instagram (Opcional)</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    placeholder="Ej: @tu_usuario"
                  />
                  <p className="text-[10px] text-muted-foreground">Usa esto para facilitarnos contactarte sobre tu pedido.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Dirección de Despacho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Región *</Label>
                    <select
                      id="region"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Selecciona tu región</option>
                      {chileanRegions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Ej: Providencia, Viña del Mar"
                      disabled={formData.shippingMethod === 'metro'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Calle y Número *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Ej: Av. Providencia 1234"
                      disabled={formData.shippingMethod === 'metro'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Depto / Casa</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Ej: Depto 402"
                      disabled={formData.shippingMethod === 'metro'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" /> Método de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                      formData.shippingMethod === 'starken' ? "border-primary bg-primary/5" : "border-muted"
                    )}
                    onClick={() => handleInputChange('shippingMethod', 'starken')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        formData.shippingMethod === 'starken' ? "border-primary" : "border-muted-foreground"
                      )}>
                        {formData.shippingMethod === 'starken' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        {cartStats.subtotal >= 50000 ? (
                          <>
                            <p className="font-semibold text-sm text-green-600">Envío Gratis vía Starken</p>
                            <p className="text-xs text-muted-foreground">¡Ganaste envío gratis por compras sobre $50.000!</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-sm">Starken (Envío por Pagar)</p>
                            <p className="text-xs text-muted-foreground">Llega a tu domicilio o sucursal y pagas el envío al recibir</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                      formData.shippingMethod === 'metro' ? "border-primary bg-primary/5" : "border-muted",
                      formData.region !== 'Metropolitana de Santiago' ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    )}
                    onClick={() => {
                      if (formData.region === 'Metropolitana de Santiago') {
                        handleInputChange('shippingMethod', 'metro')
                      } else {
                        toast.info('Opción no disponible', {
                          description: 'La entrega en Metro solo está disponible para la Región Metropolitana.'
                        })
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        formData.shippingMethod === 'metro' ? "border-primary" : "border-muted-foreground"
                      )}>
                        {formData.shippingMethod === 'metro' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Entrega Gratis en Metro</p>
                        <p className="text-xs text-muted-foreground">Solo Los Leones, Quilín o Chile España (Coordinar por WhatsApp)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-5 space-y-6">
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
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="text-xs font-semibold">
                          ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  {/* Campo de Código de Descuento */}
                  <div className="space-y-2">
                    <Label htmlFor="coupon" className="text-xs font-bold uppercase tracking-wider text-slate-500">¿Tienes un cupón de descuento?</Label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-500/5 text-emerald-800 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold font-mono">{appliedCoupon.code}</span> aplicado
                            {appliedCoupon.affiliate_name && (
                              <p className="text-[10px] text-emerald-600">Afiliado: {appliedCoupon.affiliate_name}</p>
                            )}
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleRemoveCoupon}
                          className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2"
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <TagIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="coupon"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="CÓDIGO"
                            className="pl-9 h-9 text-xs uppercase"
                            disabled={isCouponLoading}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={isCouponLoading || !couponInput.trim()}
                          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-9 text-xs"
                        >
                          {isCouponLoading ? 'Aplicando...' : 'Aplicar'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cartStats.totalItems} productos)</span>
                      <span>${cartStats.subtotal.toLocaleString('es-CL')}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-emerald-600 font-bold">
                        <span>Descuento ({appliedCoupon.code})</span>
                        <span>-${discountAmount.toLocaleString('es-CL')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Envío a {formData.shippingMethod === 'metro' ? 'Metro' : 'Domicilio'}</span>
                      <span className={(formData.shippingMethod === 'metro' || cartStats.subtotal >= 50000) ? "text-green-600 font-bold" : "text-orange-600 font-medium"}>
                        {(formData.shippingMethod === 'metro' || cartStats.subtotal >= 50000) ? "¡Gratis!" : "Por pagar"}
                      </span>
                    </div>

                    <div className="text-[10px] text-muted-foreground">
                      {formData.shippingMethod === 'metro'
                        ? "Te contactaremos para coordinar en L.Leones, Quilín o Chile España."
                        : cartStats.subtotal >= 50000
                          ? "¡El costo de envío corre por nuestra cuenta!"
                          : "Paga tu envío directamente a Starken al recibir tu pedido."}
                    </div>

                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg text-zinc-900">
                      <span>Total</span>
                      <span>${finalTotal.toLocaleString('es-CL')}</span>
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
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
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