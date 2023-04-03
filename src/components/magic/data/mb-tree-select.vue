<template>
    <n-tree-select
        v-model:value="selectValue"
        :options="options"
        :placeholder="placeholder || (itemLabel && '请选择' + itemLabel)"
        v-bind="props.props"
        default-expand-all
    />
</template>

<script setup>
import {ref, watch} from "vue"
import treeTable from '@/scripts/treeTable'
import common from '@/scripts/common'

const emit = defineEmits(['update:modelValue'])
const selectValue = ref(null)
const props = defineProps({
    modelValue: {
        type: String,
        default: null
    },
    url: {
        type: String,
        default: '',
        required: true
    },
    itemLabel: String,
    placeholder: String,
    props: Object
})

selectValue.value = props.modelValue
watch(() => props.modelValue, (value) => {
    selectValue.value = value
})
watch(selectValue, (value) => {
    emit('update:modelValue', value)
})

const options = ref([])

common.$get(props.url).then(res => {
    options.value = res.data.list
    treeTable.deleteEmptyChildren(options.value)
})

</script>
