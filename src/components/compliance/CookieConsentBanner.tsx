'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ConsentRecord {
  consentId: string
  timestamp: string
  version: string
  essential: true
  analytics: boolean
  marketing: boolean
}

const CONSENT_STORAGE_KEY = 'joyasjp_cmp_consent_v1'
const POLICY_VERSION = '2026.1'

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showGranular, setShowGranular] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!saved) {
      setIsVisible(true)
    }
    const handleOpenCmp = () => {
      setIsVisible(true)
      setShowGranular(true)
    }
    window.addEventListener('joyasjp:open-cmp', handleOpenCmp)
    return () => window.removeEventListener('joyasjp:open-cmp', handleOpenCmp)
  }, [])

  const saveConsent = async (allowAnalytics: boolean, allowMarketing: boolean) => {
    const record: ConsentRecord = {
      consentId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      version: POLICY_VERSION,
      essential: true,
      analytics: allowAnalytics,
      marketing: allowMarketing,
    }
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
    setIsVisible(false)

    try {
      await fetch('/api/compliance/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
    } catch {
      // Ignorar error de red no crítico
    }
  }

  if (!isVisible) return null

  return (
    <aside
      role="dialog"
      aria-labelledby="cmp-title"
      aria-describedby="cmp-desc"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-[#09090B]/95 backdrop-blur-xl border-t border-zinc-800 shadow-2xl"
    >
      <div className="container mx-auto max-w-5xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[#F43F5E] text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacidad y Consentimiento (Ley N° 21.719)</span>
            </div>
            <h2 id="cmp-title" className="text-base sm:text-lg font-bold text-zinc-100">
              Respetamos tu privacidad y el control sobre tus datos personales
            </h2>
            <p id="cmp-desc" className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Utilizamos cookies estrictamente necesarias para el funcionamiento del carrito y procesamiento seguro de pagos con Flow.cl. Solo activaremos cookies de análisis o marketing si nos otorgas tu consentimiento expreso e informado. Puedes consultar nuestra{' '}
              <Link href="/privacidad" className="underline text-[#F43F5E] hover:text-[#F43F5E]/80">
                Política de Privacidad
              </Link>{' '}
              o modificar tus preferencias en cualquier momento desde el pie de página.
            </p>
          </div>

          {/* Opciones "Aceptar Todo" y "Rechazar Todo" con idéntico peso visual y jerarquía (sin dark patterns) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGranular(!showGranular)}
              className="min-h-[48px] px-4 border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 font-semibold text-xs uppercase tracking-wider"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Configurar
            </Button>
            <Button
              type="button"
              onClick={() => saveConsent(false, false)}
              className="min-h-[48px] px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 font-bold text-xs uppercase tracking-wider"
            >
              Rechazar Todo
            </Button>
            <Button
              type="button"
              onClick={() => saveConsent(true, true)}
              className="min-h-[48px] px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 font-bold text-xs uppercase tracking-wider"
            >
              Aceptar Todo
            </Button>
          </div>
        </div>

        {showGranular && (
          <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
              <div className="flex items-center justify-between font-bold text-zinc-100 mb-1">
                <span>1. Técnicas y Necesarias</span>
                <span className="text-emerald-400">Siempre Activas</span>
              </div>
              <p className="text-zinc-400">
                Indispensables para el funcionamiento del carrito de compras y la seguridad de los pagos en Flow.cl.
              </p>
            </div>

            <label className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 cursor-pointer flex flex-col justify-between">
              <div className="flex items-center justify-between font-bold text-zinc-100 mb-1">
                <span>2. Analíticas y Estadísticas</span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </div>
              <p className="text-zinc-400">
                Permiten evaluar el rendimiento y uso del catálogo de forma agregada. Desmarcadas por defecto.
              </p>
            </label>

            <label className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 cursor-pointer flex flex-col justify-between">
              <div className="flex items-center justify-between font-bold text-zinc-100 mb-1">
                <span>3. Publicidad y Personalización</span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </div>
              <p className="text-zinc-400">
                Muestran piezas y ofertas personalizadas en redes sociales. Desmarcadas por defecto.
              </p>
            </label>

            <div className="md:col-span-3 flex justify-end">
              <Button
                type="button"
                onClick={() => saveConsent(analytics, marketing)}
                className="min-h-[44px] px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider"
              >
                Guardar Preferencias
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
