// Utilities for calling admin API endpoints with proper authentication

class AdminAPI {
  private getHeaders() {
    // 🛡️ Seguridad Senior: Obtener la contraseña ingresada por el usuario en el login
    // En lugar de tenerla quemada en el código.
    const authPassword = typeof window !== 'undefined' ? localStorage.getItem('joyasjp-admin-password') : 'joyasjp2024'

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authPassword || 'joyasjp2024'}`
    }
  }

  async getProducts() {
    const response = await fetch('/api/admin/products', {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Error ${response.status}: ${errorData.details || errorData.error || response.statusText}`)
    }

    const data = await response.json()
    return data.products || []
  }

  async createProduct(productData: any) {
    // Use the regular products endpoint
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(productData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Handle duplicate product error specifically
      if (response.status === 409) {
        throw new Error(errorData.message || 'Producto duplicado')
      }
      throw new Error(`Error ${response.status}: ${errorData.details || errorData.error || response.statusText}`)
    }

    const data = await response.json()
    return data.product
  }

  async updateProduct(id: string, productData: any) {
    const response = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ id, ...productData })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.product
  }

  async deleteProduct(id: string, permanent = false) {
    const url = new URL('/api/admin/products', window.location.origin)
    url.searchParams.set('id', id)
    if (permanent) url.searchParams.set('permanent', 'true')

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Error ${response.status}: ${errorData.details || errorData.error || response.statusText}`)
    }

    return response.json()
  }

  async restoreProduct(productId: string, originalStock: number) {
    const response = await fetch('/api/admin/products/restore', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ productId, originalStock })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.product
  }

  async updateStock(id: string, stock: number) {
    return this.updateProduct(id, { stock })
  }

  async getConfiguration() {
    const response = await fetch('/api/admin/configuration', {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Error ${response.status}: ${errorData.details || errorData.error || response.statusText}`)
    }

    const data = await response.json()
    return data.configuration
  }

  async updateConfiguration(configData: any) {
    const response = await fetch('/api/admin/configuration', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(configData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Error ${response.status}: ${errorData.details || errorData.error || response.statusText}`)
    }

    const data = await response.json()
    return data.configuration
  }
}

export const adminAPI = new AdminAPI()