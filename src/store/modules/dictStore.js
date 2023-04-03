import {defineStore} from 'pinia'
import common from '@/scripts/common'

export const useDictStore = defineStore('dict', () => {
    let dictData = []

    async function getDictData() {
        await common.$get('/system/dict/items/all').then(res => {
            dictData = res.data
        })
    }

    function getDictType(type) {
        return dictData.filter(it => it.type === type)
    }

    function getDictLabel(type, value) {
        value = (value || '') + ''
        let values = []
        value.split(',').forEach(v => {
            const list = dictData.filter(it => it.type === type && it.value === v + '')
            values.push(list && list[0] && list[0].label || '')
        })
        return values.join(',')
    }

    return {
        getDictData,
        getDictType,
        getDictLabel
    }
})