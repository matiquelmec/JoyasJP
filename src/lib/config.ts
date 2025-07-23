import { NavLink } from './types';

export const siteConfig = {
  name: "Joyas JP",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description: "Alta joyería para la escena urbana. Descubre piezas únicas que definen tu estilo con materiales premium y diseños exclusivos.",
  author: "Joyas JP",
  keywords: [
    "joyas urbanas Chile",
    "joyería premium",
    "diseños únicos",
    "estilo urbano",
    "alta joyería",
    "accesorios premium",
    "joyas artesanales",
    "Santiago joyería"
  ],
  links: {
    instagram: "https://instagram.com/joyasjp",
    tiktok: "https://tiktok.com/@joyasjp",
    whatsapp: "https://wa.me/56912345678",
    email: "contacto@joyasjp.cl",
    phone: "+56912345678",
  },
  business: {
    name: "Joyas JP",
    legalName: "Joyas JP SpA",
    rut: "12.345.678-9",
    address: {
      street: "Av. Providencia 1234",
      city: "Santiago",
      region: "Región Metropolitana",
      country: "Chile",
      postalCode: "7500000"
    },
    contact: {
      email: "contacto@joyasjp.cl",
      phone: "+56912345678",
      whatsapp: "+56912345678",
      hours: {
        weekdays: "09:00 - 18:00",
        saturday: "10:00 - 16:00",
        sunday: "Cerrado"
      }
    }
  },
  features: {
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableNewsletterSignup: true,
    enableLiveChat: false,
    enableReviews: true,
    enableWishlist: true,
    enableCompareProducts: false,
    enableGiftCards: false,
    maxCartItems: 99,
    minOrderAmount: 1000,
    enableGuestCheckout: true,
  },
  ui: {
    theme: 'dark',
    primaryColor: '#D4AF37',
    accentColor: '#1A1A1A',
    enableAnimations: true,
    showScrollToTop: true,
    enableSmoothScrolling: true,
  },
  seo: {
    defaultTitle: "Joyas JP | Alta Joyería para la Escena Urbana",
    titleTemplate: "%s | Joyas JP",
    defaultDescription: "Descubre la exclusiva colección de Joyas JP: alta joyería urbana con diseños únicos, materiales premium y estilo auténtico.",
    siteVerification: {
      google: "",
      bing: "",
    },
    openGraph: {
      type: 'website',
      locale: 'es_CL',
      siteName: 'Joyas JP',
    },
  },
  ecommerce: {
    currency: 'CLP',
    currencySymbol: '$',
    taxRate: 0.19,
    shippingZones: ['Santiago', 'Regiones'],
    paymentMethods: ['MercadoPago', 'Transferencia', 'WebPay'],
    returnPolicy: {
      days: 30,
      conditions: "Producto en estado original con etiquetas"
    }
  }
} as const;

export const navLinks: NavLink[] = [
  {
    href: '/shop',
    label: 'Catálogo'
  },
  {
    href: '/services',
    label: 'Servicios'
  },
  {
    href: '/about',
    label: 'Nosotros'
  },
  {
    href: '/contact',
    label: 'Contacto'
  },
];

export const productConfig = {
  categories: [
    {
      id: 'cadenas',
      name: 'Cadenas',
      description: 'Cadenas de diferentes estilos y materiales'
    },
    {
      id: 'dijes',
      name: 'Dijes',
      description: 'Dijes únicos para personalizar tu look'
    },
    {
      id: 'pulseras',
      name: 'Pulseras',
      description: 'Pulseras elegantes y modernas'
    },
    {
      id: 'aros',
      name: 'Aros',
      description: 'Aros de diferentes tamaños y estilos'
    },
  ],
  materials: [
    'Plata 925',
    'Oro 18k',
    'Acero Inoxidable',
    'Titanio',
    'Plata Bañada en Oro',
  ],
  colors: [
    'Dorado',
    'Plateado',
    'Negro',
    'Rose Gold',
    'Multicolor',
  ],
  priceRanges: [
    { label: 'Hasta $25.000', min: 0, max: 25000 },
    { label: '$25.000 - $50.000', min: 25000, max: 50000 },
    { label: '$50.000 - $100.000', min: 50000, max: 100000 },
    { label: 'Más de $100.000', min: 100000, max: Infinity },
  ]
} as const;

export const messages = {
  cart: {
    empty: "Tu carrito está vacío",
    emptyDescription: "Explora nuestra increíble colección de joyas",
    addedSuccess: "¡Producto añadido! 🛒",
    removedSuccess: "Producto eliminado del carrito",
    quantityUpdated: "Cantidad actualizada",
    minAmount: `El monto mínimo para procesar el pago es $${siteConfig.features.minOrderAmount.toLocaleString('es-CL')} CLP`,
  },
  wishlist: {
    empty: "Tu lista de favoritos está vacía",
    emptyDescription: "Guarda los productos que más te gustan",
    addedSuccess: "¡Añadido a favoritos! ❤️",
    removedSuccess: "Eliminado de favoritos",
  },
  errors: {
    generic: "Ha ocurrido un error inesperado",
    network: "Error de conexión. Verifica tu internet",
    payment: "Error en el procesamiento del pago",
    outOfStock: "Producto agotado",
    invalidData: "Datos inválidos",
  },
  success: {
    paymentCompleted: "¡Pago exitoso! Gracias por tu compra",
    orderCreated: "Pedido creado exitosamente",
    newsletterSubscribed: "¡Gracias por suscribirte!",
    messageSent: "Mensaje enviado exitosamente",
  }
} as const;

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

export const apiConfig = {
  baseUrl: siteConfig.url,
  endpoints: {
    products: '/api/products',
    orders: '/api/orders',
    checkout: '/api/checkout',
    webhookMercadoPago: '/api/webhook/mercadopago',
    newsletter: '/api/newsletter',
    contact: '/api/contact',
  }
} as const;

export const imageConfig = {
  domains: ['localhost', 'joyasjp.cl', 'supabase.co'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  formats: ['image/webp', 'image/avif'],
  quality: 85,
} as const;

export default siteConfig;
