import global from '@/scripts/global'

export function setupGlobalProperties(app) {
    app.config.globalProperties.$global = global
    window['$global'] = global
}
