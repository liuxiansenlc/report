import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/gdbh/dashboard'
    },
    {
      path: '/gdbh/dashboard',
      name: 'dashboard',
      component: HomeView
    },
    {
      path: '/gdbh/analysis',
      name: 'analysis',
      component: () => import('../views/PageTwoView.vue')
    }
  ]
})

export default router
