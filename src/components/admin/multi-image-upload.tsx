'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Image as ImageIcon, AlertCircle, Star, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminAuth } from '@/components/admin/admin-auth-provider'
import { cn } from '@/lib/utils'

interface MultiImageUploadProps {
  onImagesChange: (images: string[]) => void
  currentImages?: string[]
  disabled?: boolean
  category?: string
  productCode?: string
  maxImages?: number
}

export function MultiImageUpload({ 
  onImagesChange, 
  currentImages = [], 
  disabled, 
  category = 'otros', 
  productCode,
  maxImages = 6
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [images, setImages] = useState<string[]>(currentImages)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token } = useAdminAuth()

  // Sincronizar estado interno con props cuando cambia el producto (edición)
  useEffect(() => {
    setImages(currentImages || [])
  }, [currentImages])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      toast.error('Límite alcanzado', {
        description: `Solo puedes subir hasta ${maxImages} imágenes por producto.`,
      })
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    
    setUploading(true)
    
    for (const file of filesToUpload) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error(`Archivo inválido: ${file.name}`, {
          description: 'Solo se permiten archivos JPEG, PNG y WebP.',
        })
        continue
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error(`Archivo muy grande: ${file.name}`, {
          description: 'El tamaño máximo permitido es 5MB.',
        })
        continue
      }

      await uploadFile(file)
    }
    
    setUploading(false)
    setUploadProgress(0)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      if (productCode) {
        formData.append('productCode', productCode)
      }

      // Simulación de progreso
      setUploadProgress(10)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev))
      }, 100)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error uploading image')
      }

      const newImages = [...images, result.publicUrl]
      setImages(newImages)
      onImagesChange(newImages)

      toast.success('Imagen subida', {
        description: `${file.name} agregada a la galería.`,
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Intenta nuevamente'
      toast.error(`Error al subir ${file.name}`, {
        description: errorMessage,
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[newIndex]
    newImages[newIndex] = temp
    
    setImages(newImages)
    onImagesChange(newImages)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-bold">Galería de Imágenes ({images.length}/{maxImages})</Label>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            disabled={disabled || uploading}
            className="h-8"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Subiendo...' : 'Agregar Imágenes'}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        multiple
        disabled={disabled || uploading}
      />

      {images.length === 0 && !uploading ? (
        <div 
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-slate-50 transition-all cursor-pointer group"
          onClick={handleButtonClick}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-slate-300 group-hover:text-primary/50 mb-4 transition-colors" />
          <p className="text-sm font-medium text-slate-600">No hay imágenes en la galería</p>
          <p className="text-xs text-slate-400 mt-1">Haz clic para subir la imagen principal y adicionales</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div 
              key={`${img}-${index}`} 
              className={cn(
                "relative aspect-square rounded-lg border-2 overflow-hidden group transition-all",
                index === 0 ? "border-primary shadow-md" : "border-slate-200"
              )}
            >
              <Image
                src={img}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover"
              />
              
              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                    disabled={disabled || uploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6 rounded-md disabled:opacity-30"
                      onClick={() => moveImage(index, 'left')}
                      disabled={disabled || uploading || index === 0}
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6 rounded-md disabled:opacity-30"
                      onClick={() => moveImage(index, 'right')}
                      disabled={disabled || uploading || index === images.length - 1}
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {index === 0 && (
                    <div className="bg-primary text-white p-1 rounded-md" title="Imagen Principal">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </div>
              </div>

              {index === 0 && (
                <div className="absolute top-0 left-0 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-br-lg shadow-sm uppercase tracking-tighter">
                  Principal
                </div>
              )}
            </div>
          ))}
          
          {uploading && (
            <div className="aspect-square rounded-lg border-2 border-dashed border-primary/30 flex flex-col items-center justify-center bg-primary/5 animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
              <Progress value={uploadProgress} className="w-2/3 h-1" />
            </div>
          )}
        </div>
      )}

      {uploading && (
        <p className="text-xs text-center text-muted-foreground animate-pulse">
          Procesando imágenes, por favor espera...
        </p>
      )}

      <div className="flex items-start gap-2 p-3 bg-slate-50 border rounded-lg">
        <AlertCircle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="text-[11px] text-slate-600 leading-tight">
          <p className="font-bold mb-1">Guía de Galería:</p>
          <ul className="space-y-1">
            <li>• La <strong>primera imagen</strong> será la portada en el catálogo.</li>
            <li>• Usa las flechas para reordenar las imágenes.</li>
            <li>• Se recomienda subir al menos 3 ángulos diferentes.</li>
            <li>• Tamaño ideal: Cuadrado (1080x1080px).</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
