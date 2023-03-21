import router from "@/scripts/router"
import { generateRoutes, generateHiddenRoutes } from './loadRouter'
import { useUserStore } from "@/store/modules/userStore"
import { useDictStore } from '@/store/modules/dictStore'
import { useTabsStore } from '@/store/modules/tabsStore'

const whiteList = ['/login']
let loadInfo = false
export function setupRouterInterceptor(){
  router.beforeEach(async (to, from, next) => {
    $loading.start();
    const userStore = useUserStore()
    const token = userStore.getToken()
    if(token){
      if (to.path === '/login') {
        next({ path: '/' })
        $loading.finish()
      } else {
        if (loadInfo) {
          tabHandler(to)
          next()
        } else {
          loadInfo = true
          try {
            await loadData(userStore)
            next({ ...to, replace: true })
          } catch (error) {
            console.log(error)
            $message.error(error.data || 'Error')
            userStore.logout()
            $loading.finish()
          }
        }
      }
    }else{
      if (whiteList.indexOf(to.path) !== -1) {
        next()
      } else {
        next(`/login`)
        $loading.finish()
      }
    }
  })

  router.afterEach(() => {
    $loading.finish()
  })
}

function tabHandler(to){
  const tabsStore = useTabsStore()
  tabsStore.setCurrentTab(to.path)
  const tabs = tabsStore.getTabs
  if((to.name && tabs.length === 0 || tabs.every(it => it.path !== to.path)) && !to.path.startsWith('/redirect') && !to.path.startsWith('/login')){
    tabsStore.pushTab(to)
  }
  tabs.forEach((it, i) => {
    if(it.path == to.path){
      tabsStore.replaceTab(to, i)
    }
  })
}

async function loadData(userStore){

  const dictStore = useDictStore()

  await userStore.getUserInfo()
  await dictStore.getDictData()

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