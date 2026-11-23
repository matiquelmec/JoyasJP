'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { JoyasJPLogo } from '@/components/ui/JoyasJPLogo'
import {
  BLACK_FRIDAY_CONFIG,
  getBlackFridayState,
  padTwoDigits,
  type BlackFridaySnapshot,
} from '@/lib/black-friday'

const TICKER_ITEMS = [
  ...BLACK_FRIDAY_CONFIG.ticker,
  ...BLACK_FRIDAY_CONFIG.ticker,
  ...BLACK_FRIDAY_CONFIG.ticker,
  ...BLACK_FRIDAY_CONFIG.ticker,
]

export function BlackFridayShowcase() {
  const [snapshot, setSnapshot] = useState<BlackFridaySnapshot | null>(null)

  useEffect(() => {
    setSnapshot(getBlackFridayState())
    const timer = setInterval(() => {
      setSnapshot(getBlackFridayState())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Si la campaña ya terminó, el bloque se auto-oculta sin intervención manual
  if (snapshot?.state === 'over') {
    return null
  }

  const isLive = snapshot?.state === 'live'
  const ctaHref = isLive ? '/productos?ofertas=true' : '/productos'

  return (
    <section
      aria-label="Campaña Black Friday 2026"
      className="relative z-10 overflow-hidden isolate min-h-[560px] flex items-center px-5 sm:px-10 lg:px-20 pt-14 pb-24 border-y border-white/10"
      style={{
        background:
          'radial-gradient(900px 480px at 78% 30%, rgba(212,17,60,0.34), transparent 70%), radial-gradient(600px 360px at 8% 100%, rgba(212,17,60,0.16), transparent 70%), #09090B',
      }}
    >
      {/* Anillos concéntricos giratorios estilo eslabones */}
      <div
        aria-hidden="true"
        className="bf-chain pointer-events-none absolute -z-10 -right-[220px] md:-right-[140px] top-1/2 w-[min(620px,95vw)] aspect-square -translate-y-1/2 rounded-full opacity-35 md:opacity-50"
      />
      <div
        aria-hidden="true"
        className="bf-chain bf-chain-inner pointer-events-none absolute -z-10 -right-[90px] md:-right-[30px] top-1/2 w-[min(430px,70vw)] aspect-square -translate-y-1/2 rounded-full opacity-25"
      />

      <div className="mx-auto w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
        {/* Columna Izquierda: Identidad + Oferta + Chips */}
        <div>
          <div className="inline-flex items-center">
            <JoyasJPLogo variant="horizontal" color="blanco" size="sm" asLink={false} />
          </div>

          <h2 className="mt-4 font-body font-bold tracking-[-0.01em] leading-none text-white text-[clamp(44px,8.4vw,100px)]">
            Black
            <span className="block text-[#D4113C]">Friday</span>
          </h2>

          <p className="mt-4 font-headline font-black text-white text-[clamp(24px,3.4vw,42px)]">
            {BLACK_FRIDAY_CONFIG.dateRangeLabel}
          </p>

          <p className="mt-3.5 max-w-[46ch] text-[#A1A1AA] text-base sm:text-lg leading-relaxed">
            Plata italiana 925 y piezas de diseño con precio de Black Friday. Elige tu pieza, mira
            el peso y el material, y <strong className="text-[#C4C9D2]">atrévete a jugar</strong>.
          </p>

          <div className="mt-5 inline-flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-[#D4113C] px-3.5 py-1.5 text-base sm:text-lg font-bold text-white uppercase tracking-wide">
              {BLACK_FRIDAY_CONFIG.offerLabel}
            </span>
            <span className="text-sm sm:text-[15px] text-[#A1A1AA] line-through">
              Precios normales tachados en cada pieza
            </span>
          </div>

          <div className="mt-7">
            <Link
              href={ctaHref}
              className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] bg-[#D4113C] px-8 py-3.5 text-base sm:text-[17px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#B80E33] hover:shadow-[0_10px_34px_rgba(212,17,60,0.45)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
            >
              {isLive ? 'Ver ofertas Black Friday' : 'Explorar colección'}
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2.5 list-none p-0">
            {BLACK_FRIDAY_CONFIG.categories.map((cat) => (
              <li key={cat.href}>
                <Link
                  href={cat.href}
                  className="inline-flex min-h-[38px] items-center rounded-full border border-[#F43F5E]/45 bg-[#D4113C]/10 px-3.5 py-1.5 text-sm font-medium text-[#F43F5E] transition-colors hover:bg-[#D4113C]/25 hover:text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#F43F5E]"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna Derecha: Cuenta Regresiva Editorial */}
        <aside
          aria-live="polite"
          className="rounded-[18px] border border-white/10 bg-[#121214]/85 p-6 sm:p-7 backdrop-blur-md shadow-2xl"
        >
          <h3 className="mb-4 text-sm sm:text-base font-bold uppercase tracking-wider text-[#C4C9D2]">
            {isLive ? 'Black Friday en curso · termina en' : 'Empieza en'}
          </h3>

          <div className="grid grid-cols-4 gap-2.5 text-center">
            {[
              { label: 'días', value: snapshot ? padTwoDigits(snapshot.days) : '--' },
              { label: 'horas', value: snapshot ? padTwoDigits(snapshot.hours) : '--' },
              { label: 'min', value: snapshot ? padTwoDigits(snapshot.minutes) : '--' },
              { label: 'seg', value: snapshot ? padTwoDigits(snapshot.seconds) : '--' },
            ].map((unit) => (
              <div
                key={unit.label}
                className="rounded-xl border border-white/[0.07] bg-[#09090B] px-1 py-3.5"
              >
                <strong
                  className={`block font-headline text-[clamp(28px,4.2vw,46px)] leading-[1.1] tabular-nums ${
                    isLive ? 'text-[#F43F5E]' : 'text-white'
                  }`}
                >
                  {unit.value}
                </strong>
                <small className="text-xs text-[#A1A1AA]">{unit.label}</small>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-[#A1A1AA]">
            {isLive ? BLACK_FRIDAY_CONFIG.liveNote : BLACK_FRIDAY_CONFIG.startNote}
          </p>
        </aside>
      </div>

      {/* Ticker Inferior Infinito */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-[#09090B]/85 py-2.5 whitespace-nowrap"
      >
        <div className="bf-ticker-track inline-flex gap-11 pl-11">
          {TICKER_ITEMS.map((text, idx) => (
            <span
              key={`${text}-${idx}`}
              className={`text-xs sm:text-sm font-bold tracking-[0.12em] ${
                idx % 2 === 1 ? 'text-[#F43F5E]' : 'text-[#C4C9D2]'
              }`}
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .bf-chain {
          background: repeating-conic-gradient(
            from 0deg,
            rgba(255, 255, 255, 0.16) 0 3deg,
            transparent 3deg 7deg
          );
          -webkit-mask: radial-gradient(circle, transparent 58%, #000 59% 70%, transparent 71%);
          mask: radial-gradient(circle, transparent 58%, #000 59% 70%, transparent 71%);
          animation: bf-spin 60s linear infinite;
        }
        .bf-chain-inner {
          animation-duration: 90s;
          animation-direction: reverse;
        }
        .bf-ticker-track {
          animation: bf-ticker 32s linear infinite;
        }
        @keyframes bf-spin {
          to {
            transform: translateY(-50%) rotate(360deg);
          }
        }
        @keyframes bf-ticker {
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bf-chain,
          .bf-ticker-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
