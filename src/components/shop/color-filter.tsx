'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColorFilterProps {
  colors: string[]
  activeColor: string
  onColorChange: (color: string) => void
  className?: string
}

const getColorIndicator = (color: string) => {
  const colorMap: { [key: string]: string } = {
    dorado: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600',
    plateado: 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500',
    negro: 'bg-gradient-to-r from-gray-700 via-gray-800 to-black',
    mixto: 'bg-gradient-to-r from-yellow-400 via-gray-400 to-gray-800'
  }

  return colorMap[color.toLowerCase()] || 'bg-gradient-to-r from-gray-400 to-gray-600'
}

const getColorLabel = (color: string) => {
  if (color === 'all') return 'Todos los colores'
  return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()
}

export function ColorFilter({ colors, activeColor, onColorChange, className }: ColorFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleColorSelect = (color: string) => {
    onColorChange(color)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent, color?: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (color) {
        handleColorSelect(color)
      } else {
        setIsOpen(!isOpen)
      }
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Label removed for better alignment with search bar */}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => handleKeyDown(e)}
        className={cn(
          "w-full md:w-[180px] flex items-center justify-between gap-2 px-3 h-10 rounded-md",
          "border border-input bg-background text-foreground", // Match input border/bg
          "hover:border-primary/50 hover:bg-primary/5",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "transition-all duration-200 text-sm font-medium",
          "color-dropdown-trigger"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Selector de color"
      >
        <div className="flex items-center gap-2 flex-1">
          {activeColor !== 'all' && (
            <div
              className={cn(
                "w-4 h-4 rounded-full border border-gray-300 shadow-sm flex-shrink-0",
                getColorIndicator(activeColor)
              )}
            />
          )}
          <span className="truncate">{getColorLabel(activeColor)}</span>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 mt-1 w-[180px] z-50",
          "bg-background border-2 border-border rounded-lg shadow-xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "max-h-60 overflow-y-auto"
        )}>
          <div className="p-1" role="listbox">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                onKeyDown={(e) => handleKeyDown(e, color)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                  "hover:bg-primary/10 hover:text-foreground",
                  "focus:outline-none focus:bg-primary/10",
                  "transition-colors duration-150 text-left",
                  activeColor === color && "bg-primary/20 text-foreground font-medium"
                )}
                role="option"
                aria-selected={activeColor === color}
                tabIndex={isOpen ? 0 : -1}
              >
                {color !== 'all' && (
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border border-gray-300 shadow-sm flex-shrink-0",
                      getColorIndicator(color)
                    )}
                  />
                )}
                <span className="flex-1">{getColorLabel(color)}</span>
                {activeColor === color && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}