<template>
    <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" appear>
            <keep-alive :include="keepAliveInclude">
                <component v-if="tabsStore.getShow && !keepaliveIframes.some(it => it.path == $route.path)" :is="Component" :key="$route.path"/>
            </keep-alive>
        </transition>
    </router-view>
</template>

<script setup>
import {useTabsStore} from '@/store/modules/tabsStore'
import {computed} from "vue";
const tabsStore = useTabsStore()
const keepAliveInclude = computed(() => tabsStore.getTabs.filter(it => it.meta.keepAlive).map(it => it.path.substring(it.path.lastIndexOf('/') + 1)))
const keepaliveIframes = computed(() => tabsStore.getTabs.filter(it => $common.filterIframeTabs(it)))
</script>
