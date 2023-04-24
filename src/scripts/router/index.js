import {createRouter, createWebHashHistory} from 'vue-router'
import Layout from '@/layout'
import {setupRouterInterceptor} from "@/scripts/router/routerInterceptor";
import {useTabsStore} from "@/store/modules/tabsStore";
import {useUserStore} from "@/store/modules/userStore";

const routes = [
    {
        path: '/',
        component: Layout,
        redirect: '/home',
        children: [
            {
                path: '/home',
                component: () => import('@/views/home.vue'),
                meta: {title: '首页'}
            }
        ]
    },
    {
        path: '/user-center',
        redirect: '/system/user/user-center',
        component: Layout,
        hidden: true,
        children: [{
            path: '/system/user/user-center',
            component: () => import('@/views/system/user/user-center'),
            meta: {title: '个人中心'}
        }]
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
    {
        path: '/404/index',
        redirect: '/404',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '/404',
                component: () => import('@/layout/empty')
            }
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: '/404/index',
        hidden: true
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export function push(to) {
    const tabsStore = useTabsStore()
    if (tabsStore.contains(to.path)) {
        tabsStore.refreshPush(to)
    } else {
        void router.push(to)
    }
}

export async function setupRouter(app) {
    const userStore = useUserStore()
    const token = userStore.getToken()
    if (token) {
        try {
            await userStore.loadData()
        } catch (error) {
            await router.push({ path: '/login' })
            userStore.removeToken()
        }
    }
    setupRouterInterceptor()
    app.use(router)
}

export default router
