<style scoped>
:deep(.n-data-table-tr){
    height: 60px;
    position: relative;
}
.edit-text:hover{
    border: 1px dashed #ccc;
}
.edit-text-not-allowed{
    cursor: not-allowed;
}
</style>

<template>
    <mb-table ref="magicTable" v-bind="tableOptions">
        <template v-for="(col, colIndex) in cols" #[col.field]="{ row }">
            <template v-if="dataList[row._index_]">
                <template v-if="!col.alwaysEdit && !edits[row._index_ + '' + colIndex] && col.component">
                    <div
                        v-if="getIsEdit(col.edit, dataList[row._index_])"
                        @click="colClick(row._index_, colIndex, col)"
                        class="edit-text"
                        :style="col.labelStyle"
                    >
                        {{ getLabel(row._index_, col) }}&nbsp;
                    </div>
                    <div
                        v-if="!getIsEdit(col.edit, dataList[row._index_])"
                        class="edit-text-not-allowed"
                        :style="col.labelStyle"
                    >
                        {{ getLabel(row._index_, col) }}&nbsp;
                    </div>
                </template>
                <div v-if="!col.component" :style="col.labelStyle">
                    {{ dataList[row._index_][col.field] }}
                </div>
                <component
                    v-if="col.alwaysEdit || (edits[row._index_ + '' + colIndex] && currentRowIndex == row._index_ && currentColIndex == colIndex)"
                    :ref="(el) => setComponentRef(row._index_, colIndex, el, col)"
                    :is="col.component.startsWith('n-') ? col.component : 'mb-' + col.component"
                    v-model="dataList[row._index_][col.field]"
                    v-bind="col.props"
                    :style="col.componentStyle"
                    @change="dataChange"
                    @blur="componentBlur(row._index_, colIndex, col)"
                />
            </template>
        </template>
    </mb-table>
</template>

<script setup>

import { reactive, ref, watch, nextTick, toRaw } from 'vue'
import common from '@/scripts/common'

const emit = defineEmits(['update:modelValue', 'change'])

const magicTable = ref()
const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    cols: {
        type: Array,
        default: () => []
    },
    showNo: {
        type: Boolean,
        default: true
    },
    operation: {
        type: Boolean,
        default: true
    },
    page: {
        type: Boolean,
        default: false
    },
    rowKey: {
        type: String,
        default: 'id'
    }
})

const tableOptions = reactive({
    data: props.modelValue,
    cols: [],
    page: props.page,
    showNo: props.showNo,
    selectedRowEnable: false,
    rowKey: props.rowKey
})
const currentColIndex = ref(0)
const currentRowIndex = ref(0)
const edits = ref({})
dataAddIndex(props.modelValue)
const dataList = ref(props.modelValue || [])

for (let i in props.cols) {
    let col = props.cols[i]
    tableOptions.cols.push({
        ...col,
        type: 'dynamic',
        editIcon: col.component ? true : false
    })
}

if(props.operation){
    tableOptions.cols.push({
        label: '操作',
        type: 'buttons',
        width: 85,
        fixed: 'right',
        buttons: [{
            label: '删除',
            click: (row) => {
                deleteRow(row)
            }
        }]
    })
    tableOptions.cols.push({
        label: '添加下级',
        type: 'buttons',
        width: 120,
        fixed: 'right',
        buttons: [{
            label: '添加下级',
            click: (row) => {
                addChildrenRow(row)
            }
        }]
    })
    tableOptions.cols.push({
        label: '添加同级',
        type: 'buttons',
        width: 120,
        fixed: 'right',
        buttons: [{
            label: '添加同行',
            click: (row) => {
                addRow(row)
            }
        }]
    })
}

function addRow(row){
    recursionAddRow(tableOptions.data, row._index_)
    dataAddIndex(tableOptions.data)
}

function recursionAddRow(children, index){
    children.forEach(it => {
        if(it._index_ == index){
            children.push({[props.rowKey]: common.uuid()})
        }
        if(it.children && it.children.length > 0){
            recursionAddRow(it.children, index)
        }
    })
}

