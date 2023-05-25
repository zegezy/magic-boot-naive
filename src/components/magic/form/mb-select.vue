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
        filterable
        max-tag-count="responsive"
    />
</template>

<script setup>

import {ref, watch, onMounted, computed} from 'vue'
import {useDictStore} from "@/store/modules/dictStore";
import common from '@/scripts/common'

const dictStore = useDictStore()
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
    clearable: {
        type: Boolean,
        default: true
    }
})

let join = false
const selectList = ref([])
const selectValue = ref(props.multiple ? [] : '')
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
    _value = $xe.isArray(_value) ? _value.join(',') : _value.toString()
    sv = $xe.isArray(sv) ? getSelectValue.value.join(',') : sv.toString()
    if(_value != sv){
        setValue(value)
    }
})

onMounted(() => {
    loadData()
})

let selectValueWatch = false

function setValue(value) {
    if($xe.isArray(value)){
        value = value.map(v => v.toString())
        selectValue.value = value
    }else if($xe.isNumber(value)){
        join = props.multiple
        selectValue.value = props.multiple ? value.toString().split(',') : value.toString()
    }else if($xe.isString(value)){
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
    if (props.type) {
        listConcat(dictStore.getDictType(props.type))
    } else if (props.url) {
        common.$get(props.url, props.params).then(res => {
            listConcat(handlerData(res.data.list || res.data))
        })
    } else if (props.options && props.options.length > 0) {
        listConcat(handlerData(props.options))
    }
}

function listConcat(dictData) {
    if(props.optionsFilter){
        dictData = dictData.filter(props.optionsFilter)
    }
    if (props.allOption) {
        selectList.value = [{
            value: '',
            label: '全部'
        }]
        selectList.value = selectList.value.concat(dictData)
    } else {
        selectList.value = dictData
    }
    setValue(props.modelValue)
}

function handlerData(data) {
    let newData = []
    data.forEach(it => {
        newData.push({
            label: it[props.labelField],
            value: it[props.valueField].toString()
        })
    })
    return newData
}

function getOptions(){
    return selectList.value
}

function expand(){
    magicSelect.value.$el.querySelector('.n-select > div').click()
}

defineExpose({ getOptions, expand })

</script>
