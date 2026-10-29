// Cliente tipado para endpoints de administración autenticado vía Cookie HttpOnly JWT (joyasjp_admin_session)

class AdminAPI {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
    }
  }

  private handleUnauthorized(response: Response) {
    if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
  }

  async getProducts() {
    const response = await fetch('/api/admin/products', {
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Error ${response.status}: ${errorData.details || errorData.error || response.statusText}`)
    }

    const data = await response.json()
    return data.products
  }

  async createProduct(productData: any) {
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      const errorData = await response.json().catch(() => ({}))
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
      credentials: 'include',
      body: JSON.stringify({ id, ...productData }),
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
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
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.success
  }

  async restoreProduct(id: string) {
    const response = await fetch('/api/admin/products/restore', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ id }),
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.product
  }

  async updateStock(productId: string, stock: number) {
    const response = await fetch('/api/admin/products/stock', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ id: productId, stock }),
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async getOrders() {
    const response = await fetch('/api/admin/orders', {
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.orders
  }

  async updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
    const response = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ orderId, status, trackingNumber }),
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.order
  }

  async getConfiguration() {
    const response = await fetch('/api/admin/configuration', {
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
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
      credentials: 'include',
      body: JSON.stringify(configData),
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Error ${response.status}: ${errorData.details || errorData.error || response.statusText}`)
    }

    const data = await response.json()
    return data.configuration
  }

  async getCoupons() {
    const response = await fetch('/api/admin/coupons', {
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Error ${response.status}: ${errorData.details || errorData.error || response.statusText}`)
    }

    const data = await response.json()
    return data.coupons
  }

  async createCoupon(couponData: any) {
    const response = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(couponData),
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al crear cupón')
    }

    return response.json()
  }

  async updateCoupon(couponData: any) {
    const response = await fetch('/api/admin/coupons', {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(couponData),
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al actualizar cupón')
    }

    return response.json()
  }

  async deleteCoupon(code: string) {
    const url = new URL('/api/admin/coupons', window.location.origin)
    url.searchParams.set('code', code)

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      this.handleUnauthorized(response)
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al eliminar cupón')
    }

    return response.json()
  }
}

export const adminAPI = new AdminAPI()
