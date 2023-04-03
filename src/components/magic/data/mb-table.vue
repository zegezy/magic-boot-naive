<template>
    <n-data-table
        v-if="showTable"
        v-bind="bindProps"
        ref="tableRef"
        :key="tableKey"
        :class="tableKey"
        :columns="columns"
        :virtual-scroll="virtualScroll"
        table-layout="fixed"
        style="height: 100%"
        flex-height
        :row-key="it => it.id"
        :default-expand-all="defaultExpandAll"
        @update:page="table.handlerPage"
    >
        <template #switch="{ row, col }">
            <mb-switch v-model="row[col.field]" @change="col.change(row)"
                       v-if="col.if != undefined ? col.if(row) : true"/>
            <span v-else>-</span>
        </template>
        <template #html="{ row, col }">
            <span v-html="row[col.field]"></span>
        </template>
        <template #buttons="{ row, col }">
            <template v-for="it in col.buttons">
                <template v-if="it.link">
                    <a v-if="it.if != undefined ? it.if(row) : true" v-permission="it.permission"
                       class="mx-1 cursor-pointer btn-blue" @click="it.click(row)">{{ it.label }}</a>
                </template>
            </template>
        </template>
        <template #dictType="{ row, col }">
            <span>{{ dictStore.getDictLabel(col.dictType, row[col.field] + '') }}</span>
        </template>
        <template #dynamic="{ row, col }">
            <slot :name="col.field" :row="row" :col="col"/>
        </template>
    </n-data-table>
</template>

<script setup>
import {ref, onMounted, nextTick, h} from 'vue'
import common from '@/scripts/common'
import {createTable} from './mb-table.js'
import MbSwitch from '@/components/magic/form/mb-switch.vue'
import {useDictStore} from "@/store/modules/dictStore";

const dictStore = useDictStore()

const props = defineProps({
    props: {
        type: Object,
        default: () => {
        }
    },
    virtualScroll: {
        type: Boolean,
        default: true
    },
    url: {
        type: String,
        default: ''
    },
    where: {
        type: Object,
        default: () => {
        }
    },
    cols: {
        type: Array,
        default: () => []
    },
    method: {
        type: String,
        default: 'post'
    },
    limit: {
        type: Number,
        default: 10
    },
    page: {
        type: Boolean,
        default: true
    },
    data: {
        type: Array,
        default: () => []
    },
    done: {
        type: Function,
        default: () => {
        }
    },
    loading: {
        type: Boolean,
        default: () => false
    }
})
const tableRef = ref()
const tableSlots = ref()
const columns = ref([])

function fixCols() {
    tableSlots.value = tableRef.value.$slots
    const keys = Object.keys(tableSlots.value)
    props.cols.forEach((col) => {
        let column = {}
        column.key = col.field
        column.title = col.label
        column.align = col.align
        column.width = col.width
        column.fixed = col.fixed
        let type = col.type
        if (!col.render && type && keys.indexOf(type) != -1) {
            renderSlot(col, type)
        } else {
            if (col.dictType) {
                renderSlot(col, 'dictType')
            }
        }
        if (col.render) {
            column.render = col.render
        }
        if (col.props) {
            for (let key in col.props) {
                column[key] = col.props[key]
            }
        }
        columns.value.push(column)
    })
}

function renderSlot(col, type) {
    col.render = (row) => {
        return h(tableSlots.value[type], {row, col})
    }
}

const tableKey = ref('magicTable' + common.uuid())
const table = createTable(props)
const bindProps = table.getBindProps()
const showTable = ref(true)
const defaultExpandAll = ref(false)

function expand() {
    showTable.value = false
    defaultExpandAll.value = true
    nextTick(() => showTable.value = true)
}

function toggleExpand() {
    showTable.value = false
    defaultExpandAll.value = !defaultExpandAll.value
    nextTick(() => showTable.value = true)
}

function reload() {
    table.loadData()
}

function renderExportData(sourceData) {
    let data = []
    let fields = props.cols.filter(it => it.type != 'buttons')
    sourceData.forEach(it => {
        let row = {}
        fields.forEach(f => {
            if (f.exportRender) {
                row[f.label] = f.exportRender(it)
            } else if (f.render) {
                row[f.label] = f.render(it)
            } else {
                row[f.label] = it[f.field]
            }
        })
        data.push(row)
    })
    return data
}

function exportExcel({fileName}) {
    if (props.url) {
        let where = common.renderWhere(props.where)
        where.size = 99999999
        let processData = (res) => {
            const {data} = res
            common.exportExcel({
                data: renderExportData(data.list),
                fileName: fileName
            })
        }
        if (props.method.toLowerCase() == 'post') {
            common.$post(props.url, where).then(res => {
                processData(res)
            })
        } else {
            common.$get(props.url, where).then(res => {
                processData(res)
            })
        }
    } else if (props.data) {
        common.exportExcel({
            data: props.data,
            fileName: fileName
        })
    }
}

onMounted(() => {
    fixCols()
    reload()
})

defineExpose({expand, toggleExpand, reload, exportExcel})

</script>
<style scoped>
.btn-blue {
    color: #2D8CF0;
}
</style>
