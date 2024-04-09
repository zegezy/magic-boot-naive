<template>
    <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" appear>
            <keep-alive :include="keepAliveInclude">
                <component v-if="tabsStore.getShow && !keepaliveIframes.some(it => it.path == $route.path) && !keepaliveDynamicComponents.some(it => it.path == $route.path)" :is="Component" :key="$route.path"/>
            </keep-alive>
        </transition>
    </router-view>
</template>

<script setup>
import {useTabsStore} from '@/store/modules/tabsStore'
import {computed} from "vue";
const tabsStore = useTabsStore()
const keepAliveInclude = computed(() => tabsStore.getTabs.filter(it => it.meta.keepAlive && !it.meta.componentName).map(it => it.path.substring(it.path.lastIndexOf('/') + 1)))
// 单独处理 "iframe" 并且开启缓存的页面
const keepaliveIframes = computed(() => tabsStore.getTabs.filter(it => $common.filterIframeTabs(it)))
// 缓存“动态组件”
const keepaliveDynamicComponents = computed(() => tabsStore.getTabs.filter(it => it.meta.componentName))
</script>
