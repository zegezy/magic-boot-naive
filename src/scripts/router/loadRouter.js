import common from '@/scripts/common'
import {sha256} from 'js-sha256'
import { cloneDeep } from 'lodash-es'

const relativePath = '/src'
const viewModules = import.meta.glob('@/views/**/**.vue')
const layoutModules = import.meta.glob('@/layout/**.vue')

function setIframe(menu) {
    // 页签 | iframe
    if(menu.openMode === '0' || menu.openMode === '2'){
        menu.component = loadView(`/common/iframe`)
        menu.props = {url: menu.url}
        menu.path = "/" + sha256(menu.url)
    }
}

export const handlerLayoutMenus = (menus, level) => {
    level = level || 0
    const layoutMenus = menus.filter(menu => {
        if (menu.isShow === 1) {
            let urlType = common.getUrlType(menu.url)
            if (urlType == 0 || urlType == 1) {// http地址 || 项目内静态页面
                setIframe(menu)
            } else if (menu.url && menu.url.startsWith('/') && menu.openMode == '2') {// 项目内页面并且打开方式为 iframe
                menu.component = loadView(`/common/iframe`)
                menu.props = { url: '/#' + menu.url }
                // 地址栏显示地址 + '-i'
                menu.path = menu.url + '-i'
            } else if (menu.componentName) {// 关联组件
                menu.component = loadView(`/common/show-component`)
                menu.props = {name: menu.componentName}
            } else if (menu.component) {
                if(menu.openMode != '1'){
                    const component = menu.component
                    if (component === 'Layout') {
                        menu.path = "/" + common.uuid()
                        menu.component = level > 0 ? layoutModules[`${relativePath}/layout/none.vue`] : loadLayoutView(component)
                    } else {
                        menu.path = menu.path.startsWith('/') ? menu.path : '/' + menu.path
                        menu.component = loadView(component) || layoutModules[`${relativePath}/layout/empty.vue`]
                    }
                }
            }
            if (menu.children && menu.children.length) {
                menu.children = handlerLayoutMenus(menu.children, level + 1)
            }
            return true
        }
        return false
    })
    return layoutMenus
}

// 删除不需要加载的路由
const deleteNewTabMenu = (menus, level) => {
    level = level || 0
    const layoutMenus = menus.filter(menu => {
        if (menu.isShow === 1) {
            let urlType = common.getUrlType(menu.url)
            if (urlType == 2 && menu.openMode == '1') {
                return false
            }
            if (menu.children && menu.children.length) {
                menu.children = deleteNewTabMenu(menu.children, level + 1)
            }
            return true
        }
        return false
    })
    return layoutMenus
}

export const loadLayoutView = () => {
    return layoutModules[`${relativePath}/layout/index.vue`]
}

export const loadView = (view) => {
    view = view.substring(0, 1) === '/' ? view : '/' + view
    return viewModules[`${relativePath}/views${view}.vue`]
}

function loadComponent(menu) {
    let result = {
        path: menu.path,
        meta: {
            title: menu.name,
            keepAlive: menu.keepAlive
        }
    }
    if (menu.componentName) {
        result.component = loadView(`/common/show-component`)
        result.props = {name: menu.componentName}
    } else if (menu.path) {
        result.component = loadView(menu.path) || layoutModules[`${relativePath}/layout/empty.vue`]
    }
    return result
}

export function handlerNotLayoutMenus(menus) {
    menus.forEach((menu, i) => {
        if(menu.openMode == '0'){// 页签
            menu.path = menu.path.startsWith('/') ? menu.path : '/' + menu.path
            menu.redirect = menu.path
            menu.component = loadLayoutView()
            menu.hidden = true
            menu.children = [loadComponent(menu)]
        }else{
            menus[i] = loadComponent(menu)
        }
    })
}

export function generateRoutes() {
    return new Promise((resolve) => {
        common.$post('/system/menu/current/menus').then(res => {
            const { notLayoutMenus, layoutMenus } = res.data
            handlerLayoutMenus(layoutMenus)
            handlerNotLayoutMenus(notLayoutMenus)
            resolve({
                layoutMenus: deleteNewTabMenu(cloneDeep(layoutMenus)),
                notLayoutMenus,
                showMenus: layoutMenus
            })
        })
    })
}
