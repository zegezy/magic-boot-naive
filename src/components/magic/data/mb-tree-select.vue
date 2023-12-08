<template>
    <n-tree-select
        ref="magicTreeSelect"
        v-model:value="selectValue"
        :options="options"
        :placeholder="placeholder || (itemLabel && '请选择' + itemLabel)"
        :multiple="multiple"
        v-bind="props.props"
        default-expand-all
    />
</template>

<script setup>
import { ref,nextTick } from "vue"
import { watchValue } from '@/components/magic/scripts/watch-join-update.js'
import { getTreeSelectData } from '@/api/components/mb-tree-select.js'

const magicTreeSelect = ref()
const emit = defineEmits(['update:modelValue'])
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
    props: Object,
    multiple: {
        type: Boolean,
        default: false
    },
    join: {
        type: Boolean,
        default: true
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
