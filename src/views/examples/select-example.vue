<template>
    <div style="padding: 50px;">
        <h2>多选</h2>
        <n-button type="primary" @click="getData" style="margin-bottom: 10px">获取数据</n-button>
        <mb-select v-model="dictType" type="dict_type" :options-filter="it => it.label != 'test'" multiple @change="change"/>
    </div>
</template>

<script setup>

import { ref, watch } from 'vue'

const dictType = ref(0)

function getData() {
    console.log(dictType.value)
}

function change(value) {
    console.log('change', value)
}

</script>
