'use client'

import { cn } from '@/lib/utils'

interface ColorFilterProps {
  colors: string[]
  activeColor: string
  onColorChange: (color: string) => void
  className?: string
}

const getColorIndicator = (color: string) => {
  const colorMap: { [key: string]: string } = {
    dorado: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 color-gradient-animate',
    plateado: 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 color-gradient-animate', 
    negro: 'bg-gradient-to-r from-gray-700 via-gray-800 to-black',
    mixto: 'bg-gradient-to-r from-yellow-400 via-gray-400 to-gray-800 color-gradient-animate'
  }
  
  return colorMap[color.toLowerCase()] || 'bg-gradient-to-r from-gray-400 to-gray-600'
}

const getColorLabel = (color: string) => {
  if (color === 'all') return 'Todos'
  return color.charAt(0).toUpperCase() + color.slice(1)
}

export function ColorFilter({ colors, activeColor, onColorChange, className }: ColorFilterProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-sm font-medium text-muted-foreground">
        Filtrar por color:
      </span>
      
      <div className="flex flex-wrap gap-2 color-filter-container">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "border-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "color-filter-button",
              activeColor === color
                ? "border-primary bg-primary/10 text-foreground shadow-lg scale-105 color-filter-active"
                : "border-border bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
            )}
            aria-pressed={activeColor === color}
            aria-label={`Filtrar por color: ${getColorLabel(color)}`}
          >
            {color !== 'all' && (
              <div 
                className={cn(
                  "w-4 h-4 rounded-full border border-gray-300 shadow-sm",
                  getColorIndicator(color)
                )}
                aria-hidden="true"
              />
            )}
            <span>{getColorLabel(color)}</span>
            {activeColor === color && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
      
      {/* Indicador de filtro activo */}
      {activeColor !== 'all' && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Mostrando productos en color: {getColorLabel(activeColor)}</span>
        </div>
      )}
    </div>
  )
}