'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { normalizeColor } from '@/lib/utils'

interface ProductDB {
  id: string
  name: string
  category: string
  color: string
  stock: number
}

export function CategoryColorDebug() {
  const [products, setProducts] = useState<ProductDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDirectFromDB = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase no disponible')
        }

        // Obtener datos DIRECTOS de la base de datos sin ningún filtro
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, color, stock')
          .gt('stock', 0)
          .order('category')
          .order('name')

        if (error) {
          throw error
        }

        setProducts(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Error fetching direct DB data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDirectFromDB()
  }, [])

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-900 text-white p-4 rounded-lg z-[9999]">
        🔄 Cargando datos directos de BD...
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-900 text-white p-4 rounded-lg z-[9999] max-w-md">
        ❌ Error: {error}
      </div>
    )
  }

  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, ProductDB[]>)

  const colorAnalysisByCategory = Object.entries(productsByCategory).map(([category, categoryProducts]) => {
    const colorCounts = categoryProducts.reduce((acc, product) => {
      const originalColor = product.color || 'SIN_COLOR'
      const normalizedColor = normalizeColor(product.color) || 'SIN_COLOR_NORM'
      
      if (!acc[originalColor]) {
        acc[originalColor] = {
          original: originalColor,
          normalized: normalizedColor,
          count: 0,
          products: []
        }
      }
      acc[originalColor].count++
      acc[originalColor].products.push({
        id: product.id,
        name: product.name,
        stock: product.stock
      })
      
      return acc
    }, {} as Record<string, any>)

    return {
      category,
      totalProducts: categoryProducts.length,
      colors: Object.values(colorCounts),
      uniqueColors: Object.keys(colorCounts).length
    }
  })

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-black/95 text-white text-xs overflow-y-auto z-[9999] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🔍 Análisis DIRECTO de Base de Datos</h1>
          <button 
            onClick={() => document.querySelector('.category-debug')?.remove()}
            className="bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700"
          >
            ✕ Cerrar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {colorAnalysisByCategory.map(({ category, totalProducts, colors, uniqueColors }) => (
            <div key={category} className="bg-gray-800 rounded-lg p-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded p-3 mb-4">
                <h2 className="text-lg font-bold uppercase">{category}</h2>
                <p>📊 {totalProducts} productos • {uniqueColors} colores únicos</p>
              </div>

              <div className="space-y-3">
                {colors.map((colorData: any, index: number) => (
                  <div key={index} className="bg-gray-700 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-yellow-300">
                          DB: "{colorData.original}"
                        </div>
                        <div className="text-green-300">
                          Normalizado: "{colorData.normalized}"
                        </div>
                      </div>
                      <div className="bg-blue-600 px-2 py-1 rounded text-xs">
                        {colorData.count} productos
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      {colorData.products.slice(0, 3).map((product: any) => (
                        <div key={product.id} className="text-gray-300 text-xs">
                          • {product.name} (stock: {product.stock})
                        </div>
                      ))}
                      {colorData.products.length > 3 && (
                        <div className="text-gray-400 text-xs italic">
                          ...y {colorData.products.length - 3} productos más
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-yellow-900 border border-yellow-600 rounded p-4">
          <h3 className="font-bold text-yellow-300 mb-2">🚨 Buscar anomalías:</h3>
          <ul className="text-yellow-100 text-sm space-y-1">
            <li>• ¿Hay colores que deberían estar normalizados pero no lo están?</li>
            <li>• ¿Todas las pulseras realmente son plateadas en la BD?</li>
            <li>• ¿Hay productos con colores vacíos o nulos?</li>
            <li>• ¿Los colores originales están bien escritos?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}