<!--
    Magic-Boot 单选字典组件
    @author Yean
-->
<template>
    <n-radio-group :size="$global.uiSize.value" :value="modelValue" @change="handleChange">
        <n-radio-button v-for="item in dictList" :key="item.value" :value="item.value" v-if="isButton">
            {{ item.label }}
        </n-radio-button>
        <n-radio v-for="item in dictList" :key="item.value" :value="item.value" v-else>{{ item.label }}</n-radio>
    </n-radio-group>
</template>

<script setup>
// 单选字典组件
import {ref, watch} from "vue";
import {useDictStore} from "@/store/modules/dictStore";

const emits = defineEmits(['update:modelValue'])

const dictStore = useDictStore();

const modelValue = ref();

const dictList = ref([]);

const props = defineProps({
    // 选中值
    modelValue: {
        type: [String, Number],
        default: ''
    },
    // 字典Key值
    dictKey: {
        type: String,
        default: ''
    },
    // 是否为按钮模式
    isButton: {
        type: Boolean,
        default: false
    }
})

if (props.dictKey) {
    dictList.value = dictStore.getDictType(props.dictKey);
}

if (props.modelValue) {
    modelValue.value = props.modelValue;
}

watch(() => props.modelValue, value => {
    modelValue.value = value;
})

watch(() => props.dictKey, value => {
    if (value) {
        dictList.value = dictStore.getDictType(value);
    }
})

const handleChange = (e) => {
    emits("update:modelValue", e.target.value)
}
</script>

<style scoped>

</style>