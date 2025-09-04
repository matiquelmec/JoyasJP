'use client'

import { useEffect, useState } from 'react'
import { getProducts, getColors } from '@/lib/api'
import type { Product } from '@/lib/types'
import { normalizeColor } from '@/lib/utils'

export function ColorDebug() {
  const [products, setProducts] = useState<Product[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedColors] = await Promise.all([
          getProducts(),
          getColors(),
        ])
        
        setProducts(fetchedProducts)
        setColors(fetchedColors)
      } catch (error) {
        console.error('Error fetching debug data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-4 bg-yellow-100 border">Cargando debug info...</div>
  }

  const colorStats = products.reduce((acc, product) => {
    const originalColor = product.color
    const normalizedColor = normalizeColor(product.color)
    
    if (originalColor) {
      if (!acc[originalColor]) {
        acc[originalColor] = { count: 0, normalized: normalizedColor, products: [] }
      }
      acc[originalColor].count++
      acc[originalColor].products.push({
        id: product.id,
        name: product.name,
        category: product.category
      })
    }
    return acc
  }, {} as Record<string, { count: number, normalized: string, products: Array<{id: string, name: string, category: string}> }>)

  return (
    <div className="fixed top-0 right-0 w-96 h-screen overflow-y-auto bg-black/90 text-white text-xs p-4 z-[9999]">
      <h2 className="text-lg font-bold mb-4">🔍 Debug: Colores desde DB</h2>
      
      <div className="mb-6">
        <h3 className="font-bold mb-2">📊 Resumen:</h3>
        <p>Total productos: {products.length}</p>
        <p>Colores únicos desde getColors(): {colors.length}</p>
        <p>Colores únicos en productos: {Object.keys(colorStats).length}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">🎨 Colores disponibles (desde API):</h3>
        <ul className="space-y-1">
          {colors.map(color => (
            <li key={color} className="bg-blue-900 p-1 rounded">
              {color}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">🔄 Análisis de colores en productos:</h3>
        {Object.entries(colorStats).map(([originalColor, data]) => (
          <div key={originalColor} className="mb-3 bg-gray-800 p-2 rounded">
            <div className="font-bold">
              Original: "{originalColor}" → Normalizado: "{data.normalized}"
            </div>
            <div className="text-yellow-300">Productos: {data.count}</div>
            <div className="ml-2 text-xs">
              {data.products.slice(0, 3).map(p => (
                <div key={p.id}>[{p.category}] {p.name}</div>
              ))}
              {data.products.length > 3 && <div>...y {data.products.length - 3} más</div>}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-bold mb-2">🚫 Productos SIN color:</h3>
        {products.filter(p => !p.color).slice(0, 5).map(product => (
          <div key={product.id} className="text-red-300 mb-1">
            [{product.category}] {product.name}
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => document.querySelector('.color-debug')?.remove()}
        className="mt-4 bg-red-600 px-3 py-1 rounded text-white"
      >
        Cerrar Debug
      </button>
    </div>
  )
}