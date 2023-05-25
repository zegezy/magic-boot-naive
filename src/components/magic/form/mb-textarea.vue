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
import { useVModel } from "@vueuse/core";
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
    modelValue: String,
    props: Object,
    itemLabel: String,
    placeholder: String,
    rows: Number
})
const selectValue = useVModel(props, 'modelValue', emit)
</script>
