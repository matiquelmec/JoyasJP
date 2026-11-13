'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  { label: 'Cadenas', value: 'cadenas', tag: 'Eslabones' },
  { label: 'Plata Italy 925', value: 'plata-925', tag: 'Ley 925' },
  { label: 'Dijes', value: 'dijes', tag: 'Símbolos' },
  { label: 'Pulseras', value: 'pulseras', tag: 'Muñeca' },
  { label: 'Aros', value: 'aros', tag: 'Argollas' },
  { label: 'Sets & Conjuntos', value: 'conjuntos', tag: 'Curados' },
  { label: 'Relojes', value: 'relojes', tag: 'Precisión' },
  { label: 'Enchapado de Plata', value: 'enchapado-plata', tag: 'Baño Plata' },
];

const MATERIALS = [
  {
    label: 'Plata 925 Certificada',
    value: 'plata-925',
    swatch: 'from-[#F6F7FA] via-[#C4C9D2] to-[#717784]',
    note: 'Plata fina italiana sellada',
  },
  {
    label: 'Acero Quirúrgico',
    value: 'acero',
    swatch: 'from-[#D4D4D8] via-[#71717A] to-[#27272A]',
    note: 'Alta resistencia diaria',
  },
  {
    label: 'Aleación & Diseño',
    value: 'aleacion',
    swatch: 'from-[#F43F5E] via-[#D4113C] to-[#881337]',
    note: 'Piezas urbanas statement',
  },
  {
    label: 'Cualquier Material',
    value: 'all',
    swatch: 'from-[#C4C9D2] via-[#D4113C] to-[#18181B]',
    note: 'Explorar todo el catálogo',
  },
];

const BUDGETS = [
  { label: 'Hasta $25.000', value: '25000', tier: 'Esencial' },
  { label: 'Hasta $50.000', value: '50000', tier: 'Signature' },
  { label: 'Hasta $90.000', value: '90000', tier: 'Collector' },
  { label: 'Sin límite', value: '', tier: 'Full Vault' },
];

const CHAIN_SIZES = [
  {
    cm: '45 cm',
    fit: 'Al cuello / Clavícula',
    note: 'Ideal para uso diario sutil o cuellos delgados. Queda justo sobre la clavícula.',
    dropY: 52,
  },
  {
    cm: '50 cm',
    fit: 'Estándar clásico',
    note: 'El largo más versátil. Cae ligeramente bajo la clavícula; perfecto con o sin dije.',
    dropY: 70,
  },
  {
    cm: '55 cm',
    fit: 'Medio pecho',
    note: 'Presencia marcada sobre poleras o camisas abiertas. Gran equilibrio para dijes medianos.',
    dropY: 88,
  },
  {
    cm: '60 cm',
    fit: 'Largo statement',
    note: 'Caída protagonista al centro del pecho. Ideal para eslabones cubanos o layering.',
    dropY: 106,
  },
];

function FacetedGemMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
      <path
        d="M6.5 4h11l4 5.5L12 20.5 2.5 9.5 6.5 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 9.5h19M7.5 4l2.2 5.5L12 20.5l2.3-11L16.5 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CaliperLinkMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="18" height="10" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7v3M12 7v4M16 7v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Hallmark925Mark() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
      <path
        d="M12 2.5 19.5 6v6.2c0 4.6-3.2 8.2-7.5 9.3-4.3-1.1-7.5-4.7-7.5-9.3V6L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12.2 11 14.7l4.8-5.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExpressRouteMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
      <path
        d="M3 7h11v9H3V7Zm11 3h4.2L21 13v3h-7v-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function StyleFinderAndCare() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<string>('cadenas');
  const [material, setMaterial] = useState<string>('plata-925');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sizes' | 'care' | 'shipping'>('sizes');
  const [hoveredSize, setHoveredSize] = useState<string>('50 cm');

  const handleFinishFinder = (selectedBudget: string) => {
    setMaxPrice(selectedBudget);
    const params = new URLSearchParams();
    if (category) params.set('categoria', category);
    if (material && material !== 'all') params.set('material', material);
    if (selectedBudget) params.set('maxPrice', selectedBudget);
    router.push(`/productos?${params.toString()}`);
  };

  return (
    <section
      aria-labelledby="finder-care-heading"
      className="w-full border-y border-white/10 bg-[#09090B]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full">
        {/* Left 50% Viewport: 3-Step Interactive Style Finder */}
        <div className="relative overflow-hidden bg-[#121214] p-8 sm:p-12 lg:p-20 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-center min-h-[68vh]">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#D4113C]/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#F43F5E]">
                <FacetedGemMark />
                Asistente de Estilo
              </p>
              <h2
                id="finder-care-heading"
                className="mt-2 text-3xl sm:text-4xl font-bold font-body text-white uppercase tracking-tight"
              >
                Encuentra tu Pieza en 3 Pasos
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-[#09090B] border border-white/10 rounded-full px-3.5 py-2">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === n
                      ? 'w-7 bg-[#D4113C] shadow-[0_0_10px_rgba(212,17,60,0.7)]'
                      : step > n
                        ? 'w-2 bg-[#C4C9D2]'
                        : 'w-2 bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="relative">
              <p className="text-base font-medium text-[#C4C9D2] mb-5">
                1. ¿Qué tipo de pieza estás buscando hoy?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setCategory(item.value);
                      setStep(2);
                    }}
                    className={`group min-h-[56px] flex items-center justify-between rounded-xl border px-5 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                      category === item.value
                        ? 'border-[#D4113C] bg-[#D4113C]/15 text-white shadow-[0_0_20px_rgba(212,17,60,0.18)]'
                        : 'border-white/10 bg-[#09090B] text-[#C4C9D2] hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-bold">{item.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA] group-hover:text-[#F43F5E] transition-colors">
                      {item.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="relative">
              <p className="text-base font-medium text-[#C4C9D2] mb-5">
                2. Elige tu material preferido:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {MATERIALS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setMaterial(item.value);
                      setStep(3);
                    }}
                    className={`group min-h-[64px] flex items-center gap-3.5 rounded-xl border px-5 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                      material === item.value
                        ? 'border-[#D4113C] bg-[#D4113C]/15 text-white'
                        : 'border-white/10 bg-[#09090B] text-[#C4C9D2] hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${item.swatch} ring-1 ring-white/20`}
                    />
                    <div>
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className="block text-xs text-[#A1A1AA]">{item.note}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Volver al paso anterior
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="relative">
              <p className="text-base font-medium text-[#C4C9D2] mb-5">
                3. Define tu presupuesto estimado:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {BUDGETS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleFinishFinder(item.value)}
                    className={`group min-h-[60px] flex items-center justify-between rounded-xl border px-5 py-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                      maxPrice === item.value
                        ? 'border-[#D4113C] bg-[#D4113C] text-white'
                        : 'border-white/10 bg-[#09090B] text-[#C4C9D2] hover:border-[#D4113C] hover:text-white'
                    }`}
                  >
                    <div className="text-left">
                      <span className="block font-bold">{item.label}</span>
                      <span className="block text-[10px] uppercase tracking-widest text-[#A1A1AA] group-hover:text-white/80">
                        {item.tier}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Volver al paso anterior
              </button>
            </div>
          )}
        </div>

        {/* Right 50% Viewport: Interactive Size Guide & Silver 925 Care */}
        <div className="bg-[#09090B] p-8 sm:p-12 lg:p-20 flex flex-col justify-center min-h-[68vh]">
          <div className="flex flex-wrap gap-2.5 mb-8 border-b border-white/10 pb-5">
            <button
              type="button"
              onClick={() => setActiveTab('sizes')}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                activeTab === 'sizes'
                  ? 'bg-[#D4113C] text-white'
                  : 'bg-[#121214] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <CaliperLinkMark />
              Guía de Largos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('care')}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                activeTab === 'care'
                  ? 'bg-[#D4113C] text-white'
                  : 'bg-[#121214] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Hallmark925Mark />
              Cuidado Plata 925
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                activeTab === 'shipping'
                  ? 'bg-[#D4113C] text-white'
                  : 'bg-[#121214] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <ExpressRouteMark />
              Envíos & Garantía
            </button>
          </div>

          {activeTab === 'sizes' && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#121214] p-6">
                <svg viewBox="0 0 120 130" className="w-36 h-40" fill="none" aria-hidden="true">
                  <path
                    d="M36 14c0 16 10 26 24 26s24-10 24-26M18 46c12-10 24-12 42-12s30 2 42 12l8 74H10l8-74Z"
                    stroke="#3F3F46"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {CHAIN_SIZES.map((s) => {
                    const isActive = hoveredSize === s.cm;
                    return (
                      <path
                        key={s.cm}
                        d={`M40 34 Q60 ${s.dropY} 80 34`}
                        stroke={isActive ? '#D4113C' : '#52525B'}
                        strokeWidth={isActive ? '2.6' : '1.1'}
                        strokeDasharray={isActive ? undefined : '2 3'}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
                <span className="mt-2 text-xs font-bold uppercase tracking-widest text-[#F43F5E]">
                  Vista {hoveredSize}
                </span>
              </div>

              <div className="sm:col-span-7 space-y-3">
                {CHAIN_SIZES.map((s) => {
                  const isActive = hoveredSize === s.cm;
                  return (
                    <button
                      key={s.cm}
                      type="button"
                      onMouseEnter={() => setHoveredSize(s.cm)}
                      onClick={() => setHoveredSize(s.cm)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        isActive
                          ? 'border-[#D4113C] bg-[#D4113C]/10'
                          : 'border-white/10 bg-[#121214] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-white">{s.cm}</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#F43F5E]">
                          {s.fit}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#A1A1AA]">{s.note}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-4 text-base text-[#C4C9D2] leading-relaxed">
              <p>
                La <strong className="text-white">Plata Italy 925</strong> es un metal noble que
                puede oscurecerse naturalmente con el uso debido al pH de la piel, humedad o
                perfumes. Esto confirma su autenticidad y es completamente reversible.
              </p>
              <ul className="space-y-2.5 text-sm text-[#A1A1AA] list-disc pl-5">
                <li>Evita el contacto directo con perfumes, cremas, cloro o agua de mar.</li>
                <li>Guarda tus piezas individualmente en su bolsa o estuche seco.</li>
                <li>Límpialas suavemente con un paño pulidor de joyería para recuperar su brillo.</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-base text-[#C4C9D2] leading-relaxed">
              <p>
                Despachamos a todo Chile mediante <strong className="text-white">Starken</strong> y
                ofrecemos entregas coordinadas en estaciones de{' '}
                <strong className="text-white">Metro de Santiago</strong>.
              </p>
              <ul className="space-y-2.5 text-sm text-[#A1A1AA] list-disc pl-5">
                <li>Pagos 100% protegidos vía Flow.cl (Webpay, tarjetas y transferencia).</li>
                <li>Garantía legal de satisfacción y revisión de calidad previa al envío.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
