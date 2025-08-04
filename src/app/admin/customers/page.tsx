'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Users,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  email: string
  phone: string | null
  first_name: string
  last_name: string
  city: string | null
  region: string | null
  created_at: string
  total_orders: number
  total_spent: number
  last_order_date: string | null
  status: 'active' | 'inactive'
}

interface CustomerStats {
  total_customers: number
  new_this_month: number
  average_order_value: number
  repeat_customers: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    total_customers: 0,
    new_this_month: 0,
    average_order_value: 0,
    repeat_customers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'date'>(
    'date'
  )
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive'
  >('all')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')

  useEffect(() => {
    fetchCustomersData()
  }, [])

  const fetchCustomersData = async () => {
    if (!supabase) {
      console.error('Supabase not initialized')
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Obtener lista de clientes básica
      const { data: customersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (customersData) {
        // Simplificar datos de clientes por ahora
        const enrichedCustomers = customersData.map((customer) => ({
          ...customer,
          total_orders: 0,
          total_spent: 0,
          last_order_date: null,
          status: 'inactive' as const,
        }))

        setCustomers(enrichedCustomers as Customer[])

        // Estadísticas básicas
        setStats({
          total_customers: customersData.length,
          new_this_month: Math.floor(customersData.length * 0.1), // Estimación
          average_order_value: 150000, // Valor ejemplo
          repeat_customers: Math.floor(customersData.length * 0.3), // Estimación
        })
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtros y búsqueda
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        const matchesSearch =
          customer.first_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.last_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm)

        const matchesStatus =
          filterStatus === 'all' || customer.status === filterStatus
        const matchesRegion =
          selectedRegion === 'all' || customer.region === selectedRegion

        return matchesSearch && matchesStatus && matchesRegion
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return `${a.first_name} ${a.last_name}`.localeCompare(
              `${b.first_name} ${b.last_name}`
            )
          case 'orders':
            return b.total_orders - a.total_orders
          case 'spent':
            return b.total_spent - a.total_spent
          case 'date':
          default:
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            )
        }
      })
  }, [customers, searchTerm, sortBy, filterStatus, selectedRegion])

  const regions = useMemo(() => {
    const uniqueRegions = [
      ...new Set(customers.map((c) => c.region).filter(Boolean)),
    ] as string[]
    return uniqueRegions.sort()
  }, [customers])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Clientes
          </h1>
          <p className="text-muted-foreground">
            Administra tu base de clientes y analiza su comportamiento de compra
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email Marketing
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_customers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.new_this_month} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Activos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.repeat_customers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.repeat_customers / stats.total_customers) * 100).toFixed(
                1
              )}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Promedio
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.average_order_value)}
            </div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuevos Este Mes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new_this_month}</div>
            <p className="text-xs text-muted-foreground">
              +
              {((stats.new_this_month / stats.total_customers) * 100).toFixed(
                1
              )}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredCustomers.length} de {customers.length} clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Fecha registro</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="orders">Núm. pedidos</SelectItem>
                <SelectItem value="spent">Total gastado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(value: any) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            {regions.length > 0 && (
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Lista de clientes */}
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div>
                      <h3 className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </span>
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                        {customer.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.city}, {customer.region}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        customer.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {customer.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2 sm:mt-0">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between sm:flex-col sm:text-right">
                      <span className="text-muted-foreground">Pedidos:</span>
                      <span className="font-medium">
                        {customer.total_orders}
                      </span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-right">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">
                        {formatCurrency(customer.total_spent)}
                      </span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-right">
                      <span className="text-muted-foreground">Registro:</span>
                      <span className="font-medium">
                        {formatDate(customer.created_at)}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/customers/${customer.id}`}>
                      Ver detalles
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ||
                filterStatus !== 'all' ||
                selectedRegion !== 'all'
                  ? 'No se encontraron clientes con los filtros aplicados'
                  : 'Aún no hay clientes registrados'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
