import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout'
import { setupRouterInterceptor } from "@/scripts/router/routerInterceptor";
import { useTabsStore } from "@/store/modules/tabsStore";

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('@/views/home.vue'),
        meta: { title: '首页' }
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export function push(to){
  const tabsStore = useTabsStore()
  if(tabsStore.contains(to.path)){
    tabsStore.refreshPush(to)
  }else{
    router.push(to)
  }
}

export function setupRouter(app){
  app.use(router)
  setupRouterInterceptor()
}

export default router
