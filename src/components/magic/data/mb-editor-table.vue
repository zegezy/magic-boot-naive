<style scoped>
.edit-text{
    flex: 1;
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
:deep(.n-data-table .n-data-table-expand-trigger),
:deep(.n-data-table .n-data-table-indent),
:deep(.n-data-table .n-data-table-expand-placeholder){
    float: left;
}
.copy-text{
    margin: 0px 5px;
    cursor: pointer;
}
</style>

<template>
    <mb-table
        ref="magicTable"
        v-bind="tableOptions"
        @scroll="onScroll"
        @dynamicSettingContextmenu="dynamicSettingContextmenu"
        @contextmenuSelect="contextmenuSelect"
    >
        <template v-for="(col, colIndex) in cols" #[col.field]="{ row }">
            <template v-if="row">
                <template v-if="col.component">
                    <!-- 设置了组件并且是非编辑模式下 -->
                    <template v-if="col.alwaysEdit !== true && !edits[row._index_ + '' + colIndex]">
                        <div v-if="getIsEdit(col.edit, row)" class="flex items-center h-4/5">
                            <!-- 如果是可以编辑，则鼠标悬浮显示边框 -->
                            <div
                                @click="editMode(row._index_, colIndex, col, row)"
                                class="edit-text h-full"
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
                            <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="common.copyText(getLabel(row[col.field], col))" />
                        </div>
                        <div v-else class="flex items-center">
                            <!-- 如果不可以编辑，则鼠标悬浮显示禁止标志 -->
                            <div class="edit-text-not-allowed flex-1" :style="col.labelStyle">
                                <slot
                                    :name="col.field + '-view'"
                                    :row="row"
                                    :col="col"
                                    :row-index="row._index_"
                                    :col-index="colIndex"
                                >
                                    <span v-if="col.show == undefined || (col.show && col.show(row))">
                                        {{ common.getValidValue(getLabel(row[col.field], col), '-') }}
                                    </span>
                                </slot>
                            </div>
                            <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="common.copyText(common.getValidValue(getLabel(row[col.field], col), '-'))" />
                        </div>
                    </template>
                    <div class="flex items-center" v-if="(col.edit != undefined && col.edit(row) && col.alwaysEdit) || (col.edit == undefined && col.alwaysEdit) || (edits[row._index_ + '' + colIndex] && currentRowIndex == row._index_ && currentColIndex == colIndex)">
                        <div class="flex-1">
                            <!-- edit 和 alwaysEdit 可配合使用 比如符合条件的 可以一直保持编辑模式 -->
                            <slot
                                :name="col.field + '-edit'"
                                :row="row"
                                :col="col"
                                :row-index="row._index_"
                                :col-index="colIndex"
                            >
                                <!-- edit = true（始终编辑模式） 或者激活编辑模式 显示组件 -->
                                <component
                                    v-if="!col.component.startsWith('n-')"
                                    :ref="(el) => setComponentRef(row._index_, colIndex, el, col)"
                                    :is="col.component.startsWith('#') ? col.component.substring(1) : 'mb-' + col.component"
                                    v-model="row[col.field]"
                                    v-bind="componentDynamicBind(row, col)"
                                    :style="col.componentStyle"
                                    @blur="componentBlur(row._index_, colIndex, col, row)"
                                    :close-current-col-edit-mode="closeCurrentColEditMode"
                                />
                                <!-- naive组件 大多使用 v-model:value 绑定，主要是兼容这个 -->
                                <component
                                    v-else
                                    :ref="(el) => setComponentRef(row._index_, colIndex, el, col)"
                                    :is="col.component"
                                    v-model:value="row[col.field]"
                                    v-bind="componentDynamicBind(row, col)"
                                    :style="col.componentStyle"
                                    @blur="componentBlur(row._index_, colIndex, col, row)"
                                />
                            </slot>
                        </div>
                        <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="common.copyText(row[col.field])" />
                    </div>
                </template>
                <div v-else class="flex items-center">
                    <!-- 如果没有设置组件 直接显示数据 -->
                    <div :style="col.labelStyle" class="flex-1 w-full">
                        <slot
                            :name="col.field + '-view'"
                            :row="row"
                            :col="col"
                            :row-index="row._index_"
                            :col-index="colIndex"
                        >
                            <mb-table-tooltip v-if="col.show == undefined || (col.show && col.show(row))">
                                {{ row[col.field] }}
                            </mb-table-tooltip>
                        </slot>
                    </div>
                    <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="common.copyText(row[col.field])" />
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
import common from '@/scripts/common'
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
const currentRow = ref()
// 是否可编辑单元格，可以控制某行某列
const edits = ref({})
const showLabelData = reactive({})
const disableComponentCallbackFields = ref([])

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
    if(col.copyAll){
        col.copyAllCallback = (col) => {
            let labels = []
            treeTable.recursionRearrange(getData()).forEach(it => {
                labels.push(common.getValidValue(getLabel(it[col.field], col), '-'))
            })
            $common.copyText(labels.join('\n'))
        }
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
    let deleteType = props.operation.delete instanceof Object
    let subType = props.operation.sub instanceof Object
    let sameType = props.operation.same instanceof Object
    buttons.push(...[{
        label: '删除',
        link: true,
        icon: 'Delete24Regular',
        if: (row) => {
            return deleteType ? props.operation.delete.if === undefined || (props.operation.delete.if && props.operation.delete.if(row)) : props.operation.delete
        },
        click: (row) => {
            deleteType ? deleteClick(row, props.operation.delete.confirm) : deleteClick(row)
        }
    }, {
        label: '添加下级',
        link: true,
        icon: 'sub-level',
        if: (row) => {
            return subType ? props.operation.sub.if === undefined || (props.operation.sub.if && props.operation.sub.if(row)) : props.operation.sub
        },
        click: (row) => {
            addChildrenRow(row)
        }
    }, {
        label: '添加同级',
        link: true,
        icon: 'same-level',
        if: (row) => {
            return sameType ? props.operation.same.if === undefined || (props.operation.same.if && props.operation.same.if(row)) : props.operation.same
        },
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
        for(let key in col.componentProps){
            if(key.startsWith('on') && typeof(col.componentProps[key]) == 'function'){
                bind[key] = (...data) => {
                    if(disableComponentCallbackFields.value.indexOf(col.field) == -1){
                        let _data = {
                            editorCurrentRow: row
                        }
                        for(let key in data){
                            // 如果标识了需要解构，把key赋值给_data
                            if(data[key] instanceof Object && data[key]['_deconstruction_']){
                                for(let key2 in data[key]){
                                    _data[key2] = data[key][key2]
                                }
                            }else{
                                _data[key] = data[key]
                            }
                        }
                        col.componentProps[key](_data)
                    }
                }
            }
        }
    }
    if(col.handlerComponentProps){
        col.handlerComponentProps(bind, row)
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
    let deleteAfter = props.operation?.delete?.deleteAfter;
    deleteAfter && deleteAfter()
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
    if(disableComponentCallbackFields.value.indexOf(col.field) == -1){
        col.blur && col.blur(row)
    }
}

// 关闭当前单元格编辑模式
function closeCurrentColEditMode(){
    componentBlur(currentRowIndex.value, currentColIndex.value, currentCol.value, currentRow.value)
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
function editMode(rowIndex, colIndex, col, row){
    currentRowIndex.value = rowIndex
    currentColIndex.value = colIndex
    edits.value[rowIndex + '' + colIndex] = true
    if(col){
        currentCol.value = col
    }
    if(row){
        currentRow.value = row
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

function disableComponentCallback(fields){
    disableComponentCallbackFields.value.push(...fields)
}

function enableComponentCallback(fields){
    for(let field of fields){
        let index = disableComponentCallbackFields.value.indexOf(field)
        if(index != -1){
            disableComponentCallbackFields.value.splice(index, 1)
        }
    }
}

watch(magicTable, () => {
    if(props.rowHoverEdit){
        magicTable.value.$el.style.setProperty('--mb-editor-table-tr-hover-border', '1px dashed #ccc')
    }else{
        magicTable.value.$el.style.setProperty('--mb-editor-table-tr-hover-border', 'unset')
    }
})

defineExpose({
    getTableRef,
    previewMode,
    editMode,
    getData,
    setData,
    push,
    unshift,
    disableComponentCallback,
    enableComponentCallback,
    closeCurrentColEditMode
})

</script>
