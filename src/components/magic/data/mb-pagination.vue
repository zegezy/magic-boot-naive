<template>
    <div style="display: flex; align-items: center;" :style="{ height: height + 'px' }">
        <n-pagination
            :page="page"
            :page-size="pageSize"
            :item-count="itemCount"
            :page-sizes="[10, 20, 50, 100, 200]"
            @updatePage="emit('update-page', $event)"
            @updatePageSize="emit('update-page-size', $event)"
            show-quick-jumper
            style="margin: 0 auto;"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps({
    page: {
        type: Number,
        default: 1
    },
    pageSize: {
        type: Number,
        default: 10
    },
    itemCount: {
        type: Number,
        default: undefined
    }
})
const emit = defineEmits(['update-page', 'update-page-size', 'mounted'])
onMounted(() => {
    emit('mounted')
})
const height = ref(50)
defineExpose({
    getHeight() {
        return height.value;
    }
})
</script>
