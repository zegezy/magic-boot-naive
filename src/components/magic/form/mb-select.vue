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

import { ref, watch, onMounted } from 'vue'
import { getSelectData } from '@/api/components/mb-select.js'
import { watchValue } from "@/components/magic/scripts/watch-join-update";
import { isArray } from "lodash-es";

const magicSelect = ref()
const emit = defineEmits(['update:modelValue', 'change'])
const props = defineProps({
    modelValue: {
        required: true
    },
    type: {
        type: String,
        default: ''
    },
    options: {
        type: Array,
        default: () => []
    },
    optionsFilter: {
        type: Function,
        default: undefined
    },
    url: {
        type: String,
        default: ''
    },
    params: {
        type: Object,
        default: () => {
        }
    },
    labelField: {
        type: String,
        default: 'label'
    },
    valueField: {
        type: String,
        default: 'value'
    },
    props: {
        type: Object,
        default: () => {
        }
    },
    width: {
        type: String,
        default: '100%'
    },
    allOption: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: ''
    },
    itemLabel: String,
    multiple: {
        type: Boolean,
        default: false
    },
    join: {
        type: Boolean,
        default: true
    },
    clearable: {
        type: Boolean,
        default: true
    },
    showOnFocus: {
        type: Boolean,
        default: true
    },
    defaultFirstItem: {
        type: Boolean,
        default: false
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
