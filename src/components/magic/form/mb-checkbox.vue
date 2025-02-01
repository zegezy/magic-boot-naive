<template>
    <n-checkbox-group ref="magicCheckbox" v-model:value="checkboxValue">
        <n-space item-style="display: flex;">
            <n-checkbox v-for="it in options" :value="it.value" :label="it.label" :key="it.value" />
        </n-space>
    </n-checkbox-group>
</template>

<script setup>
// 复选框组件
import { ref, watch, onMounted } from 'vue'
import { getCheckboxData } from '@/api/components/mb-checkbox.js'
import { watchValue } from "@/components/magic/scripts/watch-join-update";
import { isArray } from "lodash-es";

const magicCheckbox = ref()
const emit = defineEmits(['update:modelValue', 'change'])
const props = defineProps({
    // 绑定值
    modelValue: {
        required: true
    },
    // 选项类型
    type: {
        type: String,
        default: ''
    },
    // 选项数据
    options: {
        type: Array,
        default: () => []
    },
    // 选项过滤函数
    optionsFilter: {
        type: Function,
        default: undefined
    },
    // 远程加载URL
    url: {
        type: String,
        default: ''
    },
    // 请求参数
    params: {
        type: Object,
        default: () => {
        }
    },
    // 标签字段名
    labelField: {
        type: String,
        default: 'label'
    },
    // 值字段名
    valueField: {
        type: String,
        default: 'value'
    },
    // 组件属性配置
    props: {
        type: Object,
        default: () => {
        }
    },
    // 多选时是否使用逗号连接
    join: {
        type: Boolean,
        default: true
    },
    // 是否默认选中第一项
    defaultFirstItem: {
        type: Boolean,
        default: false
    },
    // 数据加载完成回调
    done: {
        type: Function,
        default: () => {}
    },
    // 是否多选
    multiple: {
        type: Boolean,
        default: true
    }
})
const options = ref([])
const checkboxValue = ref([])

watch(() => [props.type, props.url, props.options], () => {
    loadData()
}, {deep: true})

onMounted(() => {
    loadData()
})

let watchList = []
function loadData() {
    getCheckboxData({
        type: props.type,
        url: props.url,
        params: props.params,
        options: props.options,
        optionsFilter: props.optionsFilter,
        labelField: props.labelField,
        valueField: props.valueField
    }).then(data => {
        options.value = data
        props.done(data)
        $common.stopWatchList(watchList)
        watchList = watchValue(checkboxValue, props, emit)
        if(props.defaultFirstItem && options.value && options.value[0]){
            let defaultValue = options.value[0].value
            checkboxValue.value = isArray(checkboxValue.value) ? [defaultValue] : defaultValue
        }
    })
}

function getOptions(){
    return options.value
}

defineExpose({ getOptions })

</script>
