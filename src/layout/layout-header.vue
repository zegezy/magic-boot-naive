<template>
    <div class="layout-header-content">
        <div class="left-content">
            <breadcrumb-nav />
        </div>
        <div class="right-content">
            <user-info />
        </div>
    </div>
</template>

<script setup>
import UserInfo from './components/user-info.vue'
import BreadcrumbNav from './components/breadcrumb-nav.vue'
</script>

<style scoped lang="less">
.layout-header-content {
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;

    .left-content {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .right-content {
        display: flex;
        align-items: center;
    }
}
</style>
