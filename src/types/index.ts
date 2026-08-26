export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export interface User extends AuthUser {
  status: 'active' | 'inactive' | 'banned'
  createdAt: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  sku: string
}

export interface Order {
  id: string
  customer: string
  email: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: number
  createdAt: string
}

export interface DashboardData {
  stats: Array<{ key: string; value: string; change: string; trend: 'up' | 'down' }>
  revenue: Array<{ month: string; revenue: number; orders: number }>
  recentOrders: Array<{ id: string; customer: string; status: string; amount: string }>
}

export interface NotificationItem {
  id: number
  titleKey: string
  descriptionKey: string
  params: Record<string, string | number>
  timeKey: string
  timeParams: Record<string, string | number>
  read: boolean
  type: 'order' | 'warning' | 'user' | 'system'
}
