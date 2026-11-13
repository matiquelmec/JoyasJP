import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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
    spanClass: 'md:col-span-2 min-h-[78vh] md:min-h-[86vh]',
    matchCategories: ['Plata Italy 925', 'plata-925'],
    matchMaterial: '925',
  },
  {
    id: 'cadenas',
    title: 'Cadenas & Cubanas',
    subtitle: 'Eslabones sólidos de 45 a 60 cm en acero y plata.',
    href: '/productos?categoria=cadenas',
    badge: 'Más Buscados',
    spanClass: 'md:col-span-2 min-h-[78vh] md:min-h-[86vh]',
    matchCategories: ['Cadenas', 'cadenas'],
  },
  {
    id: 'dijes',
    title: 'Dijes & Colgantes',
    subtitle: 'Cruces, medallas y símbolos con carácter.',
    href: '/productos?categoria=dijes',
    spanClass: 'md:col-span-1 min-h-[68vh] md:min-h-[72vh]',
    matchCategories: ['Dijes', 'Colgantes', 'Dijes / Colgantes', 'dijes'],
  },
  {
    id: 'pulseras',
    title: 'Pulseras',
    subtitle: 'Esclavas, figaro y tejido italiano.',
    href: '/productos?categoria=pulseras',
    spanClass: 'md:col-span-1 min-h-[68vh] md:min-h-[72vh]',
    matchCategories: ['Pulseras', 'pulseras'],
  },
  {
    id: 'aros',
    title: 'Aros & Argollas',
    subtitle: 'Diseños minimalistas y de alto impacto.',
    href: '/productos?categoria=aros',
    spanClass: 'md:col-span-1 min-h-[68vh] md:min-h-[72vh]',
    matchCategories: ['Aros', 'aros'],
  },
  {
    id: 'sets',
    title: 'Sets & Conjuntos',
    subtitle: 'Combinaciones curadas listas para regalar.',
    href: '/productos?categoria=conjuntos',
    spanClass: 'md:col-span-1 min-h-[68vh] md:min-h-[72vh]',
    matchCategories: ['Sets', 'Conjuntos', 'Sets & Conjuntos', 'conjuntos'],
  },
  {
    id: 'relojes',
    title: 'Relojes',
    subtitle: 'Relojes urbanos de alto impacto y precisión.',
    href: '/productos?categoria=relojes',
    spanClass: 'md:col-span-2 min-h-[72vh] md:min-h-[76vh]',
    matchCategories: ['Relojes', 'relojes'],
  },
  {
    id: 'enchapado-plata',
    title: 'Enchapado de Plata',
    subtitle: 'Piezas con baño de plata de brillo duradero.',
    href: '/productos?categoria=enchapado-plata',
    spanClass: 'md:col-span-2 min-h-[72vh] md:min-h-[76vh]',
    matchCategories: ['Enchapado de Plata', 'enchapado-plata'],
  },
];

function hiResCloudinary(url: string): string {
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_auto')) {
    return url.replace(/\/upload\/[^/]+\//, '/upload/f_auto,q_auto:best,w_1800,c_limit/');
  }
  return url.replace('/upload/', '/upload/f_auto,q_auto:best,w_1800,c_limit/');
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

  const fallback =
    match?.gallery?.[0] || match?.imageUrl || '/brand/joyasjp_og_image_1200x630.png';
  return hiResCloudinary(fallback);
}

export function CategoryBentoGrid({ products, customCovers }: CategoryBentoGridProps) {
  return (
    <section
      aria-labelledby="bento-collections-heading"
      className="w-full bg-[#09090B] pt-14 md:pt-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-6 sm:px-10 lg:px-16 pb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F43F5E] mb-2">
            Curaduría por Colección
          </p>
          <h2
            id="bento-collections-heading"
            className="text-4xl md:text-6xl font-bold font-body tracking-tight text-white uppercase"
          >
            Explora el Catálogo
          </h2>
        </div>

        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#C4C9D2] hover:text-white transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] px-2"
        >
          Ver Catálogo Completo
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Full-Bleed Edge-to-Edge Editorial Panels (100% Viewport Width) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0.5 bg-white/10 w-full">
        {BENTO_COLLECTIONS.map((col) => {
          const imageUrl = resolveCollectionImage(col, products, customCovers);
          return (
            <Link
              key={col.id}
              href={col.href}
              className={`group relative overflow-hidden bg-[#09090B] focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${col.spanClass}`}
            >
              <Image
                src={imageUrl}
                alt={col.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={90}
                className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105 opacity-100"
              />
              {/* Viñeta inferior sutil que deja el 100% de luz en la fotografía */}
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#09090B]/95 via-[#09090B]/40 to-transparent" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-10 lg:p-12">
                <div>
                  {col.badge && (
                    <span className="inline-flex w-fit items-center border border-[#C4C9D2]/40 bg-[#09090B]/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C4C9D2] backdrop-blur-md">
                      {col.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-bold font-body text-white uppercase tracking-tight group-hover:text-[#F43F5E] transition-colors drop-shadow-md">
                      {col.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-zinc-200 max-w-md">
                      {col.subtitle}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-[#09090B]/85 text-white transition-all duration-300 group-hover:border-[#D4113C] group-hover:bg-[#D4113C]"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
