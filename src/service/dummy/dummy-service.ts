import authData from '@/data/auth.json'
import dashboardData from '@/data/dashboard.json'
import notificationsData from '@/data/notifications.json'
import ordersData from '@/data/orders.json'
import productsData from '@/data/products.json'
import usersData from '@/data/users.json'
import type { AuthUser, DashboardData, NotificationItem, Order, Product, User } from '@/types'

const wait = (milliseconds = 450) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))
const clone = <T>(value: T): T => structuredClone(value)
let users = clone(usersData) as User[]
let products = clone(productsData) as Product[]
let orders = clone(ordersData) as Order[]
let notifications = clone(notificationsData) as unknown as NotificationItem[]

const today = () => new Date().toISOString().slice(0, 10)
const nextNumericId = (items: Array<{ id: string }>) => String(Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1)

export const dummyService = {
  async login(email: string, password: string) {
    await wait(600)
    const match = authData.users.find((user) => user.email === email && user.password === password)
    if (!match) throw new Error('INVALID_CREDENTIALS')
    const safeUser: AuthUser = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role,
      avatar: match.avatar,
    }
    return { user: safeUser as AuthUser, token: `dummy-token-${match.id}` }
  },
  async getDashboard() {
    await wait()
    return clone(dashboardData) as DashboardData
  },
  async getUsers() {
    await wait()
    return clone(users)
  },
  async getProducts() {
    await wait()
    return clone(products)
  },
  async getOrders() {
    await wait()
    return clone(orders)
  },
  async getNotifications() {
    await wait(150)
    return clone(notifications)
  },
  async markAllNotificationsRead() {
    await wait(120)
    notifications = notifications.map((item) => ({ ...item, read: true }))
  },
  async toggleNotification(id: number) {
    await wait(120)
    notifications = notifications.map((item) => item.id === id ? { ...item, read: !item.read } : item)
  },
  async clearNotifications() {
    await wait(120)
    notifications = []
  },
  async createUser(payload: Record<string, unknown>) {
    await wait(250)
    const user = { ...payload, id: nextNumericId(users), createdAt: String(payload.createdAt || today()) } as unknown as User
    users = [user, ...users]
    return clone(user)
  },
  async updateUser(id: string, payload: Record<string, unknown>) {
    await wait(250)
    users = users.map((item) => item.id === id ? { ...item, ...payload, id } as User : item)
  },
  async deleteUser(id: string) {
    await wait(250)
    users = users.filter((item) => item.id !== id)
  },
  async createProduct(payload: Record<string, unknown>) {
    await wait(250)
    const product = { ...payload, id: nextNumericId(products), price: Number(payload.price), stock: Number(payload.stock) } as unknown as Product
    products = [product, ...products]
    return clone(product)
  },
  async updateProduct(id: string, payload: Record<string, unknown>) {
    await wait(250)
    products = products.map((item) => item.id === id ? { ...item, ...payload, id, price: Number(payload.price), stock: Number(payload.stock) } as Product : item)
  },
  async deleteProduct(id: string) {
    await wait(250)
    products = products.filter((item) => item.id !== id)
  },
  async createOrder(payload: Record<string, unknown>) {
    await wait(250)
    const nextId = Math.max(0, ...orders.map((item) => Number(item.id.replace('ORD-', '')) || 0)) + 1
    const order = { ...payload, id: `ORD-${String(nextId).padStart(3, '0')}`, total: Number(payload.total), items: Number(payload.items), createdAt: String(payload.createdAt || today()) } as unknown as Order
    orders = [order, ...orders]
    return clone(order)
  },
  async updateOrder(id: string, payload: Record<string, unknown>) {
    await wait(250)
    orders = orders.map((item) => item.id === id ? { ...item, ...payload, id, total: Number(payload.total), items: Number(payload.items) } as Order : item)
  },
  async deleteOrder(id: string) {
    await wait(250)
    orders = orders.filter((item) => item.id !== id)
  },
}
