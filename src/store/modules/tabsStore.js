import {defineStore} from 'pinia'
import {ref, computed, nextTick} from 'vue'
import router from "@/scripts/router";

export const useTabsStore = defineStore('tabs', () => {

    const currentTab = ref('')
    const tabs = ref([{ path: '/home', meta: { title: '首页' } }])
    const isShow = ref(true)

    function setCurrentTab(value) {
        currentTab.value = value
    }

    const getCurrentTab = computed(() => currentTab.value)

    function pushTab(value) {
        tabs.value.push(value)
    }

    function closeTab(i) {
        tabs.value.splice(i, 1)
    }

    function replaceTab(value, i) {
        tabs.value[i] = value
    }

    function contains(path) {
        if (tabs.value.filter(it => it.path == path).length > 0) {
            return true
        }
        return false
    }

    function refresh({path, query}, push) {
        let toTab = null
        let _i = 0
        for (let i = 0; i < tabs.value.length; i++) {
            let it = tabs.value[i]
            if (it.path == path) {
                _i = i
                toTab = it
                break
            }
        }
        tabs.value.splice(_i, 1)
        hide()
        nextTick(() => {
            tabs.value.splice(_i, 0, toTab)
            show()
            if (push) {
                router.push({
                    path: `${path}`,
                    query: query || toTab.query
                })
            } else {
                router.replace({
                    path: `/redirect${path}`,
                    query: query || toTab.query
                })
            }
        })
    }

    function refreshPush(to) {
        refresh(to, true)
    }

    function refreshReplace(to) {
        refresh(to, false)
    }

    function show() {
        isShow.value = true
    }

    function hide() {
        isShow.value = false
    }

    const getShow = computed(() => isShow.value)
    const getTabs = computed(() => tabs.value)

    function closeOtherTabs(path) {
        // 保留首页和当前标签
        const homeTab = tabs.value.find(tab => tab.path === '/home')
        const currentTab = tabs.value.find(tab => tab.path === path)
        
        if (homeTab && currentTab) {
            tabs.value = [homeTab]
            if (path !== '/home') {
                tabs.value.push(currentTab)
                // 确保路由跳转到当前标签
                router.push(path)
                // 更新当前选中的标签
                setCurrentTab(path)
            } else {
                // 如果关闭其他后只剩首页，就跳转到首页
                router.push('/home')
                setCurrentTab('/home')
            }
        }
    }

    function closeAllTabs() {
        // 只保留首页标签
        tabs.value = [{ path: '/home', meta: { title: '首页' } }]
        router.push('/home')
        setCurrentTab('/home')  // 确保更新当前选中的标签
    }

    return {
        setCurrentTab,
        pushTab,
        closeTab,
        closeOtherTabs,
        closeAllTabs,
        show,
        hide,
        replaceTab,
        contains,
        refreshPush,
        refreshReplace,
        getCurrentTab,
        getTabs,
        getShow
    }
})
