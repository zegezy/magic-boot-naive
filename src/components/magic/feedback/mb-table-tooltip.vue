<template>
    <span>
        <span v-if="getNowrap" @mouseover="onMouseover">
            <n-ellipsis :tooltip="tooltip">
                <slot />
            </n-ellipsis>
        </span>
        <span v-else>
            <slot />
        </span>
    </span>
</template>

<script setup>
// 表格单元格提示组件
import {computed, ref} from 'vue'
import componentProperties from "@/components/magic-component-properties.js";

const props = defineProps({
    // 是否不换行
    nowrap: {
        type: Boolean,
        default: true
    }
})
const getNowrap = computed(() => props.nowrap !== undefined ? props.nowrap : componentProperties.table.nowrap !== undefined ? componentProperties.table.nowrap : false)
const tooltip = ref()
tooltip.value = false
let timers
let duration
function onMouseover(){
    clearTimeout(timers)
    const onUpdateShow = (value) => {
        if (!value) {
            timers = setTimeout(() => {
                tooltip.value = false
            }, (duration ?? 100) + 1000)
        }
    }
    tooltip.value = { onUpdateShow }
}

</script>
