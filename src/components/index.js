import {defineAsyncComponent} from 'vue'

const components = import.meta.glob('./**/*.vue')

/**
 * 自动注册 components 目录下的所有 .vue 组件
 * @param {Object} app - Vue应用实例
 */
export function setupComponents(app) {
    for (const [key, value] of Object.entries(components)) {
        const name = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))
        app.component(name, defineAsyncComponent(value))
    }
}
