import React from 'react'

interface ProductSchemaProps {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  brand?: string
  sku?: string
  category?: string
  rating?: {
    value: number
    count: number
  }
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = 'CLP',
  availability = 'InStock',
  brand = 'Joyas JP',
  sku,
  category = 'Joyería',
  rating
}: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceCurrency: currency,
      price,
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: 'Joyas JP'
      }
    },
    category,
    ...(sku && { sku }),
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.value,
        reviewCount: rating.count
      }
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}