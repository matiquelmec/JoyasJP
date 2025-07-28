"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingBag, Truck, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { logUserAction, logError } from '@/lib/logger';

interface ShippingData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  comuna: string;
  postalCode: string;
  notes: string;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [shippingData, setShippingData] = useState<ShippingData>({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    comuna: '',
    postalCode: '',
    notes: ''
  });

  // Redirect si no hay productos en el carrito
  useEffect(() => {
    if (items.length === 0) {
      router.push('/productos');
    }
  }, [items, router]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 40000 ? 0 : 3000; // Envío gratis a partir de $40.000
  const total = subtotal + shipping;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!shippingData.customerName.trim()) {
      newErrors.customerName = 'El nombre es requerido';
    }

    if (!shippingData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(shippingData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!shippingData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[+]?[0-9\s\-()]{8,}$/.test(shippingData.phone)) {
      newErrors.phone = 'Teléfono inválido (mínimo 8 dígitos)';
    }

    if (!shippingData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!shippingData.comuna.trim()) {
      newErrors.comuna = 'La comuna es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ShippingData, value: string) => {
    setShippingData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    logUserAction('checkout_proceed_to_payment', {
      itemCount: items.length,
      total,
      comuna: shippingData.comuna
    });

    try {
      // Preparar datos para la API de checkout
      const orderData = {
        customerName: shippingData.customerName,
        shippingAddress: `${shippingData.address}, ${shippingData.comuna}${shippingData.postalCode ? `, ${shippingData.postalCode}` : ''}`,
        contactEmail: shippingData.email,
        phone: shippingData.phone,
        notes: shippingData.notes,
        items: items,
        total: total
      };

      // Crear orden en la base de datos
      const createOrderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: orderData.customerName,
          shipping_address: `${orderData.shippingAddress}\\nTeléfono: ${orderData.phone}${orderData.notes ? `\\nNotas: ${orderData.notes}` : ''}`,
          contact_email: orderData.contactEmail,
          ordered_products: items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.error || 'Error al crear la orden');
      }

      const orderResult = await createOrderResponse.json();
      
      // Proceder con MercadoPago
      const paymentResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      const paymentResult = await paymentResponse.json();

      if (paymentResult.checkoutUrl) {
        logUserAction('checkout_redirect_to_payment', {
          orderId: orderResult.order_id,
          paymentUrl: paymentResult.checkoutUrl
        });
        
        // Limpiar carrito antes de redirigir
        clearCart();
        
        // Redirigir a MercadoPago
        window.location.href = paymentResult.checkoutUrl;
      } else {
        throw new Error('No se recibió la URL de pago');
      }

    } catch (error) {
      logError(error as Error, {
        action: 'checkout_process',
        itemCount: items.length,
        total
      });

      toast({
        title: "Error al procesar la compra",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return null; // El useEffect se encargará de la redirección
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/productos" className="flex items-center gap-2 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Continuar comprando
          </Link>
          <span>/</span>
          <span className="text-foreground">Checkout</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Formulario de datos de envío */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Datos de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Nombre completo */}
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre completo *</Label>
                  <Input
                    id="customerName"
                    value={shippingData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Ej: María González"
                    className={errors.customerName ? 'border-red-500' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-500">{errors.customerName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="tu@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={shippingData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección completa *</Label>
                  <Input
                    id="address"
                    value={shippingData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Av. Providencia 123, Depto 45"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Comuna */}
                  <div className="space-y-2">
                    <Label htmlFor="comuna">Comuna *</Label>
                    <Input
                      id="comuna"
                      value={shippingData.comuna}
                      onChange={(e) => handleInputChange('comuna', e.target.value)}
                      placeholder="Santiago"
                      className={errors.comuna ? 'border-red-500' : ''}
                    />
                    {errors.comuna && (
                      <p className="text-sm text-red-500">{errors.comuna}</p>
                    )}
                  </div>

                  {/* Código postal */}
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código postal</Label>
                    <Input
                      id="postalCode"
                      value={shippingData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="7500000"
                    />
                  </div>
                </div>

                {/* Notas adicionales */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    value={shippingData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Ej: Dejar con el portero, timbre azul..."
                    rows={3}
                  />
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Resumen de la orden */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Resumen de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Productos */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Image
                        src={item.imageUrl}
                        alt={`${item.name} - Miniatura en checkout`}
                        width={60}
                        height={60}
                        sizes="60px"
                        loading="lazy"
                        className="rounded-md bg-muted object-cover"
                      />
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toLocaleString('es-CL')}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Cálculos */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">Gratis</span>
                      ) : (
                        `$${shipping.toLocaleString('es-CL')}`
                      )}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-sm text-green-600">
                      ¡Envío gratis por compra superior a $40.000!
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-CL')}</span>
                </div>

                {/* Información de envío */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📦 <strong>Envíos los viernes</strong><br />
                    🚚 Tiempo de entrega: 1-3 días hábiles
                  </p>
                </div>

                {/* Botón de pago */}
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleProceedToPayment}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceder al Pago
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Serás redirigido a MercadoPago para completar el pago de forma segura
                </p>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}