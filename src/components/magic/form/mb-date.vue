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
// 日期选择组件
import {watch, ref} from 'vue'

const emit = defineEmits(['update:modelValue'])
const selectValue = ref('')
const props = defineProps({
    // 绑定值
    modelValue: String,
    // 日期选择类型
    type: {
        type: String,
        default: 'date'
    },
    // 占位提示
    placeholder: {
        type: String,
        default: '请选择时间'
    },
    // 日期格式
    format: {
        type: String,
        default: ''
    },
    // 开始日期占位提示
    startPlaceholder: {
        type: String,
        default: '开始时间'
    },
    // 结束日期占位提示
    endPlaceholder: {
        type: String,
        default: '结束时间'
    },
    // 组件属性配置
    props: Object
})

function handlerValue(value){
    if(value && value.indexOf(',') !== -1){
        return value.split(',')
    }
    return value
}

selectValue.value = handlerValue(props.modelValue)
watch(() => props.modelValue, (value) => {
    if(!$common.arrayStringEq(value, selectValue.value)){
        selectValue.value = handlerValue(value)
    }
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
    emit('update:modelValue', value instanceof Array ? value.join(',') : value)
})
</script>
