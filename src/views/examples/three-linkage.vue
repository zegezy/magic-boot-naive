<template>
    <div>
        <n-select v-for="(data, i) in dataList" :options="data" :key="i" label-field="name" value-field="id" v-model:value="dataValues[i]" :placeholder="'请选择' + (i+1) + '级'" @update-value="selectChange" />
    </div>
</template>

<script setup>
import {reactive} from 'vue'

let dataList = reactive([[], [], []])
let dataValues = reactive([])
let threeLinkageData = reactive([{
    "id": 1,
    "name": "1",
    "pid": 0,
    "level": 0
}, {
    "id": 2,
    "name": "2",
    "pid": 0,
    "level": 0
}, {
    "id": 3,
    "name": "1-1",
    "pid": 1,
    "level": 1
}, {
    "id": 4,
    "name": "1-2",
    "pid": 1,
    "level": 1
}, {
    "id": 5,
    "name": "2-1",
    "pid": 2,
    "level": 1
}, {
    "id": 6,
    "name": "2-2",
    "pid": 2,
    "level": 1
}, {
    "id": 7,
    "name": "1-1-3-1",
    "pid": 3,
    "level": 2
}, {
    "id": 8,
    "name": "1-1-3-2",
    "pid": 3,
    "level": 2
}, {
    "id": 9,
    "name": "1-2-3-1",
    "pid": 4,
    "level": 2
}, {
    "id": 10,
    "name": "1-2-3-2",
    "pid": 4,
    "level": 2
}])
dataList[0] = threeLinkageData.filter(it => it.level === 0)

function selectChange(id) {
    let currLevel = threeLinkageData.filter(it => it.id === id).map(it => it.level)[0]
    dataList.forEach((it, i) => {
        if (i > currLevel) {
            dataList[i] = []
            dataValues[i] = ''
        }
    })
    if (currLevel + 1 !== dataList.length) {
        dataList[currLevel + 1] = threeLinkageData.filter(it => it.pid == id)
    }
}
</script>

