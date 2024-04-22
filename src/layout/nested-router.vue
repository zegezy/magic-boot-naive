<template>
    <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" appear>
            <keep-alive :include="keepAliveInclude">
                <component v-if="tabsStore.getShow && routerComponents.some(it => it.path === $route.path)" :is="Component" :key="$route.path"/>
            </keep-alive>
        </transition>
    </router-view>
</template>

<script setup>
import {useTabsStore} from '@/store/modules/tabsStore'
import {computed} from "vue";
const tabsStore = useTabsStore()

const routerComponents = computed(() => tabsStore.getTabs.filter(it => {
    // 过滤掉配置缓存并且是动态组件
    if(it.meta.keepAlive && it.meta.componentName){
        return false
    }
    // 过滤掉配置缓存并且需要iframe打开的
    return !$common.filterIframeTabs(it);
}))
const keepAliveInclude = computed(() => tabsStore.getTabs.filter(it => it.meta.keepAlive && !it.meta.componentName).map(it => it.path.substring(it.path.lastIndexOf('/') + 1)))
</script>
