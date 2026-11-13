'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Ruler, ShieldCheck, Truck, ArrowRight, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  { label: 'Cadenas', value: 'cadenas' },
  { label: 'Plata Italy 925', value: 'plata-925' },
  { label: 'Dijes', value: 'dijes' },
  { label: 'Pulseras', value: 'pulseras' },
  { label: 'Aros', value: 'aros' },
  { label: 'Sets & Conjuntos', value: 'conjuntos' },
  { label: 'Relojes', value: 'relojes' },
  { label: 'Enchapado de Plata', value: 'enchapado-plata' },
];

const MATERIALS = [
  { label: 'Plata 925 Certificada', value: 'plata-925' },
  { label: 'Acero Quirúrgico', value: 'acero' },
  { label: 'Aleación & Diseño', value: 'aleacion' },
  { label: 'Cualquier Material', value: 'all' },
];

const BUDGETS = [
  { label: 'Hasta $25.000', value: '25000' },
  { label: 'Hasta $50.000', value: '50000' },
  { label: 'Hasta $90.000', value: '90000' },
  { label: 'Sin límite', value: '' },
];

const CHAIN_SIZES = [
  {
    cm: '45 cm',
    fit: 'Al cuello / Clavícula',
    note: 'Ideal para uso diario sutil o cuellos delgados. Queda justo sobre la clavícula.',
  },
  {
    cm: '50 cm',
    fit: 'Estándar clásico',
    note: 'El largo más versátil. Cae ligeramente bajo la clavícula; perfecto con o sin dije.',
  },
  {
    cm: '55 cm',
    fit: 'Medio pecho',
    note: 'Presencia marcada sobre poleras o camisas abiertas. Gran equilibrio para dijes medianos.',
  },
  {
    cm: '60 cm',
    fit: 'Largo statement',
    note: 'Caída protagonista al centro del pecho. Ideal para eslabones cubanos o layering.',
  },
];

export function StyleFinderAndCare() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<string>('cadenas');
  const [material, setMaterial] = useState<string>('plata-925');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sizes' | 'care' | 'shipping'>('sizes');

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
      className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* 3-Step Interactive Style Finder */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#121214] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F43F5E]">
                <Sparkles className="w-3.5 h-3.5" />
                Asistente de Estilo
              </p>
              <h2
                id="finder-care-heading"
                className="mt-1 text-2xl sm:text-3xl font-bold font-body text-white"
              >
                Encuentra tu Pieza en 3 Pasos
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#A1A1AA] bg-[#09090B] border border-white/10 rounded-full px-3 py-1">
              Paso {step} de 3
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-[#09090B] overflow-hidden mb-8">
            <div
              className="h-full bg-[#D4113C] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {step === 1 && (
            <div>
              <p className="text-sm font-medium text-[#C4C9D2] mb-4">
                1. ¿Qué tipo de pieza estás buscando hoy?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setCategory(item.value);
                      setStep(2);
                    }}
                    className={`min-h-[48px] rounded-xl border px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                      category === item.value
                        ? 'border-[#D4113C] bg-[#D4113C]/15 text-white'
                        : 'border-white/10 bg-[#09090B] text-[#C4C9D2] hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm font-medium text-[#C4C9D2] mb-4">
                2. Elige tu material preferido:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MATERIALS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setMaterial(item.value);
                      setStep(3);
                    }}
                    className={`min-h-[48px] rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                      material === item.value
                        ? 'border-[#D4113C] bg-[#D4113C]/15 text-white'
                        : 'border-white/10 bg-[#09090B] text-[#C4C9D2] hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Volver al paso anterior
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm font-medium text-[#C4C9D2] mb-4">
                3. Define tu presupuesto estimado:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUDGETS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleFinishFinder(item.value)}
                    className={`min-h-[48px] flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                      maxPrice === item.value
                        ? 'border-[#D4113C] bg-[#D4113C] text-white'
                        : 'border-white/10 bg-[#09090B] text-[#C4C9D2] hover:border-[#D4113C] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Volver al paso anterior
              </button>
            </div>
          )}
        </div>

        {/* Interactive Size Guide & Silver 925 Care */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#121214] p-6 sm:p-8">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('sizes')}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                activeTab === 'sizes'
                  ? 'bg-[#D4113C] text-white'
                  : 'bg-[#09090B] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Ruler className="w-4 h-4" />
              Guía de Largos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('care')}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                activeTab === 'care'
                  ? 'bg-[#D4113C] text-white'
                  : 'bg-[#09090B] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Cuidado Plata 925
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#D4113C] ${
                activeTab === 'shipping'
                  ? 'bg-[#D4113C] text-white'
                  : 'bg-[#09090B] text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              Envíos & Garantía
            </button>
          </div>

          {activeTab === 'sizes' && (
            <div className="space-y-3">
              {CHAIN_SIZES.map((s) => (
                <div
                  key={s.cm}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#09090B] p-4"
                >
                  <div>
                    <span className="text-base font-bold text-white">{s.cm}</span>
                    <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-[#F43F5E]">
                      {s.fit}
                    </span>
                    <p className="mt-1 text-xs text-[#A1A1AA]">{s.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-4 text-sm text-[#C4C9D2] leading-relaxed">
              <p>
                La <strong className="text-white">Plata Italy 925</strong> es un metal noble que
                puede oscurecerse naturalmente con el uso debido al pH de la piel, humedad o
                perfumes. Esto confirma su autenticidad y es completamente reversible.
              </p>
              <ul className="space-y-2 text-xs text-[#A1A1AA] list-disc pl-5">
                <li>Evita el contacto directo con perfumes, cremas, cloro o agua de mar.</li>
                <li>Guarda tus piezas individualmente en su bolsa o estuche seco.</li>
                <li>Límpialas suavemente con un paño pulidor de joyería para recuperar su brillo.</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-sm text-[#C4C9D2] leading-relaxed">
              <p>
                Despachamos a todo Chile mediante <strong className="text-white">Starken</strong> y
                ofrecemos entregas coordinadas en estaciones de{' '}
                <strong className="text-white">Metro de Santiago</strong>.
              </p>
              <ul className="space-y-2 text-xs text-[#A1A1AA] list-disc pl-5">
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