function addChildrenRow(row){
    if(row.children && row.children.length > 0){
        row.children.push({[props.rowKey]: common.uuid()})
    }else{
        row.children = [{[props.rowKey]: common.uuid()}]
    }
    dataAddIndex(tableOptions.data)
}

function dataAddIndex(children){
    let index = { index: 0 }
    recursionAddIndex(children, index)
}

function recursionAddIndex(children, index){
    children.forEach(it => {
        it._index_ = index.index
        index.index++
        if(it.children && it.children.length > 0){
            recursionAddIndex(it.children, index)
        }
    })
}

function deleteRow(row){
    recursionDelete(tableOptions.data, row._index_)
    dataAddIndex(tableOptions.data)
}

function recursionDelete(children, index){
    children.forEach((it, i) => {
        if(it._index_ == index){
            children.splice(i, 1)
        }
        if(it.children && it.children.length > 0){
            recursionDelete(it.children, index)
        }
    })
}

watch(() => props.modelValue, (value) => {
    dataAddIndex(value)
    tableOptions.data = value
}, {
    deep: true
})

function recursionRearrange(children){
    const list = []
    children.forEach(it => {
        list.push(it)
        if(it.children && it.children.length > 0){
            list.push(...recursionRearrange(it.children))
        }
    })
    return list
}

watch(() => tableOptions.data, (value) => {
    dataList.value = recursionRearrange(value)
},{
    deep: true
})

function getIsEdit(edit, row){
    if(typeof(edit) == 'boolean'){
        return edit
    }
    if(typeof(edit) == 'function'){
        return edit(row)
    }
    return true
}

function getLabel(index, col){
    let value = dataList.value[index][col.field]
    if(col.component == 'select'){
        return value && showLabelDatas[col.field] && showLabelDatas[col.field].filter(it => it.value == value)[0].label
    }
    return value
}

function colClick(rowIndex, colIndex, col){
    if(col.component){
        currentRowIndex.value = rowIndex
        currentColIndex.value = colIndex
        edits.value[rowIndex + '' + colIndex] = true
    }
}

let currentEditRef = null
const showLabelDatas = reactive({})
function componentBlur(rowIndex, colIndex, col){
    edits.value[rowIndex + '' + colIndex] = false
    if(col.component == 'select'){
        showLabelDatas[col.field] = currentEditRef.getOptions()
    }
}

function componentInit(el, col){
    if(col.component == 'textarea'){
        col.componentStyle = col.componentStyle || {}
        let parentNodeRect = el.$el.parentNode.getBoundingClientRect()
        let tableRect = magicTable.value.$el.getBoundingClientRect()
        let tableWidth = magicTable.value.$el.clientWidth
        let left = parentNodeRect.left - tableRect.left
        col.componentStyle.position = 'absolute'
        col.componentStyle['z-index'] = 1
        col.componentStyle.width = col.componentStyle.width || parentNodeRect.width + 'px'
        if(tableWidth - left - col.componentStyle.width.match(/\d+/)[0] < 1){
            col.componentStyle.right = `1px`
            col.componentStyle.left = 'unset'
        }else{
            col.componentStyle.left = `${left}px`
            col.componentStyle.right = 'unset'
        }
        col.componentStyle.top = '1px'
    }
    if(col.component == 'select'){
        el.expand()
    }
}

function setComponentRef(rowIndex, colIndex, el, col){
    if(el && edits.value[rowIndex + '' + colIndex]){
        currentEditRef = el
        nextTick(() => {
            let key = Object.keys(toRaw(el.$refs))[0]
            key && (el.$refs[key].focus && el.$refs[key].focus() || el.$refs[key].$el.focus())
            componentInit(el, col)
        })
    }
}

function dataChange() {
    console.log('更新')
    console.log(tableOptions.data)
    emit('update:modelValue', tableOptions.data)
    emit('change', tableOptions.data)
}

</script>
