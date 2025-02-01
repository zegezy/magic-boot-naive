<template>
    <n-input
        ref="magicInput"
        :size="$global.uiSize.value"
        v-model:value="selectValue"
        :type="type"
        :placeholder="placeholder || (itemLabel && '请输入' + itemLabel)"
        v-bind="props.props"
    />
</template>

<script setup>
// 输入框组件
import { useVModel } from "@vueuse/core";
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
    // 绑定值
    modelValue: String,
    // 选项标签
    itemLabel: String,
    // 占位提示
    placeholder: String,
    // 输入框类型
    type: String,
    // 组件属性配置
    props: Object
})
const selectValue = useVModel(props, 'modelValue', emit)
</script>
