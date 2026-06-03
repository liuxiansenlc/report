import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/report/farm-info',
    children: [
      {
        path: 'report/test-report',
        name: 'TestReport',
        component: () => import('@/views/TestReport.vue'),
        meta: { title: '检测报告' }
      },
      {
        path: 'welcome',
        name: 'Welcome',
        component: () => import('@/views/Welcome.vue')
      },
      {
        path: 'report/farm-info',
        name: 'FarmInfo',
        component: () => import('@/views/FarmInfo.vue')
      },
      {
        path: 'report/crop-ph-standard',
        name: 'CropPhStandard',
        component: () => import('@/views/CropPhStandard.vue')
      },
      {
        path: 'report/soil-risk-standard',
        name: 'SoilRiskStandard',
        component: () => import('@/views/SoilRiskStandard.vue')
      },
      {
        path: 'report/organic-matter-dict',
        name: 'OrganicMatterDict',
        component: () => import('@/views/OrganicMatterDict.vue')
      },
      {
        path: 'report/soil-test-data',
        name: 'SoilTestData',
        component: () => import('@/views/SoilTestData.vue')
      },
      {
        path: 'report/economic-indicator',
        name: 'EconomicIndicator',
        component: () => import('@/views/EconomicIndicator.vue')
      },
      {
        path: 'report/service-station',
        name: 'ServiceStation',
        component: () => import('@/views/ServiceStation.vue')
      },
      {
        path: 'report/factory-info',
        name: 'FactoryInfo',
        component: () => import('@/views/FactoryInfo.vue')
      },
      {
        path: 'report/:id',
        name: 'ReportDetail',
        component: () => import('@/views/Welcome.vue') 
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes
})

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  if (to.path !== '/login' && !userStore.token) {
    return '/login'
  }
  return true
})

export default router
