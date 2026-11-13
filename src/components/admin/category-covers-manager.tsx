'use client'

import { useEffect, useState } from 'react'
import { Image as ImageIcon, Upload, Check, Loader2 } from 'lucide-react'
import { productConfig } from '@/lib/config'
import { Button } from '@/components/ui/button'

export function CategoryCoversManager() {
  const [covers, setCovers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/category-covers', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.covers) setCovers(data.covers)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const saveCover = async (categoryId: string, imageUrl: string) => {
    setSavingId(categoryId)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/category-covers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Error al guardar portada')
      }
      setCovers((prev) => ({ ...prev, [categoryId]: data.imageUrl }))
      setSavedId(categoryId)
      setTimeout(() => setSavedId(null), 2500)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar portada')
    } finally {
      setSavingId(null)
    }
  }

  const handleFileUpload = async (categoryId: string, file: File) => {
    setSavingId(categoryId)
    setErrorMsg(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok || !uploadData?.url) {
        throw new Error(uploadData?.error || 'Error subiendo imagen a Cloudinary')
      }
      await saveCover(categoryId, uploadData.url)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error subiendo imagen')
      setSavingId(null)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#F43F5E]" />
            Portadas de Categorías (Grilla Bento)
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Sube portadas personalizadas con compresión automática WebP/AVIF vía Cloudinary. Si no
            subes una, se usa la foto del producto prioritario de la categoría.
          </p>
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-[#A1A1AA]" />}
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-[#F43F5E]/40 bg-[#D4113C]/10 px-4 py-2.5 text-xs text-[#F43F5E]">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {productConfig.categories.map((cat) => {
          const currentUrl = covers[cat.id] || ''
          const isSaving = savingId === cat.id
          const isSaved = savedId === cat.id

          return (
            <div
              key={cat.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#09090B] p-4"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#121214] flex items-center justify-center">
                {currentUrl ? (
                  <img
                    src={currentUrl}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#A1A1AA]/50" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{cat.name}</p>
                <p className="text-[11px] text-[#A1A1AA] truncate">ID: {cat.id}</p>

                <div className="mt-2 flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-[#121214] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#D4113C] transition-colors">
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isSaved ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#F43F5E]" />
                    )}
                    <span>{isSaving ? 'Subiendo...' : isSaved ? 'Guardado' : 'Subir Imagen'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={isSaving}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(cat.id, file)
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
