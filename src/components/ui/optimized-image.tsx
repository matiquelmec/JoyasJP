"use client";

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  fill = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  width,
  height,
  loading = "lazy",
  placeholder = "blur",
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    onError?.();
  };

  const imageProps = {
    src,
    alt,
    onLoad: handleImageLoad,
    onError: handleImageError,
    priority,
    loading: priority ? "eager" : loading,
    placeholder,
    blurDataURL,
    className: cn(
      "transition-all duration-300",
      imageLoading ? "scale-105 blur-sm opacity-0" : "scale-100 blur-0 opacity-100",
      className
    ),
    ...(fill ? { fill: true, sizes } : { width, height }),
  };

  if (imageError) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        <Sparkles className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  }

  return <Image {...imageProps} />;
}