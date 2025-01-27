import { defineStore } from 'pinia'

export const useLayoutConfigStore = defineStore('layoutConfig', {
    state: () => ({
        // 菜单模式 - side: 侧边菜单, top: 顶部菜单
        menuMode: localStorage.getItem('menuMode') || 'side',
        // 是否固定头部
        fixedHeader: localStorage.getItem('fixedHeader') === 'true',
        // 是否显示面包屑
        showBreadcrumb: localStorage.getItem('showBreadcrumb') !== 'false'
    }),

    getters: {
        getMenuMode: (state) => state.menuMode,
        getFixedHeader: (state) => state.fixedHeader,
        getShowBreadcrumb: (state) => state.showBreadcrumb
    },

    actions: {
        // 更新配置
        updateConfig(config) {
            Object.entries(config).forEach(([key, value]) => {
                this[key] = value
                localStorage.setItem(key, value)
            })
        }
    }
}) 