'use client'

import * as React from 'react'
import Image from 'next/image'
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi 
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: string[]
  name: string
  className?: string
}

export function ProductImageGallery({ images, name, className }: ProductImageGalleryProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const onThumbClick = React.useCallback(
    (index: number) => {
      if (!api) return
      api.scrollTo(index)
    },
    [api]
  )

  // Si solo hay una imagen, mostramos una versión estática simple
  if (images.length <= 1) {
    return (
      <div className={cn("relative aspect-square w-full bg-muted/30 rounded-lg overflow-hidden border border-slate-200", className)}>
        <Image
          src={images[0] || '/assets/logo.webp'}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main Carousel */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-square w-full bg-muted/30 rounded-lg overflow-hidden border border-slate-200">
                <Image
                  src={image}
                  alt={`${name} - Vista ${index + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/80 backdrop-blur-sm hover:bg-white border-none shadow-md" />
        <CarouselNext className="right-2 bg-white/80 backdrop-blur-sm hover:bg-white border-none shadow-md" />
      </Carousel>

      {/* Thumbnails */}
      <div className="flex flex-wrap gap-2 justify-center">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onThumbClick(index)}
            className={cn(
              "relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all hover:scale-105",
              current === index ? "border-primary shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <Image
              src={image}
              alt={`Miniatura ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
