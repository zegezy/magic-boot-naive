<template>
    <n-switch
        ref="magicSwitch"
        :size="$global.uiSize.value"
        v-model:value="selectValue"
        :checked-value="_checkedValue"
        :unchecked-value="_uncheckedValue"
        v-bind="props.props"
        @update:value="change"
    />
</template>

<script setup>
import {ref, watch} from 'vue'

const emit = defineEmits(['update:modelValue', 'change'])
const selectValue = ref('')
const props = defineProps({
    modelValue: Boolean | String | Number,
    checkedValue: Boolean | String | Number,
    uncheckedValue: Boolean | String | Number,
    props: Object
})
const _checkedValue = ref(true)
const _uncheckedValue = ref(false)

function change() {
    emit('update:modelValue', selectValue.value)
    emit('change', selectValue.value)
}

function setActive(value) {
    if($common.notEmptyNot01(value)){
        if (typeof (value) == 'boolean') {
            _checkedValue.value = true
            _uncheckedValue.value = false
        } else {
            if (props.checkedValue == undefined && props.uncheckedValue == undefined) {
                _checkedValue.value = '1'
                _uncheckedValue.value = '0'
            } else {
                _checkedValue.value = props.checkedValue + ''
                _uncheckedValue.value = props.uncheckedValue + ''
            }
        }
    }else{
        _checkedValue.value = props.checkedValue || true
        _uncheckedValue.value = props.uncheckedValue || false
    }
}

dynamicSetValue(props.modelValue)
setActive(props.modelValue)
watch(() => props.modelValue, (value) => {
    dynamicSetValue(value)
    setActive(value)
})

function dynamicSetValue(value) {
    if (typeof (value) == 'boolean') {
        selectValue.value = value
    } else {
        if (value || value == 0) {
            selectValue.value = value + ''
        } else {
            selectValue.value = false
        }
    }
}

watch(selectValue, (value) => {
    emit('update:modelValue', value)
})
</script>
