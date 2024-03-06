import './styles/tailwind.css'
import '@/assets/css/common.css'
import 'vite-plugin-svg-icons/register'
import {createApp} from 'vue'
import App from './App.vue'
import {
    setupNaive,
    setupNaiveDiscreteApi,
    setupDirectives,
    setupGlobalProperties,
    setupMonacoVolar
} from '@/scripts/plugins'
import {setupRouter} from '@/scripts/router'
import {setupStore} from '@/store'
import {setupComponents} from '@/components'
import './styles/magic-compact-ui.less'
import '@/scripts/compiler/magic-import'

const app = createApp(App)

async function start() {
    setupStore(app)
    setupNaive(app)
    setupNaiveDiscreteApi()
    setupDirectives(app)
    setupGlobalProperties(app)
    await setupRouter(app)
    await setupMonacoVolar()
    setupComponents(app)
    app.mount('#app')
}

void start()

