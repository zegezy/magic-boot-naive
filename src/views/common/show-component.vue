<script setup>
const props = defineProps({
    name: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <transition name="fade" mode="out-in" appear>
        <component :is="props.name"></component>
    </transition>
</template>
