<template>
    <n-date-picker
        :size="$global.uiSize.value"
        v-model:formatted-value="selectValue"
        :type="type"
        :format="valueFormat"
        :value-format="valueFormat"
        :placeholder="placeholder"
        :start-placeholder="startPlaceholder"
        :end-placeholder="endPlaceholder"
        update-value-on-close
        v-bind="props.props"
    />
</template>

<script setup>
import {watch, ref} from 'vue'

const emit = defineEmits(['update:modelValue'])
const selectValue = ref('')
const props = defineProps({
    modelValue: String,
    type: {
        type: String,
        default: 'date'
    },
    placeholder: {
        type: String,
        default: '请选择时间'
    },
    format: {
        type: String,
        default: ''
    },
    startPlaceholder: {
        type: String,
        default: '开始时间'
    },
    endPlaceholder: {
        type: String,
        default: '结束时间'
    },
    props: Object
})

selectValue.value = props.modelValue
watch(() => props.modelValue, (value) => {
    console.log(value)
    selectValue.value = value
})
const valueFormat = ref()
if (!props.format) {
    if (props.type.startsWith('date')) {
        valueFormat.value = 'yyyy-MM-dd'
    }
    if (props.type.startsWith('datetime')) {
        valueFormat.value = 'yyyy-MM-dd HH:mm:ss'
    }
} else {
    valueFormat.value = props.format
}
watch(selectValue, (value) => {
    emit('update:modelValue', value)
})
</script>
