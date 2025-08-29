import React from 'react'
import type { Product } from '@/lib/types'

interface ProductSchemaProps {
  product: Product
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  rating?: {
    value: number
    count: number
  }
}

export function ProductSchema({
  product,
  availability = 'InStock',
  rating
}: ProductSchemaProps) {
  const categoryNames = {
    cadenas: 'Jewelry > Necklaces',
    dijes: 'Jewelry > Pendants',
    pulseras: 'Jewelry > Bracelets',
    aros: 'Jewelry > Earrings',
  }

  const category = categoryNames[product.category as keyof typeof categoryNames] || 'Jewelry'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://joyasjp.netlify.app'
  const productUrl = `${siteUrl}/shop/${product.id}`
  const imageUrl = product.imageUrl || `${siteUrl}/assets/logo.webp`
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    name: product.name,
    description: product.description || `${product.name} - Alta joyería urbana de diseño exclusivo`,
    category,
    brand: {
      '@type': 'Brand',
      name: 'Joyas JP',
      logo: `${siteUrl}/assets/logo.webp`,
      url: siteUrl,
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Joyas JP',
      url: siteUrl,
      logo: `${siteUrl}/assets/logo.webp`,
    },
    image: [
      {
        '@type': 'ImageObject',
        url: imageUrl,
        width: 800,
        height: 800,
        caption: product.name,
      },
    ],
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'CLP',
      price: product.price.toString(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: `https://schema.org/${availability}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Joyas JP',
        url: siteUrl,
        logo: `${siteUrl}/assets/logo.webp`,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'CL',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '3000',
          currency: 'CLP',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CL',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Consumers interested in urban jewelry',
    },
    material: 'Premium metals and materials',
    sku: product.id,
    gtin: product.id,
    mpn: product.id,
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.value,
        reviewCount: rating.count,
        bestRating: 5,
        worstRating: 1,
      }
    }),
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Style',
        value: 'Urban Premium Jewelry',
      },
      {
        '@type': 'PropertyValue',
        name: 'Target Audience',
        value: 'Urban Fashion Enthusiasts',
      },
      {
        '@type': 'PropertyValue',
        name: 'Material Quality',
        value: 'Premium',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  )
}