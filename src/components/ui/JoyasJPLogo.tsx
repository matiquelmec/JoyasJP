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

const DIMENSIONS: Record<
  JoyasJPLogoVariant,
  Record<JoyasJPLogoSize, { width: number; height: number; containerClass: string }>
> = {
  // SVG viewBox: 1894 x 1025 (aspect ~1.848)
  horizontal: {
    xs: { width: 96, height: 52, containerClass: 'w-[88px] sm:w-[96px] h-[48px] sm:h-[52px]' },
    sm: { width: 112, height: 60, containerClass: 'w-[100px] sm:w-[112px] h-[54px] sm:h-[60px]' },
    md: { width: 126, height: 68, containerClass: 'w-[108px] sm:w-[126px] h-[58px] sm:h-[68px]' },
    lg: { width: 156, height: 84, containerClass: 'w-[136px] sm:w-[156px] h-[74px] sm:h-[84px]' },
    xl: { width: 192, height: 104, containerClass: 'w-[166px] sm:w-[192px] h-[90px] sm:h-[104px]' },
    '2xl': { width: 230, height: 124, containerClass: 'w-[196px] sm:w-[230px] h-[106px] sm:h-[124px]' },
  },
  // SVG viewBox: 925 x 921 (aspect ~1.0)
  insignia: {
    xs: { width: 48, height: 48, containerClass: 'w-12 h-12' },
    sm: { width: 64, height: 64, containerClass: 'w-16 h-16' },
    md: { width: 96, height: 96, containerClass: 'w-20 h-20 sm:w-24 sm:h-24' },
    lg: { width: 140, height: 140, containerClass: 'w-28 h-28 sm:w-[140px] sm:h-[140px]' },
    xl: { width: 184, height: 184, containerClass: 'w-36 h-36 sm:w-[184px] sm:h-[184px]' },
    '2xl': { width: 224, height: 224, containerClass: 'w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56' },
  },
  // SVG viewBox: 925 x 921 (aspect ~1.0)
  sello: {
    xs: { width: 48, height: 48, containerClass: 'w-12 h-12' },
    sm: { width: 64, height: 64, containerClass: 'w-16 h-16' },
    md: { width: 96, height: 96, containerClass: 'w-20 h-20 sm:w-24 sm:h-24' },
    lg: { width: 132, height: 132, containerClass: 'w-28 h-28 sm:w-[132px] sm:h-[132px]' },
    xl: { width: 180, height: 180, containerClass: 'w-36 h-36 sm:w-[180px] sm:h-[180px]' },
    '2xl': { width: 220, height: 220, containerClass: 'w-44 h-44 sm:w-[220px] sm:h-[220px]' },
  },
  // SVG viewBox: 512 x 517 (aspect ~1.0)
  monograma: {
    xs: { width: 32, height: 32, containerClass: 'w-8 h-8' },
    sm: { width: 40, height: 40, containerClass: 'w-10 h-10' },
    md: { width: 52, height: 52, containerClass: 'w-11 h-11 sm:w-[52px] sm:h-[52px]' },
    lg: { width: 68, height: 68, containerClass: 'w-14 h-14 sm:w-[68px] sm:h-[68px]' },
    xl: { width: 88, height: 88, containerClass: 'w-20 h-20 sm:w-[88px] sm:h-[88px]' },
    '2xl': { width: 112, height: 112, containerClass: 'w-24 h-24 sm:w-28 sm:h-28' },
  },
  // SVG viewBox: 187 x 61 (aspect ~3.06)
  wordmark: {
    xs: { width: 100, height: 33, containerClass: 'w-[90px] sm:w-[100px] h-[30px] sm:h-[33px]' },
    sm: { width: 120, height: 39, containerClass: 'w-[110px] sm:w-[120px] h-[36px] sm:h-[39px]' },
    md: { width: 148, height: 48, containerClass: 'w-[130px] sm:w-[148px] h-[42px] sm:h-[48px]' },
    lg: { width: 180, height: 59, containerClass: 'w-[160px] sm:w-[180px] h-[52px] sm:h-[59px]' },
    xl: { width: 220, height: 72, containerClass: 'w-[190px] sm:w-[220px] h-[62px] sm:h-[72px]' },
    '2xl': { width: 260, height: 85, containerClass: 'w-[220px] sm:w-[260px] h-[72px] sm:h-[85px]' },
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
  const { width, height, containerClass } = DIMENSIONS[variant][size];

  const imageBox = (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${containerClass} ${className}`}>
      <Image
        src={src}
        alt="Joyas JP"
        width={width}
        height={height}
        priority={priority}
        style={{ width: '100%', height: '100%' }}
        className="w-full h-full object-contain transition-transform duration-300"
      />
    </div>
  );

  if (!asLink) {
    return imageBox;
  }

  return (
    <Link
      href="/"
      className="inline-flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
      aria-label="Joyas JP - Inicio"
    >
      {imageBox}
    </Link>
  );
}
