<template>
    <n-input
        :size="$global.uiSize.value"
        v-model:value="selectValue"
        :type="type"
        :placeholder="placeholder || (itemLabel && '请输入' + itemLabel)"
        v-bind="props.props"
    />
</template>

<script setup>
import { useVModel } from "@vueuse/core";
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
    modelValue: String,
    itemLabel: String,
    placeholder: String,
    type: String,
    props: Object
})
const selectValue = useVModel(props, 'modelValue', emit)
</script>
