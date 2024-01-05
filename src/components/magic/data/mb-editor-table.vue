<style scoped>
.edit-text{
    min-height: 80%;
}
:deep(.n-data-table-tr:hover .edit-text){
    border: var(--mb-editor-table-tr-hover-border)
}
.edit-text:hover{
    border: 1px dashed #ccc !important;
}
.edit-text-not-allowed{
    cursor: not-allowed;
}
:deep(.n-data-table-td){
    height: 60px;
}
:deep(.n-data-table .n-data-table-expand-trigger){
    float: left;
}
</style>

<template>
    <mb-table
        ref="magicTable"
        v-bind="tableOptions"
        @scroll="onScroll"
        @load="onLoad"
        @dynamicSettingContextmenu="dynamicSettingContextmenu"
        @contextmenuSelect="contextmenuSelect"
    >
        <template v-for="(col, colIndex) in cols" #[col.field]="{ row }">
            <template v-if="row">
                <template v-if="col.component">
                    <!-- 设置了组件并且是非编辑模式下 -->
                    <template v-if="col.alwaysEdit !== true && !edits[row._index_ + '' + colIndex]">
                        <!-- 如果是可以编辑，则鼠标悬浮显示边框 -->
                        <div
                            v-if="getIsEdit(col.edit, row)"
                            @click="editMode(row._index_, colIndex, col)"
                            class="edit-text"
                            :style="col.labelStyle"
                        >
                            <slot
                                :name="col.field + '-view'"
                                :row="row"
                                :col="col"
                                :row-index="row._index_"
                                :col-index="colIndex"
                            >
                                <span v-if="col.show == undefined || (col.show && col.show(row))">
                                    {{ getLabel(row[col.field], col) }}
                                </span>
                            </slot>
                        </div>
                        <!-- 如果不可以编辑，则鼠标悬浮显示禁止标志 -->
                        <div v-else class="edit-text-not-allowed" :style="col.labelStyle">
                            <slot
                                :name="col.field + '-view'"
                                :row="row"
                                :col="col"
                                :row-index="row._index_"
                                :col-index="colIndex"
                            >
                                <span v-if="col.show == undefined || (col.show && col.show(row))">
                                    {{ getLabel(row[col.field], col) || '-' }}
                                </span>
                            </slot>
                        </div>
                    </template>
                    <!-- edit 和 alwaysEdit 可配合使用 比如符合条件的 可以一直保持编辑模式 -->
                    <slot
                        v-if="(col.edit != undefined && col.edit(row) && col.alwaysEdit) || (col.edit == undefined && col.alwaysEdit) || (edits[row._index_ + '' + colIndex] && currentRowIndex == row._index_ && currentColIndex == colIndex)"
                        :name="col.field + '-edit'"
                        :row="row"
                        :col="col"
                        :row-index="row._index_"
                        :col-index="colIndex"
                    >
                        <!-- edit = true（始终编辑模式） 或者激活编辑模式 显示组件 -->
                        <component
                            :ref="(el) => setComponentRef(row._index_, colIndex, el, col)"
                            :is="col.component.startsWith('#') ? col.component.substring(1) : col.component.startsWith('n-') ? col.component : 'mb-' + col.component"
                            v-model="row[col.field]"
                            v-model:value="row[col.field]"
                            v-bind="componentDynamicBind(row, col)"
                            :style="col.componentStyle"
                            @blur="componentBlur(row._index_, colIndex, col, row)"
                        />
                    </slot>
                </template>
                <!-- 如果没有设置组件 直接显示数据 -->
                <div v-else :style="col.labelStyle">
                    <slot
                        :name="col.field + '-view'"
                        :row="row"
                        :col="col"
                        :row-index="row._index_"
                        :col-index="colIndex"
                    >
                        <span v-if="col.show == undefined || (col.show && col.show(row))">
                            {{ row[col.field] }}
                        </span>
                    </slot>
                </div>
            </template>
        </template>
    </mb-table>
</template>

<script setup>

import { reactive, ref, nextTick, toRaw, watch } from 'vue'
import { getSelectData } from "@/api/components/mb-select.js";
import { getTreeSelectData } from "@/api/components/mb-tree-select";
import { omit, cloneDeep } from 'lodash-es'
import treeTable from "@/scripts/treeTable";
const magicTable = ref()
const props = defineProps({
    id: {
        type: String,
        default: ''
    },
    props: {
        type: Object,
        default: () => {}
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
        type: Object,
        default: () => {}
    },
    operationWidth: {
        type: Number,
        default: 85
    },
    page: {
        type: Boolean,
        default: false
    },
    rowKey: {
        type: String,
        default: 'id'
    },
    preview: {
        type: Boolean,
        default: false
    },
    onLoad: {
        type: Function,
        default: () => {}
    },
    rowHoverEdit: {
        type: Boolean,
        default: true
    }
})
// 深拷贝对象，取消对象引用
const tableOptions = reactive({
    id: props.id,
    page: props.page,
    showNo: props.showNo,
    selectedRowEnable: false,
    contextmenuEnable: true,
    rowKey: props.rowKey,
    keepCurrentPage: true,
    data: [],
    cols: [],
    props: props.props
})
const currentColIndex = ref(0)
const currentRowIndex = ref(0)
const currentCol = ref()
// 是否可编辑单元格，可以控制某行某列
const edits = ref({})
const showLabelData = reactive({})

