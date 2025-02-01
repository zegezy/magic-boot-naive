<template>
    <n-input
        ref="magicTextarea"
        :size="$global.uiSize.value"
        v-model:value="selectValue"
        type="textarea"
        :placeholder="placeholder || (itemLabel && '请输入' + itemLabel)"
        v-bind="props.props"
        :rows="rows"
    />
</template>

<script setup>
// 文本域组件
import { useVModel } from "@vueuse/core";
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
    // 绑定值
    modelValue: {
        type: String,
        default: ''
    },
    // 选项标签
    itemLabel: String,
    // 占位提示
    placeholder: String,
    // 组件属性配置
    props: Object,
    // 文本域行数
    rows: {
        type: Number,
        default: 3
    }
})
const selectValue = useVModel(props, 'modelValue', emit)
</script>
