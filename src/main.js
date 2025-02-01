import './styles/tailwind.css'
import '@/assets/css/common.css'
import 'vite-plugin-svg-icons/register'
import {createApp} from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import {
    setupNaive,
    setupNaiveDiscreteApi,
    setupDirectives,
    setupGlobalProperties,
    setupTheme,
    setupLayer
} from '@/scripts/plugins'
import {setupRouter} from '@/scripts/router'
import {setupComponents} from '@/components'
import '@/scripts/compiler/magic-import'

let app;

async function start() {
    app = createApp(App)
    app.use(createPinia())
    setupNaive(app)
    setupNaiveDiscreteApi()
    setupDirectives(app)
    setupGlobalProperties(app)
    await setupRouter(app)
    setupComponents(app)
    await setupTheme()
    setupLayer(app)
    app.mount('#app')
}

void start()

// 导出 app 实例供其他模块使用
export { app }

