'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, LayoutGrid, GalleryHorizontal } from 'lucide-react';
import type { Product } from '@/lib/types';

interface CategoryBentoGridProps {
  products: Product[];
  customCovers?: Record<string, string>;
}

interface BentoCollection {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  spanClass: string;
  matchCategories: string[];
  matchMaterial?: string;
}

const BENTO_COLLECTIONS: BentoCollection[] = [
  {
    id: 'plata-925',
    title: 'Plata Italy 925',
    subtitle: 'Ley 925 certificada, brillo milanés y piezas de herencia.',
    href: '/productos?categoria=plata-925',
    badge: 'Colección Insignia',
    spanClass: 'md:col-span-2 md:row-span-2 min-h-[420px] md:min-h-[540px]',
    matchCategories: ['Plata Italy 925', 'plata-925'],
    matchMaterial: '925',
  },
  {
    id: 'cadenas',
    title: 'Cadenas & Cubanas',
    subtitle: 'Eslabones sólidos de 45 a 60 cm en acero y plata.',
    href: '/productos?categoria=cadenas',
    spanClass: 'md:col-span-1 min-h-[380px] md:min-h-[420px]',
    matchCategories: ['Cadenas', 'cadenas'],
  },
  {
    id: 'dijes',
    title: 'Dijes & Colgantes',
    subtitle: 'Cruces, medallas y símbolos con carácter.',
    href: '/productos?categoria=dijes',
    spanClass: 'md:col-span-1 min-h-[380px] md:min-h-[420px]',
    matchCategories: ['Dijes', 'Colgantes', 'Dijes / Colgantes', 'dijes'],
  },
  {
    id: 'pulseras',
    title: 'Pulseras',
    subtitle: 'Esclavas, figaro y tejido italiano.',
    href: '/productos?categoria=pulseras',
    spanClass: 'md:col-span-1 min-h-[380px] md:min-h-[420px]',
    matchCategories: ['Pulseras', 'pulseras'],
  },
  {
    id: 'aros',
    title: 'Aros & Argollas',
    subtitle: 'Diseños minimalistas y de alto impacto.',
    href: '/productos?categoria=aros',
    spanClass: 'md:col-span-1 min-h-[380px] md:min-h-[420px]',
    matchCategories: ['Aros', 'aros'],
  },
  {
    id: 'sets',
    title: 'Sets & Conjuntos',
    subtitle: 'Combinaciones curadas listas para regalar.',
    href: '/productos?categoria=conjuntos',
    spanClass: 'md:col-span-2 min-h-[380px] md:min-h-[420px]',
    matchCategories: ['Sets', 'Conjuntos', 'Sets & Conjuntos', 'conjuntos'],
  },
  {
    id: 'relojes',
    title: 'Relojes',
    subtitle: 'Relojes urbanos de alto impacto y precisión.',
    href: '/productos?categoria=relojes',
    spanClass: 'md:col-span-1 min-h-[380px] md:min-h-[420px]',
    matchCategories: ['Relojes', 'relojes'],
  },
  {
    id: 'enchapado-plata',
    title: 'Enchapado de Plata',
    subtitle: 'Piezas con baño de plata de brillo duradero.',
    href: '/productos?categoria=enchapado-plata',
    spanClass: 'md:col-span-1 min-h-[380px] md:min-h-[420px]',
    matchCategories: ['Enchapado de Plata', 'enchapado-plata'],
  },
];

function hiResCloudinary(url: string): string {
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_auto')) {
    return url.replace(/\/upload\/[^/]+\//, '/upload/f_auto,q_auto:best,w_1600,c_limit/');
  }
  return url.replace('/upload/', '/upload/f_auto,q_auto:best,w_1600,c_limit/');
}

function resolveCollectionImage(
  collection: BentoCollection,
  products: Product[],
  customCovers?: Record<string, string>
): string {
  const canonicalId = collection.id === 'sets' ? 'conjuntos' : collection.id;
  if (customCovers?.[canonicalId]) {
    return hiResCloudinary(customCovers[canonicalId]);
  }
  const match =
    products.find((p) => {
      const catMatch = collection.matchCategories.some(
        (c) => p.category?.toLowerCase() === c.toLowerCase()
      );
      const matMatch = collection.matchMaterial
        ? p.materials?.toLowerCase().includes(collection.matchMaterial.toLowerCase()) ||
          p.name?.toLowerCase().includes(collection.matchMaterial.toLowerCase())
        : false;
      return (catMatch || matMatch) && Boolean(p.gallery?.[0] || p.imageUrl);
    }) ?? products.find((p) => Boolean(p.gallery?.[0] || p.imageUrl));

  const fallback = match?.gallery?.[0] || match?.imageUrl || '/brand/joyasjp_og_image_1200x630.png';
  return hiResCloudinary(fallback);
}

