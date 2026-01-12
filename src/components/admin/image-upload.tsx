'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { generateSlug } from '@/lib/slug-utils'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  currentImage?: string
  disabled?: boolean
  category?: string
  productCode?: string
}

export function ImageUpload({ onImageUploaded, currentImage, disabled, category = 'otros', productCode }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Tipo de archivo inválido',
        description: 'Solo se permiten archivos JPEG, PNG y WebP.',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Archivo muy grande',
        description: 'El tamaño máximo permitido es 5MB.',
        variant: 'destructive'
      })
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      
      // Add product code if available
      if (productCode) {
        formData.append('productCode', productCode)
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer joyasjp2024'
        },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error uploading image')
      }

      // Call parent callback with the public URL
      onImageUploaded(result.publicUrl)

      toast({
        title: 'Imagen subida exitosamente',
        description: `${result.fileName} guardada en ${category}/ (${(result.fileSize / 1024).toFixed(1)} KB)`,
      })

    } catch (error) {
    // console.error('Upload error:', error)
      toast({
        title: 'Error al subir imagen',
        description: error.message || 'Intenta nuevamente',
        variant: 'destructive'
      })
      
      // Reset preview on error
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Label>Imagen del Producto</Label>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload button or preview */}
      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={disabled || uploading}
            className="mb-2"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
          </Button>
          <p className="text-sm text-muted-foreground">
            JPEG, PNG o WebP (máx. 5MB)
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start gap-4">
              <Image
                src={preview}
                alt="Preview"
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-lg border"
                onError={(e) => {
    // console.error('Image preview error')
                  setPreview(null)
                }}
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Imagen seleccionada</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={disabled || uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleButtonClick}
                  disabled={disabled || uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Cambiar imagen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Progress value={uploadProgress} className="flex-1" />
            <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Subiendo imagen al servidor...
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Recomendaciones:</p>
          <ul className="text-xs space-y-1">
            <li>• Usa imágenes de alta calidad (mín. 800x800px)</li>
            <li>• Fondo neutro o blanco para mejor presentación</li>
            <li>• Formatos: JPEG (mejor compresión) o PNG (transparencias)</li>
            <li>• La imagen se guardará permanentemente en el servidor</li>
          </ul>
        </div>
      </div>
    </div>
  )
}