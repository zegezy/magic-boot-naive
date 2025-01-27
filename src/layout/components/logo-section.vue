<template>
    <div class="logo-container nav-bg">
        <p class="logo-text" v-if="!props.collapsed">{{ $global.title }}</p>
        <p class="logo-text" v-else>{{ $global.title.substring(0, 1) }}</p>
    </div>
</template>

<script setup>
const props = defineProps({
    collapsed: {
        type: Boolean,
        default: false
    }
})
</script> 