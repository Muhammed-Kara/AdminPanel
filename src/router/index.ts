import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/pages/LoginPage.vue'), meta: { publicOnly: true } },
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
        { path: 'users', name: 'users', component: () => import('@/pages/UsersPage.vue') },
        { path: 'products', name: 'products', component: () => import('@/pages/ProductsPage.vue') },
        { path: 'orders', name: 'orders', component: () => import('@/pages/OrdersPage.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/pages/SettingsPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFoundPage.vue') },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.matched.some((record) => record.meta.requiresAuth) && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.publicOnly && auth.isAuthenticated) return { name: 'dashboard' }
})

export default router
