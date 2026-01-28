'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getSafeUrl } from '@/lib/safe-asset'

export function Preloader() {
    const [isVisible, setIsVisible] = useState(true)
    const [isFading, setIsFading] = useState(false)

    useEffect(() => {
        // 1. Iniciar fade-out después de 2.5s
        const fadeTimer = setTimeout(() => {
            setIsFading(true)
        }, 2500)

        // 2. Desmontar completamente después de 3.2s (2.5s + 0.7s transición)
        const removeTimer = setTimeout(() => {
            setIsVisible(false)
        }, 3200)

        // Optimización: Preload del video nativo sin bloquear
        if (typeof window !== 'undefined') {
            const videoUrl = getSafeUrl('mi-video.mp4')
            if (!document.querySelector(`link[href="${videoUrl}"]`)) {
                const link = document.createElement('link')
                link.rel = 'preload'
                link.as = 'video'
                link.href = videoUrl
                document.head.appendChild(link)
            }
        }

        return () => {
            clearTimeout(fadeTimer)
            clearTimeout(removeTimer)
        }
    }, [])

    if (!isVisible) return null

    return (
        <div
            className={`
        fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden
        transition-opacity duration-700 ease-in-out
        ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
        >
            {/* Contenedor central */}
            <div className="relative flex flex-col items-center justify-center text-center px-4">

                {/* Logo con respiración CSS */}
                <div className="relative mb-8 animate-breathing">
                    <Image
                        src={getSafeUrl('logo.webp')}
                        alt="Joyas JP"
                        width={320}
                        height={320}
                        priority
                        className="w-48 md:w-60 lg:w-72 h-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    />
                </div>

                {/* Texto con efecto fade-in escalonado */}
                <div className="relative flex gap-[0.1em]">
                    {"ATRÉVETE A JUGAR".split("").map((char, index) => (
                        <span
                            key={index}
                            className="text-white text-xl md:text-2xl font-light tracking-[0.2em] uppercase opacity-0 animate-fadeIn"
                            style={{
                                animationDelay: `${1.2 + index * 0.08}s`,
                                animationFillMode: 'forwards'
                            }}
                        >
                            {char === " " ? "\u00A0" : char}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
