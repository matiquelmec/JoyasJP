export type BlackFridayState = 'soon' | 'live' | 'over'

export interface BlackFridaySnapshot {
  state: BlackFridayState
  days: number
  hours: number
  minutes: number
  seconds: number
  formattedShort: string
}

export const BLACK_FRIDAY_CONFIG = {
  offerLabel: 'hasta 30% OFF',
  startIso: '2026-11-27T00:00:00-03:00',
  endIso: '2026-11-30T23:59:59-03:00',
  dateRangeLabel: '27 al 30 de noviembre de 2026',
  startNote: 'Viernes 27 de noviembre, 00:00 h (hora de Chile).',
  liveNote: 'Hasta el lunes 30 de noviembre, 23:59 h, o hasta agotar stock.',
  overNote: 'Mira la colección completa en joyasjp.cl.',
  categories: [
    { label: 'Plata Italiana 925', href: '/productos?categoria=plata-925' },
    { label: 'Acero Quirúrgico', href: '/productos?categoria=acero-inoxidable' },
    { label: 'Aleación de Zinc', href: '/productos?categoria=aleacion-zinc' },
    { label: 'Relojes', href: '/productos?categoria=relojes' },
  ],
  ticker: [
    'ATRÉVETE A JUGAR',
    'BLACK FRIDAY 2026',
    'PLATA ITALIANA 925',
    'JOYERÍA URBANA',
    'DESCUENTOS EN PIEZAS SELECCIONADAS',
  ],
} as const

export function padTwoDigits(n: number): string {
  const safe = Math.max(0, Math.floor(n))
  return safe < 10 ? `0${safe}` : String(safe)
}

export function getBlackFridayState(nowMs: number = Date.now()): BlackFridaySnapshot {
  const startMs = new Date(BLACK_FRIDAY_CONFIG.startIso).getTime()
  const endMs = new Date(BLACK_FRIDAY_CONFIG.endIso).getTime()

  let state: BlackFridayState
  let targetMs: number

  if (nowMs < startMs) {
    state = 'soon'
    targetMs = startMs
  } else if (nowMs <= endMs) {
    state = 'live'
    targetMs = endMs
  } else {
    state = 'over'
    targetMs = nowMs
  }

  const diffMs = Math.max(0, targetMs - nowMs)
  const totalSec = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  const timeStr = `${days}d ${padTwoDigits(hours)}:${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`
  const formattedShort =
    state === 'soon'
      ? `Empieza en ${timeStr}`
      : state === 'live'
        ? `Termina en ${timeStr}`
        : 'Campaña finalizada'

  return {
    state,
    days,
    hours,
    minutes,
    seconds,
    formattedShort,
  }
}

/**
 * Calcula un precio de oferta CLP limpio (redondeado a múltiplos de $100)
 * garantizando siempre que 0 < discountPrice < price.
 */
export function calculateBlackFridayDiscountPrice(price: number, discountPercent: number): number {
  const cleanPrice = Math.round(Number(price))
  if (!Number.isFinite(cleanPrice) || cleanPrice <= 100) {
    return Math.max(1, cleanPrice - 1)
  }
  const clampedPercent = Math.min(70, Math.max(5, Number(discountPercent)))
  const rawDiscounted = cleanPrice * (1 - clampedPercent / 100)
  let rounded = Math.round(rawDiscounted / 100) * 100
  if (rounded >= cleanPrice) {
    rounded = Math.max(100, cleanPrice - 100)
  }
  if (rounded <= 0) {
    rounded = Math.max(1, Math.floor(rawDiscounted))
  }
  return rounded
}
