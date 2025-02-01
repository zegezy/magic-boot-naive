import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {sha256} from "js-sha256"
import {useDictStore} from "@/store/modules/dictStore";
import {generateRoutes} from "@/scripts/router/loadRouter";
import router from "@/scripts/router"
import {loadDynamicComponent} from '@/scripts/compiler/dynamicComponent'
import { useTabsStore } from './tabsStore'
import { app } from '@/main'

export const useUserStore = defineStore('user', () => {
    const token = ref(null)
    const userInfo = ref(null)
    const currentTenant = ref(null)
    const auths = ref([])
    const info = ref({})
    const permissionRouters = ref([])

    const getAuths = computed(() => auths.value)
    const getInfo = computed(() => info.value)
    const getPermissionRouters = computed(() => permissionRouters.value)

    function setAuths(value) {
        auths.value = value
    }

    function setInfo(value) {
        info.value = value
    }

    function setPermissionRouters(value) {
        permissionRouters.value = value
    }

    function pushPermissionRouter(value) {
        permissionRouters.value.push(...value)
    }

    function clear() {
        setAuths([])
        setInfo({})
        setPermissionRouters([])
    }

    function getToken() {
        return localStorage.getItem('magic_boot_token')
    }

    function setToken(token) {
        localStorage.setItem('magic_boot_token', token)
    }

    function removeToken() {
        localStorage.removeItem('magic_boot_token')
        clear()
    }

    async function getUserInfo() {
        await $common.get('/system/user/info').then(res => {
            const {data} = res
            if (data) {
                const authorities_ = []
                for (let i = 0; i < data.authorities.length; i++) {
                    authorities_.push(data.authorities[i])
                }
                setAuths(authorities_)
                setInfo(data)
            }
        })
    }

    async function loadData(app) {
        const userStore = useUserStore()
        const dictStore = useDictStore()

        await userStore.getUserInfo()
        await dictStore.getDictData()
        await $common.loadConfig()
        await loadDynamicComponent(app)

        await generateRoutes().then(({ layoutMenus, notLayoutMenus, showMenus }) => {
            userStore.pushPermissionRouter(showMenus)
            layoutMenus.concat(notLayoutMenus).forEach(it => {
                router.addRoute(it)
            })
        })
    }

    async function login(loginForm) {
        try {
            const res = await $common.post('/system/security/login', {
                phone: loginForm.phone,
                password: sha256(loginForm.password),
                code: loginForm.code,
                uuid: loginForm.uuid
            })
            const { token: tokenValue, user } = res.data;
            token.value = tokenValue
            setToken(tokenValue)
            setInfo(user)
            
            // 1. 先尝试通过域名匹配租户
            const domain = window.location.hostname
            const tenantRes = await $common.get(`/system/tenant/getByDomain/${domain}`)
            
            // 2. 获取用户可访问的租户列表
            const tenantsRes = await $common.get('/system/tenant/user/list')
            if (!tenantsRes.data || tenantsRes.data.length === 0) {
                throw new Error('未找到可用租户')
            }
            
            // 3. 如果域名匹配到租户且用户有权限访问，直接使用
            if (tenantRes.data && tenantsRes.data.some(t => t.id === tenantRes.data.id)) {
                await setCurrentTenant(tenantRes.data)
                await loadData(app)
                return { token: tokenValue, user, tenant: tenantRes.data }
            }
            
            // 4. 处理租户选择
            if (tenantsRes.data.length === 1) {
                // 只有一个租户时自动选择
                await setCurrentTenant(tenantsRes.data[0])
                await loadData(app)
                return { token: tokenValue, user, tenant: tenantsRes.data[0] }
            }
            
            // 5. 多个租户时返回租户列表，由调用方处理选择逻辑
            return { token: tokenValue, user, tenants: tenantsRes.data }
            
        } catch (error) {
            throw new Error(error.message || '登录失败')
        }
    }

    async function setCurrentTenant(tenant) {
        try {
            currentTenant.value = tenant
            localStorage.setItem('current_tenant', JSON.stringify(tenant))
            await loadData(app)
        } catch (error) {
            throw new Error(error.message || '设置租户失败')
        }
    }

    function getCurrentTenant() {
        if (!currentTenant.value) {
            const savedTenant = localStorage.getItem('current_tenant')
            if (savedTenant) {
                currentTenant.value = JSON.parse(savedTenant)
            }
        }
        return currentTenant.value
    }

    function clearTenant() {
        currentTenant.value = null
        localStorage.removeItem('current_tenant')
    }

    async function logout() {
        const tabsStore = useTabsStore()
        try {
            // 先调用登出接口
            await $common.get('/system/security/logout')
            // 清理本地数据
            removeToken()
            clearTenant()
            tabsStore.clearAllTabs()
            // 跳转到登录页
            router.push('/login')
        } catch (error) {
            console.error('登出失败:', error)
            // 即使接口调用失败，也要清理本地数据并跳转
            removeToken()
            clearTenant()
            tabsStore.clearAllTabs()
            router.push('/login')
        }
    }

    return {
        getAuths,
        getInfo,
        getPermissionRouters,
        setAuths,
        pushPermissionRouter,
        getToken,
        getUserInfo,
        login,
        setCurrentTenant,
        logout,
        loadData,
        removeToken,
        currentTenant,
        getCurrentTenant,
        clearTenant,
        token,
        userInfo,
        permissionRouters
    }
})