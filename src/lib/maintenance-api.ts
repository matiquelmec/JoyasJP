// Cliente API para funciones de mantenimiento del sistema

class MaintenanceAPI {
  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('joyasjp-admin-token') || '' : ''
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  // Obtener salud del sistema
  async getSystemHealth() {
    try {
      const response = await fetch('/api/admin/maintenance/system-health', {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.systemHealth
    } catch (error) {
      // console.error('Error fetching system health:', error)
      throw error
    }
  }

  // Obtener tareas de mantenimiento
  async getMaintenanceTasks() {
    try {
      const response = await fetch('/api/admin/maintenance/tasks', {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.tasks
    } catch (error) {
      // console.error('Error fetching maintenance tasks:', error)
      throw error
    }
  }

  // Ejecutar una acción de mantenimiento
  async executeMaintenanceAction(action: string, taskId?: string) {
    try {
      const response = await fetch('/api/admin/maintenance/actions', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ action, taskId })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      // console.error('Error executing maintenance action:', error)
      throw error
    }
  }

  // Actualizar estado de una tarea
  async updateTaskStatus(taskId: string, status: string, lastRun?: Date, nextDue?: Date) {
    try {
      const response = await fetch('/api/admin/maintenance/tasks', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          taskId,
          status,
          lastRun: lastRun?.toISOString(),
          nextDue: nextDue?.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      // console.error('Error updating task status:', error)
      throw error
    }
  }

  // Ejecutar tarea específica
  async runTask(taskId: string) {
    // Mapear IDs de tareas a acciones
    const taskActionMap: { [key: string]: string } = {
      'db-backup': 'db-backup',
      'image-cleanup': 'image-cleanup',
      'cache-clear': 'cache-clear',
      'security-scan': 'security-scan',
      'dependencies-update': 'dependencies-update',
      'performance-audit': 'performance-audit',
      'log-cleanup': 'log-cleanup'
    }

    const action = taskActionMap[taskId]
    if (!action) {
      throw new Error(`Unknown task ID: ${taskId}`)
    }

    return await this.executeMaintenanceAction(action, taskId)
  }

  // Acciones rápidas
  async quickBackup() {
    return await this.executeMaintenanceAction('db-backup')
  }

  async quickCacheClear() {
    return await this.executeMaintenanceAction('cache-clear')
  }

  async quickSecurityScan() {
    return await this.executeMaintenanceAction('security-scan')
  }

  async quickUpdateAll() {
    return await this.executeMaintenanceAction('dependencies-update')
  }
}

export const maintenanceAPI = new MaintenanceAPI()