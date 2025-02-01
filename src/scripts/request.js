import axios from 'axios'
import {useUserStore} from '@/store/modules/userStore'

const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    timeout: 1000 * 60
})

service.interceptors.request.use(
    config => {
        const userStore = useUserStore()
        if (userStore.getToken()) {
            config.headers['token'] = userStore.getToken()
        }
        const tenant = userStore.getCurrentTenant()
        if (tenant) {
            config.headers['tenant-id'] = tenant.id
        }
        return config
    },
    error => {
        console.log(error)
        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    response => {
        const userStore = useUserStore()
        if (response.config.url.indexOf('user/info') !== -1 && response.data.code === 402) {
            userStore.logout()
        }
        return new Promise((resolve, reject) => {
            const res = response.data
            if (res.code !== 200) {
                let duration = 5
                if (res.code === 402) {
                    duration = 1.5
                    setTimeout(() => {
                        userStore.logout()
                    }, duration * 1000)
                } else {
                    if (res.code === 403 && import.meta.env.MODE === 'demo') {
                        res.message = '演示模式，不允许操作！'
                    }
                    $message.error(res.message || 'Error')
                    reject(res)
                }
            } else {
                resolve(res)
            }
        })
    },
    res => {
        $message.error(res.message || 'Error')
        return Promise.reject(res)
    }
)
export default service