function setData(data){
    let newData = cloneDeep(data)
    tableOptions.data = dataAddIndex(newData)
}

for (let i in props.cols) {
    let col = props.cols[i]
    getShowLabelData(col)
    if(!col.type){
        col.type = 'dynamic'
    }
    if(!col.editIcon){
        col.editIcon = col.component ? true : false
    }
    tableOptions.cols.push(col)
}

function getShowLabelData(col){
    switch (col.component) {
        case 'select':
            getSelectData(col.componentProps).then(data => {
                showLabelData[col.field] = data
            })
            break;
        case 'tree-select':
            getTreeSelectData(col.componentProps).then(data => {
                showLabelData[col.field] = treeTable.recursionRearrange(data)
            })
            break;
        default:
            break;
    }
}

let buttons = []
if(props.operation && !props.preview){
    let deleteClick = (row, confirm) => {
        if(confirm){
            $common.warning('此操作将永久删除该数据, 是否继续?', () => {
                deleteRow(row)
            })
        }else{
            deleteRow(row)
        }
    }
    let deleteOption = {
        label: '删除',
        link: true,
        icon: 'Delete24Regular',
        if: () => props.operation.delete,
    }
    if(typeof(props.operation.delete) == 'object'){
        const { confirm } = props.operation.delete
        buttons.push({
            ...deleteOption,
            click: (row) => deleteClick(row, confirm)
        })
    }else if(typeof(props.operation.delete) == 'boolean'){
        buttons.push({
            ...deleteOption,
            click: (row) => deleteClick(row)
        })
    }
    buttons.push(...[{
        label: '添加下级',
        link: true,
        icon: 'sub-level',
        if: () => props.operation.sub,
        click: (row) => {
            addChildrenRow(row)
        }
    }, {
        label: '添加同级',
        link: true,
        icon: 'same-level',
        if: () => props.operation.same,
        click: (row) => {
            addRow(row)
        }
    }])
    if(props.operation.buttons){
        buttons.push(...props.operation.buttons)
    }
    tableOptions.cols.push({
        label: '操作',
        type: 'buttons',
        width: props.operationWidth,
        fixed: 'right',
        buttons: buttons
    })
}

function componentDynamicBind(row, col){
    let bind = {...col.componentProps}
    if(col.componentProps){
        if(col.componentProps.onChange){
            bind.onChange = (value) => {
                col.componentProps.onChange(value, row)
            }
        }
    }
    return bind
}

// 增加同级
function addRow(row){
    // 递归树结构数据 查到当前行数据 在父级push
    recursionAddRow(tableOptions.data, row._index_)
    tableDataAddIndex()
}

function recursionAddRow(children, index){
    children.forEach(it => {
        if(it._index_ == index){
            children.push({[props.rowKey]: $common.uuid()})
        }
        if(it.children && it.children.length > 0){
            recursionAddRow(it.children, index)
        }
    })
}

// 添加下级
function addChildrenRow(row){
    if(row.children && row.children.length > 0){
        row.children.push({[props.rowKey]: $common.uuid()})
    }else{
        row.children = [{[props.rowKey]: $common.uuid()}]
    }
    tableDataAddIndex()
}

/**
 * 递归增加index（主要是为了解决树形结构数据，naive-ui的index不包含子级的问题）
 * https://www.naiveui.com/zh-CN/os-theme/components/data-table#expand.vue
 */
function dataAddIndex(children){
    let index = { index: 0 }
    // 深拷贝解除对象引用
    let data = cloneDeep(children)
    recursionAddIndex(data, index)
    return data
}

