<template>
    <n-checkbox-group ref="magicCheckbox" v-model:value="checkboxValue">
        <n-space item-style="display: flex;">
            <n-checkbox v-for="it in options" :value="it.value" :label="it.label" :key="it.value" />
        </n-space>
    </n-checkbox-group>
</template>

<script setup>

import { ref, watch, onMounted } from 'vue'
import { getCheckboxData } from '@/api/components/mb-checkbox.js'
import { watchValue } from "@/components/magic/scripts/watch-join-update";
import { isArray } from "lodash-es";

const magicCheckbox = ref()
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
    join: {
        type: Boolean,
        default: true
    },
    defaultFirstItem: {
        type: Boolean,
        default: false
    },
    done: {
        type: Function,
        default: () => {}
    },
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
