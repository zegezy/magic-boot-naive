<template>
    <n-tree-select
        ref="magicTreeSelect"
        v-model:value="selectValue"
        :options="options"
        :placeholder="placeholder || (itemLabel && '请选择' + itemLabel)"
        :multiple="multiple"
        :key-field="valueField"
        :label-field="labelField"
        v-bind="props.props"
        default-expand-all
        filterable
    />
</template>

<script setup>
// 树形选择组件
import { ref, nextTick } from "vue"
import { watchValue } from '@/components/magic/scripts/watch-join-update.js'
import { getTreeSelectData } from '@/api/components/mb-tree-select.js'

const magicTreeSelect = ref()
const emit = defineEmits([
    // 值变化时触发
    'update:modelValue'
])
const props = defineProps({
    // 绑定值
    modelValue: {
        type: String,
        default: null
    },
    // 数据源URL
    url: {
        type: String,
        default: '',
        required: true
    },
    // 选项标签
    itemLabel: String,
    // 占位提示
    placeholder: String,
    // 组件属性配置
    props: Object,
    // 是否多选
    multiple: {
        type: Boolean,
        default: false
    },
    // 多选时是否使用逗号拼接
    join: {
        type: Boolean,
        default: true
    },
    // 标签字段名
    labelField: {
        type: String,
        default: 'label'
    },
    // 值字段名
    valueField: {
        type: String,
        default: 'key'
    }
})

const selectValue = ref(props.multiple ? [] : null)
const options = ref([])

getTreeSelectData(props).then(data => {
    options.value = data
    watchValue(selectValue, props, emit)
})

function expand(){
    nextTick(() => magicTreeSelect.value.handleTriggerClick())
}

defineExpose({ expand })

</script>
