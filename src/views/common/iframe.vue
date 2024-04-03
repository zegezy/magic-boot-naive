<script setup>
const props = defineProps({
    url: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <transition name="fade" mode="out-in" appear>
        <iframe :src="url" width="100%" height="99%" frameborder="0"></iframe>
    </transition>
</template>