function tableDataAddIndex(){
    tableOptions.data = dataAddIndex(tableOptions.data)
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

// 删除本行及以下子节点
function deleteRow(row){
    recursionDelete(tableOptions.data, row._index_)
    tableDataAddIndex()
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

// 根据edit（boolean） 或者 edit（function）判断此列是否可以编辑，不能编辑的话 显示文字
function getIsEdit(edit, row){
    if(props.preview){
        return false
    }
    if(typeof(edit) == 'function'){
        return edit(row)
    }
    return true
}

function getLabelByData({col, value, data, valueField, labelField}){
    let dataList = data || showLabelData[col.field]
    if(dataList && dataList.length > 0){
        let labels = []
        let values = value.toString().split(',')
        for(let value of values){
            let data = dataList.filter(it => it[col.showLabel?.valueField || valueField] == value)[0];
            labels.push(data && data[col.showLabel?.labelField || labelField])
        }
        return labels.join(',')
    }
}

// 反显方法
function getLabel(value, col){
    if($common.notEmptyNot01(value)){
        let valueField = col.componentProps?.valueField || 'value'
        let labelField = col.componentProps?.labelField || 'label'
        if(['select', 'tree-select'].indexOf(col.component) != -1){
            if(col.component == 'tree-select'){
                valueField = col.componentProps?.valueField || 'key'
                labelField = col.componentProps?.labelField || 'label'
            }else if(col.component == 'select'){
                valueField = 'value'
                labelField = 'label'
            }
            return getLabelByData({col, value, valueField, labelField})
        }else if(col.showLabel){
            return getLabelByData({col, value, data: col.showLabel.data, valueField, labelField})
        }else{
            return value
        }
    }
}

let currentEditRef = null
function componentBlur(rowIndex, colIndex, col, row){
    edits.value[rowIndex + '' + colIndex] = false
    col.blur && col.blur(row)
}

// 动态设置ref
function setComponentRef(rowIndex, colIndex, el, col){
    if(el && edits.value[rowIndex + '' + colIndex]){
        currentEditRef = el
        nextTick(() => {
            if(el.focus){
                el.focus()
            }else{
                let key = Object.keys(toRaw(el.$refs))[0]
                // 执行组件的focus方法，如果组件内template根节点内有focus方法 直接设置ref属性即可，比如mb-input
                if(key){
                    if(el.$refs[key].focus){
                        el.$refs[key].focus()
                    }else{
                        el.$refs[key].$el.focus()
                    }
                }
            }
            componentInit(el, col)
        })
    }
}

// 组件初始化时
function componentInit(el, col){
    switch (col.component){
        case 'textarea':
            // 放大显示
            textareaInit(el, col)
            break;
        case 'tree-select':
            // 展开
            el.expand()
            break;
        default:
            break;
    }
}

// textarea初始化
function textareaInit(el, col){
    col.componentStyle = col.componentStyle || {}
    let parentNodeRect = el.$el.parentNode.getBoundingClientRect()
    let tableRect = magicTable.value.$el.getBoundingClientRect()
    let tableWidth = magicTable.value.$el.clientWidth
    let left = parentNodeRect.left - tableRect.left
    let top = parentNodeRect.top - tableRect.top - magicTable.value.$el.querySelector('.n-data-table-base-table-header').offsetHeight
    col.componentStyle.position = 'absolute'
    col.componentStyle['z-index'] = 999999
    col.componentStyle.width = col.componentStyle.width || parentNodeRect.width + 'px'
    if(tableWidth - left - col.componentStyle.width.match(/\d+/)[0] < 1){
        col.componentStyle.right = `1px`
        col.componentStyle.left = 'unset'
    }else{
        col.componentStyle.left = `${left}px`
        col.componentStyle.right = 'unset'
    }
    col.componentStyle.top = `${top}px`
}

// 让单元格变成预览模式
function previewMode(rowIndex, colIndex){
    edits.value[rowIndex + '' + colIndex] = false
}

// 让单元格变成编辑模式
function editMode(rowIndex, colIndex, col){
    currentRowIndex.value = rowIndex
    currentColIndex.value = colIndex
    edits.value[rowIndex + '' + colIndex] = true
    if(col){
        currentCol.value = col
    }
}

function onScroll(){
    if(currentCol.value && currentCol.value.component == 'textarea' && edits.value[currentRowIndex.value + '' + currentColIndex.value]){
        edits.value[currentRowIndex.value + '' + currentColIndex.value] = false
        currentCol.value = null
    }
}

let contextmenus = []
function dynamicSettingContextmenu(row){
    contextmenus = []
    for(let button of buttons){
        if((button.if && button.if(row)) || button.if === undefined){
            contextmenus.push({
                key: button.label,
                title: button.label,
                row: row,
                click: button.click,
                icon: $common.renderIcon(button.icon)
            })
        }
    }
    return contextmenus
}

function contextmenuSelect(key){
    let menu = contextmenus.filter(it => it.key == key)[0]
    if(menu.click){
        menu.click(menu.row)
    }
}

function getData(){
    return tableOptions.data.map(it => omit({...it}, '_index_'))
}

function push(data){
    tableOptions.data.push(data)
    tableDataAddIndex()
}

function unshift(data){
    tableOptions.data.unshift(data)
    tableDataAddIndex()
}

function getTableRef(){
    return magicTable.value
}

watch(magicTable, () => {
    if(props.rowHoverEdit){
        magicTable.value.$el.style.setProperty('--mb-editor-table-tr-hover-border', '1px dashed #ccc')
    }else{
        magicTable.value.$el.style.setProperty('--mb-editor-table-tr-hover-border', 'unset')
    }
})

defineExpose({ getTableRef, previewMode, editMode, getData, setData, push, unshift })

</script>
