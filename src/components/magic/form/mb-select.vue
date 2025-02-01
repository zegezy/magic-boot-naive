<template>
    <n-select
        ref="magicSelect"
        :size="$global.uiSize.value"
        v-bind="props.props"
        v-model:value="selectValue"
        :multiple="multiple"
        :options="options"
        :style="{ width }"
        :placeholder="placeholder || (itemLabel && '请输入' + itemLabel)"
        :clearable="clearable"
        :show-on-focus="showOnFocus"
        filterable
        max-tag-count="responsive"
    />
</template>

<script setup>
// 下拉选择组件
import { ref, watch, onMounted } from 'vue'
import { getSelectData } from '@/api/components/mb-select.js'
import { watchValue } from "@/components/magic/scripts/watch-join-update";
import { isArray } from "lodash-es";

const magicSelect = ref()
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
    // 组件宽度
    width: {
        type: String,
        default: '100%'
    },
    // 是否显示全部选项
    allOption: {
        type: Boolean,
        default: false
    },
    // 占位提示
    placeholder: {
        type: String,
        default: ''
    },
    // 选项标签
    itemLabel: String,
    // 是否多选
    multiple: {
        type: Boolean,
        default: false
    },
    // 多选时是否使用逗号连接
    join: {
        type: Boolean,
        default: true
    },
    // 是否可清空
    clearable: {
        type: Boolean,
        default: true
    },
    // 是否在获得焦点时显示选项
    showOnFocus: {
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
    }
})
const options = ref([])
const selectValue = ref(props.multiple ? [] : null)

watch(() => [props.type, props.url, props.options], () => {
    loadData()
}, {deep: true})

onMounted(() => {
    loadData()
})

let watchList = []
function loadData() {
    getSelectData({
        type: props.type,
        url: props.url,
        params: props.params,
        options: props.options,
        optionsFilter: props.optionsFilter,
        allOption: props.allOption,
        labelField: props.labelField,
        valueField: props.valueField
    }).then(data => {
        options.value = data
        props.done(data)
        $common.stopWatchList(watchList)
        watchList = watchValue(selectValue, props, emit)
        if(props.defaultFirstItem && options.value && options.value[0]){
            let defaultValue = options.value[0].value
            selectValue.value = isArray(selectValue.value) ? [defaultValue] : defaultValue
        }
    })
}

function getOptions(){
    return options.value
}

defineExpose({ getOptions })

</script>
