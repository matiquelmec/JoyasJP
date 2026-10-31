import Image from 'next/image';
import Link from 'next/link';

export type JoyasJPLogoVariant = 'horizontal' | 'insignia' | 'sello' | 'monograma' | 'wordmark';
export type JoyasJPLogoColor = 'plata' | 'blanco' | 'carmesi' | 'plata_plano' | 'negro';
export type JoyasJPLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface JoyasJPLogoProps {
  variant?: JoyasJPLogoVariant;
  color?: JoyasJPLogoColor;
  size?: JoyasJPLogoSize;
  className?: string;
  asLink?: boolean;
  priority?: boolean;
}

const DIMENSIONS: Record<JoyasJPLogoVariant, Record<JoyasJPLogoSize, { width: number; height: number }>> = {
  horizontal: {
    xs: { width: 140, height: 28 },
    sm: { width: 160, height: 32 },
    md: { width: 190, height: 38 },
    lg: { width: 230, height: 46 },
    xl: { width: 280, height: 56 },
    '2xl': { width: 340, height: 68 },
  },
  insignia: {
    xs: { width: 48, height: 48 },
    sm: { width: 64, height: 64 },
    md: { width: 88, height: 88 },
    lg: { width: 120, height: 120 },
    xl: { width: 160, height: 160 },
    '2xl': { width: 220, height: 220 },
  },
  sello: {
    xs: { width: 56, height: 56 },
    sm: { width: 72, height: 72 },
    md: { width: 96, height: 96 },
    lg: { width: 132, height: 132 },
    xl: { width: 180, height: 180 },
    '2xl': { width: 240, height: 240 },
  },
  monograma: {
    xs: { width: 36, height: 36 },
    sm: { width: 44, height: 44 },
    md: { width: 56, height: 56 },
    lg: { width: 72, height: 72 },
    xl: { width: 96, height: 96 },
    '2xl': { width: 128, height: 128 },
  },
  wordmark: {
    xs: { width: 120, height: 24 },
    sm: { width: 140, height: 28 },
    md: { width: 170, height: 34 },
    lg: { width: 210, height: 42 },
    xl: { width: 260, height: 52 },
    '2xl': { width: 320, height: 64 },
  },
};

export function JoyasJPLogo({
  variant = 'horizontal',
  color = 'plata',
  size = 'md',
  className = '',
  asLink = true,
  priority = false,
}: JoyasJPLogoProps) {
  const fileName = `joyasjp_${variant}_${color}_rgb.svg`;
  const src = `/brand/${fileName}`;
  const { width, height } = DIMENSIONS[variant][size];

  const image = (
    <Image
      src={src}
      alt="Joyas JP - Alta Joyería Urbana y Plata Fina 925"
      width={width}
      height={height}
      priority={priority}
      className={`h-auto w-auto object-contain transition-transform duration-300 ${className}`}
    />
  );

  if (!asLink) {
    return image;
  }

  return (
    <Link
      href="/"
      className="inline-flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
      aria-label="Joyas JP - Inicio"
    >
      {image}
    </Link>
  );
}
