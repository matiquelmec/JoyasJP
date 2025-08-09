import Image from 'next/image'
import { getImageUrl } from '@/lib/asset-version'

export default function Loading() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 via-background to-zinc-900 text-foreground overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/10" />
      </div>
      
      {/* Logo with glow effect */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl scale-110" />
        <Image
          src={getImageUrl('logo.webp')}
          alt="Joyas JP"
          width={200}
          height={89}
          priority
          className="relative h-auto w-48 animate-pulse drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        />
      </div>

      {/* Loading animation */}
      <div className="flex items-center space-x-1 mb-4">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>

      {/* Text */}
      <h2 className="text-xl font-medium text-center mb-2 animate-pulse">
        Cargando experiencia premium
      </h2>
      <p className="text-sm text-muted-foreground animate-pulse">
        Preparando tu joyería exclusiva...
      </p>

      {/* Progress bar effect */}
      <div className="w-64 h-1 bg-zinc-800 rounded-full mt-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
      </div>
    </div>
  )
}
