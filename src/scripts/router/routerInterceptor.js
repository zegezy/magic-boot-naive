import router from "@/scripts/router"
import {generateRoutes, generateHiddenRoutes} from './loadRouter'
import {useUserStore} from "@/store/modules/userStore"
import {useDictStore} from '@/store/modules/dictStore'
import {useTabsStore} from '@/store/modules/tabsStore'
import common from "@/scripts/common";

const whiteList = ['/login']
const dontOpenTabs = ['/redirect', '/login', '/404']

export function setupRouterInterceptor() {
    router.beforeEach(async (to, from, next) => {
        $loading.start();
        const userStore = useUserStore()
        const token = userStore.getToken()
        if (token) {
            if (to.path === '/login') {
                next({path: '/'})
            } else {
                tabHandler(to)
            }
        } else {
            if (whiteList.indexOf(to.path) === -1) {
                next(`/login`)
            }
        }
        next()
    })

    router.afterEach(() => {
        $loading.finish()
    })
}

function tabHandler(to) {
    const tabsStore = useTabsStore()
    tabsStore.setCurrentTab(to.path)
    const tabs = tabsStore.getTabs
    if ((to.name && tabs.length === 0 || tabs.every(it => it.path !== to.path)) && dontOpenTabs.filter(it => to.path.startsWith(it)).length == 0) {
        tabsStore.pushTab(to)
    }
    tabs.forEach((it, i) => {
        if (it.path == to.path) {
            tabsStore.replaceTab(to, i)
        }
    })
}

export async function loadData() {

    const userStore = useUserStore()
    const dictStore = useDictStore()

    await userStore.getUserInfo()
    await dictStore.getDictData()
    await common.loadConfig()

    await generateRoutes().then(accessRoutes => {
        userStore.pushPermissionRouter(accessRoutes)
        accessRoutes.forEach(it => {
            router.addRoute(it)
        })
    })
    await generateHiddenRoutes().then(accessRoutes => {
        accessRoutes.forEach(it => {
            router.addRoute(it)
        })
    })
}
