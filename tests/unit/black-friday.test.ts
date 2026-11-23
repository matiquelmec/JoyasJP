import { describe, expect, it } from 'vitest'
import {
  BLACK_FRIDAY_CONFIG,
  calculateBlackFridayDiscountPrice,
  getBlackFridayState,
} from '@/lib/black-friday'

describe('Black Friday 2026 campaign engine', () => {
  it('detects soon state before Nov 27 2026 00:00 Chile time', () => {
    const beforeStart = new Date('2026-11-23T15:00:00-03:00').getTime()
    const snap = getBlackFridayState(beforeStart)
    expect(snap.state).toBe('soon')
    expect(snap.days).toBe(3)
    expect(snap.hours).toBe(9)
    expect(snap.formattedShort).toContain('Empieza en 3d 09:00:00')
  })

  it('detects live state from Nov 27 00:00 through Nov 30 23:59 Chile time', () => {
    const duringLive = new Date('2026-11-28T12:00:00-03:00').getTime()
    const snap = getBlackFridayState(duringLive)
    expect(snap.state).toBe('live')
    expect(snap.days).toBe(2)
    expect(snap.formattedShort).toContain('Termina en 2d')

    const lastMinute = new Date('2026-11-30T23:59:59-03:00').getTime()
    expect(getBlackFridayState(lastMinute).state).toBe('live')
  })

  it('detects over state after Nov 30 2026 23:59:59 Chile time', () => {
    const afterEnd = new Date('2026-12-01T00:00:01-03:00').getTime()
    const snap = getBlackFridayState(afterEnd)
    expect(snap.state).toBe('over')
    expect(snap.days).toBe(0)
    expect(snap.formattedShort).toBe('Campaña finalizada')
  })

  it('calculates clean CLP discounted prices strictly below regular price', () => {
    expect(calculateBlackFridayDiscountPrice(20000, 20)).toBe(16000)
    expect(calculateBlackFridayDiscountPrice(14990, 30)).toBe(10500)
    expect(calculateBlackFridayDiscountPrice(50000, 15)).toBe(42500)
    expect(calculateBlackFridayDiscountPrice(2990, 10)).toBeLessThan(2990)
    expect(BLACK_FRIDAY_CONFIG.endIso).toBe('2026-11-30T23:59:59-03:00')
  })
})