export function CategoryBentoGrid({ products, customCovers }: CategoryBentoGridProps) {
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (dir: 'left' | 'right') => {
    if (!railRef.current) return;
    const step = Math.round(railRef.current.clientWidth * 0.78);
    railRef.current.scrollBy({
      left: dir === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  return (
    <section
      aria-labelledby="bento-collections-heading"
      className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F43F5E] mb-2">
            Curaduría por Colección
          </p>
          <h2
            id="bento-collections-heading"
            className="text-3xl md:text-5xl font-bold font-body tracking-tight text-white"
          >
            Explora el Catálogo
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector Carrusel Editorial vs Grilla Bento */}
          <div className="inline-flex items-center rounded-xl border border-white/10 bg-[#121214] p-1">
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'carousel'
                  ? 'bg-[#D4113C] text-white shadow'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <GalleryHorizontal className="w-3.5 h-3.5" />
              Carrusel
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#D4113C] text-white shadow'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grilla
            </button>
          </div>

          {viewMode === 'carousel' && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollRail('left')}
                aria-label="Desplazar colecciones a la izquierda"
                className="h-11 w-11 flex items-center justify-center rounded-full border border-white/15 bg-[#121214] text-white hover:border-[#D4113C] hover:bg-[#D4113C] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail('right')}
                aria-label="Desplazar colecciones a la derecha"
                className="h-11 w-11 flex items-center justify-center rounded-full border border-white/15 bg-[#121214] text-white hover:border-[#D4113C] hover:bg-[#D4113C] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C4C9D2] hover:text-white transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] rounded-md px-2"
          >
            Ver todo
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {viewMode === 'carousel' ? (
        <div
          ref={railRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {BENTO_COLLECTIONS.map((col) => {
            const imageUrl = resolveCollectionImage(col, products, customCovers);
            return (
              <Link
                key={col.id}
                href={col.href}
                className="group relative shrink-0 snap-start w-[82vw] sm:w-[340px] md:w-[380px] aspect-[4/5] overflow-hidden rounded-2xl border border-white/15 bg-[#121214] shadow-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C]"
              >
                <img
                  src={imageUrl}
                  alt={col.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-100"
                />
                {/* Viñeta inferior limpia que deja el 100% de brillo en la joya */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#09090B]/95 via-[#09090B]/45 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between p-6">
                  <div>
                    {col.badge && (
                      <span className="inline-flex w-fit items-center rounded-full border border-[#C4C9D2]/40 bg-[#09090B]/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#C4C9D2] backdrop-blur-md">
                        {col.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold font-body text-white group-hover:text-[#F43F5E] transition-colors drop-shadow">
                        {col.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-200 line-clamp-2">
                        {col.subtitle}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#09090B]/85 text-white transition-all duration-300 group-hover:border-[#D4113C] group-hover:bg-[#D4113C]"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {BENTO_COLLECTIONS.map((col) => {
            const imageUrl = resolveCollectionImage(col, products, customCovers);
            return (
              <Link
                key={col.id}
                href={col.href}
                className={`group relative overflow-hidden rounded-2xl border border-white/15 bg-[#121214] shadow-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${col.spanClass}`}
              >
                <img
                  src={imageUrl}
                  alt={col.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-100"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#09090B]/95 via-[#09090B]/45 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between p-6">
                  <div>
                    {col.badge && (
                      <span className="inline-flex w-fit items-center rounded-full border border-[#C4C9D2]/40 bg-[#09090B]/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#C4C9D2] backdrop-blur-md">
                        {col.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold font-body text-white group-hover:text-[#F43F5E] transition-colors drop-shadow">
                        {col.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-200 line-clamp-2 max-w-md">
                        {col.subtitle}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#09090B]/85 text-white transition-all duration-300 group-hover:border-[#D4113C] group-hover:bg-[#D4113C]"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
