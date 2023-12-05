<template>
    <n-select
        ref="magicSelect"
        :size="$global.uiSize.value"
        v-bind="props.props"
        v-model:value="selectValue"
        :multiple="multiple"
        :options="selectList"
        :style="{ width }"
        :placeholder="placeholder || (itemLabel && '请输入' + itemLabel)"
        :clearable="clearable"
        :show-on-focus="showOnFocus"
        filterable
        max-tag-count="responsive"
    />
</template>

<script setup>

import {ref, watch, onMounted, computed} from 'vue'
import { isArray, isNumber, isString } from 'lodash-es'
import { getSelectData } from './mb-select.js'

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
    }
})

let join = props.join
if(!props.multiple){
    join = false
}
const selectList = ref([])
const selectValue = ref(props.multiple ? [] : null)
const getSelectValue = computed(() => {
    if (join) {
        return selectValue.value.join(',')
    } else {
        return selectValue.value
    }
})

watch(() => [props.type, props.url, props.options], () => {
    loadData()
}, {deep: true})

watch(() => props.modelValue, (value) => {
    let _value = value
    let sv = getSelectValue.value
    _value = isArray(_value) ? _value.join(',') : _value && _value.toString()
    sv = isArray(sv) ? getSelectValue.value.join(',') : sv && sv.toString()
    // 如果传过来的值和选择的值不一样则更新
    if(_value != sv){
        setValue(value)
    }
})

onMounted(() => {
    loadData()
})

let selectValueWatch = false

function setValue(value) {
    if(isArray(value)){
        value = value.map(v => v.toString())
        selectValue.value = value
    }else if(isNumber(value)){
        join = props.multiple
        selectValue.value = props.multiple ? value.toString().split(',') : value.toString()
    }else if(isString(value)){
        join = props.multiple
        selectValue.value = props.multiple ? value.split(',') : value
    }
    if (!selectValueWatch) {
        watch(selectValue, (value) => {
            if (join) {
                emit('update:modelValue', value.join(','))
                emit('change', value.join(','))
            } else {
                emit('update:modelValue', value)
                emit('change', value)
            }
        })
    }
    selectValueWatch = true
}

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
        selectList.value = data
        setValue(props.modelValue)
    })
}

function getOptions(){
    return selectList.value
}

defineExpose({ getOptions })

</script>
