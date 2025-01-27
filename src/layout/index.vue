<template>
    <n-layout class="main-layout" :has-sider="layoutConfig.menuMode !== 'top'">
        <!-- 侧边菜单 -->
        <n-layout-sider
            v-if="layoutConfig.menuMode !== 'top'"
            class="layout-sider"
            bordered
            collapse-mode="width"
            :collapsed-width="64"
            :width="200"
            show-trigger
            @update:collapsed="updateCollapsed"
            @after-enter="() => isCollapsed = false"
        >
            <!-- Logo -->
            <div class="logo-container nav-bg">
                <p class="logo-text" v-if="!isCollapsed">{{ $global.title }}</p>
                <p class="logo-text" v-else>{{ $global.title.substring(0, 1) }}</p>
            </div>
            <!-- 侧边菜单内容 -->
            <div class="menu-container nav-bg">
                <n-menu
                    ref="menuRef"
                    v-model:value="selectedKey"
                    :indent="24"
                    :collapsed-width="64"
                    :collapsed-icon-size="22"
                    :options="menuOptions"
                    inverted
                    accordion
                />
            </div>
        </n-layout-sider>

        <!-- 主内容区 -->
        <n-layout class="layout-content">
            <!-- 顶部区域 - 在侧边菜单模式下显示 -->
            <n-layout-header v-if="layoutConfig.menuMode === 'side'" class="layout-header">
                <layout-header/>
            </n-layout-header>
            
            <!-- 顶部菜单 -->
            <div v-if="layoutConfig.menuMode === 'top'" class="top-menu nav-bg">
                <!-- 添加 Logo -->
                <div class="logo-section">
                    <p class="logo-text">{{ $global.title }}</p>
                </div>
                <div class="menu-section">
                    <n-menu
                        ref="menuRef"
                        v-model:value="selectedKey"
                        mode="horizontal"
                        :options="menuOptions"
                        :indent="24"
                        inverted
                    />
                </div>
                <user-info />
            </div>

            <!-- 页面内容区 -->
            <n-layout-content class="page-container">
                <!-- 标签页 -->
                <div class="tabs-wrapper">
                    <tabs/>
                </div>
                <!-- 顶部菜单模式下显示面包屑 -->
                <div v-if="layoutConfig.menuMode === 'top' && layoutConfig.showBreadcrumb" class="breadcrumb-wrapper">
                    <breadcrumb-nav />
                </div>
                <!-- 路由视图 -->
                <div class="view-wrapper">
                    <component
                        v-for="com in keepaliveIframes"
                        :key="com.path"
                        :is="IframeComponent"
                        :url="common.getUrlType(com.meta.path) == 2 ? '/#' + com.meta.path : com.meta.path"
                        v-show="com.path == $route.path"
                    />
                    <component
                        v-for="com in keepaliveDynamicComponents"
                        :key="com.path"
                        :is="ShowComponent"
                        :name="com.meta.componentName"
                        v-show="com.path == $route.path"
                    />
                    <nested-router />
                </div>
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>

<script setup>
import {ref, h, watch, computed} from 'vue'
import { RouterLink } from 'vue-router'
import { isEmpty } from 'lodash-es'
import { useUserStore } from "@/store/modules/userStore"
import { useTabsStore } from "@/store/modules/tabsStore"
import { useLayoutConfigStore } from '@/store/modules/layoutConfigStore'
import common from '@/scripts/common'
import Tabs from './tabs.vue'
import NestedRouter from './nested-router.vue'
import UserInfo from './components/user-info.vue'
import IframeComponent from '@/views/common/iframe.vue'
import ShowComponent from '@/views/common/show-component.vue'
import LayoutHeader from "@/layout/layout-header.vue";
import BreadcrumbNav from './components/breadcrumb-nav.vue'

const layoutConfig = useLayoutConfigStore()
const tabsStore = useTabsStore()
const userStore = useUserStore()
const menuRef = ref()
const currentTab = tabsStore.getCurrentTab
const selectedKey = ref(currentTab)
selectMenu(currentTab)
watch(() => tabsStore.getCurrentTab, (key) => selectMenu(key))
// 单独处理 "iframe" 并且开启缓存的页面
const keepaliveIframes = computed(() => tabsStore.getTabs.filter(it => common.filterIframeTabs(it)))
// 缓存"动态组件"
const keepaliveDynamicComponents = computed(() => tabsStore.getTabs.filter(it => it.meta.componentName && it.meta.keepAlive))

