import './styles/tailwind.css'
import { createApp } from 'vue'
import App from './App.vue'
import { setupNaive, setupNaiveDiscreteApi, setupDirectives } from '@/scripts/plugins'
import { setupRouter } from '@/scripts/router'
import { setupStore } from '@/store'
const app = createApp(App)

async function start(){
    setupStore(app)
    setupNaive(app)
    setupNaiveDiscreteApi()
    setupDirectives(app)
    setupRouter(app)
    app.mount('#app')
}

void start()

