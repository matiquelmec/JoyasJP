import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';

interface CategoryBentoGridProps {
  products: Product[];
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
    href: '/productos?material=plata-925',
    badge: 'Colección Insignia',
    spanClass: 'md:col-span-2 md:row-span-2 min-h-[340px] md:min-h-[460px]',
    matchCategories: ['Plata Italy 925'],
    matchMaterial: '925',
  },
  {
    id: 'cadenas',
    title: 'Cadenas & Cubanas',
    subtitle: 'Eslabones sólidos de 45 a 60 cm en acero y plata.',
    href: '/productos?categoria=Cadenas',
    spanClass: 'md:col-span-2 min-h-[220px]',
    matchCategories: ['Cadenas'],
  },
  {
    id: 'dijes',
    title: 'Dijes & Colgantes',
    subtitle: 'Cruces, medallas y símbolos con carácter.',
    href: '/productos?categoria=Dijes',
    spanClass: 'min-h-[220px]',
    matchCategories: ['Dijes', 'Colgantes'],
  },
  {
    id: 'pulseras',
    title: 'Pulseras',
    subtitle: 'Esclavas, figaro y tejido italiano.',
    href: '/productos?categoria=Pulseras',
    spanClass: 'min-h-[220px]',
    matchCategories: ['Pulseras'],
  },
  {
    id: 'aros',
    title: 'Aros & Argollas',
    subtitle: 'Diseños minimalistas y de alto impacto.',
    href: '/productos?categoria=Aros',
    spanClass: 'md:col-span-2 min-h-[220px]',
    matchCategories: ['Aros'],
  },
  {
    id: 'sets',
    title: 'Sets & Conjuntos',
    subtitle: 'Combinaciones curadas listas para regalar.',
    href: '/productos?categoria=Sets',
    spanClass: 'md:col-span-2 min-h-[220px]',
    matchCategories: ['Sets', 'Conjuntos'],
  },
];

function resolveCollectionImage(collection: BentoCollection, products: Product[]): string {
  const match =
    products.find((p) => {
      const catMatch = collection.matchCategories.some(
        (c) => p.category?.toLowerCase() === c.toLowerCase()
      );
      const matMatch = collection.matchMaterial
        ? p.materials?.toLowerCase().includes(collection.matchMaterial.toLowerCase()) ||
          p.name?.toLowerCase().includes(collection.matchMaterial.toLowerCase())
        : false;
      return (catMatch || matMatch) && Boolean(p.gallery?.[0]);
    }) ?? products.find((p) => Boolean(p.gallery?.[0]));

  return match?.gallery?.[0] || '/brand/joyasjp_og_image_1200x630.png';
}

export function CategoryBentoGrid({ products }: CategoryBentoGridProps) {
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
            className="text-3xl md:text-4xl font-bold font-body tracking-tight text-white"
          >
            Explora el Catálogo
          </h2>
        </div>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#C4C9D2] hover:text-white transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] rounded-md px-2"
        >
          Ver todo el catálogo
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {BENTO_COLLECTIONS.map((col) => {
          const imageUrl = resolveCollectionImage(col, products);
          return (
            <Link
              key={col.id}
              href={col.href}
              className={`group relative overflow-hidden rounded-xl border border-white/10 bg-[#121214] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${col.spanClass}`}
            >
              <img
                src={imageUrl}
                alt={col.title}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-75 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/55 to-transparent" />

              <div className="relative z-10 flex h-full flex-col justify-end p-6">
                {col.badge && (
                  <span className="mb-3 inline-flex w-fit items-center rounded-full border border-[#C4C9D2]/30 bg-[#09090B]/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#C4C9D2] backdrop-blur-sm">
                    {col.badge}
                  </span>
                )}
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold font-body text-white group-hover:text-[#F43F5E] transition-colors">
                      {col.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#A1A1AA] line-clamp-2 max-w-md">
                      {col.subtitle}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#09090B]/80 text-white transition-all duration-300 group-hover:border-[#D4113C] group-hover:bg-[#D4113C]"
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