function selectMenu(key) {
    selectedKey.value = key
    menuRef.value?.showOption(key);
}

const isCollapsed = ref(false)

function updateCollapsed(collapsed) {
    if (collapsed) {
        isCollapsed.value = collapsed
    }
}

const menuOptions = ref(recursionRouters(userStore.getPermissionRouters))

function recursionRouters(children) {
    let menus = []
    children.forEach((chi) => {
        let menu = {}
        if (!isEmpty(chi.children)) {
            if (chi['alwaysShow'] === true) {
                menu.key = chi.path
                menu.label = chi.title
                menu.children = recursionRouters(chi.children)
            } else {
                menu.key = chi.children[0].path
                menu.label = () => h(
                    RouterLink,
                    {
                        to: {
                            path: chi.children[0].path
                        }
                    },
                    {default: () => chi.children[0].title}
                )
            }
        } else {
            menu.key = chi.path
            if(chi.openMode == '1'){
                let path = common.handlerUrlPage(chi.path)
                menu.label = () => h(
                    'a',
                    {
                        href: path,
                        target: '_blank'
                    },
                    chi.title
                )
            }else{
                menu.label = () => h(
                    RouterLink,
                    {
                        to: {
                            path: chi.path
                        }
                    },
                    {default: () => chi.title}
                )
            }
        }
        if (chi.icon) {
            menu.icon = common.renderIcon(chi.icon)
        }
        menus.push(menu)
    })
    return menus
}
</script>

<style scoped lang="less">
.main-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;

    :deep(.n-layout-scroll-container) {
        display: flex;
        flex-direction: column;
    }
}

.layout-sider {
    display: flex;
    flex-direction: column;

    :deep(.n-layout-sider-scroll-container) {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: #041427;
    }
    
    .logo-container {
        flex-shrink: 0;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .logo-text {
            margin: 0;
            padding: 20px 0;
            color: white;
            font-size: 24px;
            font-family: PoetsenOne;
        }
    }
    
    .menu-container {
        flex: 1;
        overflow: hidden;

        :deep(.n-menu .n-menu-item-content) {
            transition: none !important;
            background: transparent;

            &:hover, &:active {
                background: rgba(255, 255, 255, 0.09) !important;
            }

            &::before {
                display: none !important;
            }
        }

        :deep(.n-menu .n-menu-item-content.n-menu-item-content--selected) {
            background: linear-gradient(90deg, #2b6abc 0%, #1a4987 50%, #041427 100%) !important;
            
            &::before {
                display: block !important;
                left: 0;
                width: 4px;
                height: 24px;
                background: #40a9ff;
                border-radius: 0 2px 2px 0;
                content: '';
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
            }
        }
    }
}

.layout-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.n-layout-scroll-container) {
        display: flex;
        flex-direction: column;
    }
    
    .layout-header {
        flex-shrink: 0;
        height: 64px;
        background: white;
        box-shadow: 0 1px 4px rgba(0,21,41,.08);
    }
    
    .top-menu {
        flex-shrink: 0;
        height: 64px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .logo-section {
            flex-shrink: 0;
            padding: 0 24px;
            
            .logo-text {
                margin: 0;
                color: white;
                font-size: 24px;
                font-family: PoetsenOne;
            }
        }
        
        .menu-section {
            flex: 1;
            display: flex;
            justify-content: center;
        }

        :deep(.n-menu .n-menu-item-content) {
            transition: none !important;
            background: transparent;

            &:hover, &:active {
                background: rgba(255, 255, 255, 0.09) !important;
            }

            &::before {
                display: none !important;
            }
        }

        :deep(.n-menu .n-menu-item-content.n-menu-item-content--selected) {
            background: linear-gradient(180deg, #2b6abc 0%, #1a4987 50%, #041427 100%) !important;
        }
    }
    
    .page-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #f0f2f5;
        overflow: hidden;

        :deep(.n-layout-scroll-container) {
            display: flex !important;
            flex-direction: column;
        }
        
        .tabs-wrapper {
            flex-shrink: 0;
            padding: 8px;
            background: #fafafa;
            
            :deep(.n-tabs) {
                display: flex;
                align-items: center;
            }
        }
        
        .breadcrumb-wrapper {
            flex-shrink: 0;
            padding: 12px 16px;
            background: #fff;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .view-wrapper {
            flex: 1;
            padding: 16px;
            overflow: auto;
            
            :deep(.n-layout) {
                height: 100%;
            }
        }
    }
}

.nav-bg {
    background-color: #041427;
}
</style>
