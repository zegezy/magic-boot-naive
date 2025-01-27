<template>
    <n-breadcrumb v-if="layoutConfig.showBreadcrumb">
        <n-breadcrumb-item>
            首页
        </n-breadcrumb-item>
        <n-breadcrumb-item>
            {{ $router.currentRoute.value.meta.title }}
        </n-breadcrumb-item>
    </n-breadcrumb>
</template>

<script setup>
import { useLayoutConfigStore } from '@/store/modules/layoutConfigStore'

const layoutConfig = useLayoutConfigStore()
</script> 