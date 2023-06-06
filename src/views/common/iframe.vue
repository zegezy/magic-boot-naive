<script setup>
const props = defineProps({
    url: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <iframe :src="url" width="100%" height="99%" frameborder="0"></iframe>
</template>
