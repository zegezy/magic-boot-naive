<template>
    <n-layout position="absolute" has-sider>
        <n-layout-sider
            bordered
            collapse-mode="width"
            :collapsed-width="64"
            :width="200"
            show-trigger
            @update:collapsed="updateCollapsed"
            @after-enter="() => isCollapsed = false"
        >
            <n-layout position="absolute">
                <n-layout-header class="nav-bg">
                    <p class="text-center text-2xl m-0 pt-5 pb-5 text-white title" v-if="!isCollapsed">
                        {{ $global.title }}
                    </p>
                    <p class="text-center text-2xl m-0 pt-5 pb-5 text-white title" v-else>
                        {{ $global.title.substring(0, 1) }}
                    </p>
                </n-layout-header>
                <n-layout-content class="absolute top-16 right-0 bottom-0 left-0 nav-bg" :native-scrollbar="false">
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
                </n-layout-content>
            </n-layout>
        </n-layout-sider>
        <n-layout>
            <n-layout-header class="h-16" style="box-shadow: 1px 1px 6px #c6c6c6">
                <layout-header/>
            </n-layout-header>
            <n-layout-content class="absolute right-0 bottom-0 left-0 bg-lightgray" style="top:4.3rem;">
                <n-layout position="absolute">
                    <n-layout-header class="h-12 p-2 bg-lightgray">
                        <tabs/>
                    </n-layout-header>
                    <n-layout-content class="absolute top-12 right-0 bottom-0 left-0 px-4 router-view-content p-1 bg-lightgray">
                        <div style="width: 100%;height: 100%">
                            <component
                                v-for="com in keepaliveIframes"
                                :is="IframeComponent"
                                :url="common.getUrlType(com.meta.path) == 2 ? '/#' + com.meta.path : com.meta.path"
                                v-show="com.path == $route.path"
                            />
                            <none />
                        </div>
                    </n-layout-content>
                </n-layout>
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>

<script setup>
import {ref, h, watch, computed} from 'vue';
import tabs from './tabs.vue'
import none from './none.vue'
import {RouterLink} from 'vue-router'
import vicons from '@/scripts/vicons'
import {NIcon} from 'naive-ui';
import {useUserStore} from "@/store/modules/userStore"
import {useTabsStore} from "@/store/modules/tabsStore"
import LayoutHeader from "@/layout/layout-header.vue";
import IframeComponent from '@/views/common/iframe.vue'
import common from "@/scripts/common";
import { isEmpty } from 'lodash-es'

const tabsStore = useTabsStore()
const userStore = useUserStore()
const menuRef = ref()
const currentTab = tabsStore.getCurrentTab
const selectedKey = ref(currentTab)
selectMenu(currentTab)
watch(() => tabsStore.getCurrentTab, (key) => selectMenu(key))
// 单独处理 "iframe" 并且开启缓存的页面
const keepaliveIframes = computed(() => tabsStore.getTabs.filter(it => common.filterIframeTabs(it)))

function selectMenu(key) {
    selectedKey.value = key
    menuRef.value?.showOption(key);
}

function renderIcon(icon) {
    return () => h(NIcon, null, {default: () => h(icon)})
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
        let getIcon = (chi) => {
            return vicons[chi.icon]
        }
        if (chi.icon && getIcon(chi)) {
            menu.icon = renderIcon(getIcon(chi))
        }
        menus.push(menu)
    })
    return menus
}

</script>

<style scoped>
.nav-bg {
    background-color: #041427;
}

.title {
    font-family: PoetsenOne;
}
.bg-lightgray{
    background-color: #fafafa;
}
</style>
