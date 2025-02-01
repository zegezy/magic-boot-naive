<template>
    <svg
        v-if="dynamic"
        aria-hidden="true"
        class="mb-icon"
        :fill="color"
        :style="{ width: size, height: size }"
    >
        <use :xlink:href="symbolId" :class="className"/>
        <title>{{ title }}</title>
    </svg>
    <n-icon
        v-else
        :color="color"
        :size="size"
        :title="title"
    >
        <component :is="xicons[icon]" />
    </n-icon>
</template>

<script setup>
// 图标组件
import { computed, ref } from 'vue'
import xicons from '@/scripts/xicons'
import svgIcons from '@/scripts/svg-icons'

const props = defineProps({
    // 图标名称
    icon: {
        type: String,
        required: true
    },
    // 图标前缀
    prefix: {
        type: String,
        default: 'mb-icon'
    },
    // 图标大小
    size: {
        type: String,
        default: '1em'
    },
    // 图标颜色
    color: {
        type: String,
        default: 'currentColor'
    },
    // 鼠标悬浮显示标题
    title: {
        type: String,
        default: ''
    }
});
const symbolId = computed(() => props.icon&&props.icon.startsWith('#') ? props.icon : `#${props.prefix}-${props.icon}`)
const className = computed(() => props.icon&&props.icon.startsWith('#') ? props.icon.substring(1) : `${props.prefix}-${props.icon}`)
const dynamic = ref(false)
if(svgIcons.indexOf(props.icon) != -1){
    dynamic.value = true
}
</script>
<style scoped>
.mb-icon {
	vertical-align: -0.25em;
	overflow: hidden;
}
</style>
