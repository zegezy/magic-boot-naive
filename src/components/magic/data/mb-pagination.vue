<template>
    <div class="pagination-container" style="height: 50px">
        <n-pagination
            :page="page"
            :page-size="pageSize"
            :item-count="itemCount"
            :page-sizes="[10, 20, 50, 100, 200]"
            @updatePage="emit('update-page', $event)"
            @updatePageSize="emit('update-page-size', $event)"
            show-quick-jumper
            show-size-picker
            style="margin: 0 auto;"
        />
    </div>
</template>

<script setup>
// 分页组件
const props = defineProps({
    // 当前页码
    page: {
        type: Number,
        default: 1
    },
    // 每页显示条数
    pageSize: {
        type: Number,
        default: 10
    },
    // 总条数
    itemCount: {
        type: Number,
        default: undefined
    }
})
const emit = defineEmits(['update-page', 'update-page-size'])
</script>

<style scoped>
.pagination-container{
    display: flex;
    align-items: center;
}
</style>
