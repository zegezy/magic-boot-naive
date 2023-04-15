<template>
    <div style="width: 100%; height: 100%;">
        <n-data-table
            v-if="showTable"
            v-bind="bindProps"
            ref="tableRef"
            :key="tableKey"
            :class="{ nowrap: getNowrap }"
            tabindex="-1"
            :columns="showColumns"
            :virtual-scroll="virtualScroll"
            v-model:checked-row-keys="checkedRowKeys"
            @update:checked-row-keys="emit('update:checked-row-keys', checkedRowKeys)"
            table-layout="fixed"
            style="height: 100%"
            :scroll-x="scrollX"
            flex-height
            :row-key="it => it[rowKey]"
            :default-expand-all="defaultExpandAll"
            @unstable-column-resize="unstableColumnResize"
        >
            <template #switch="{ row, col }">
                <mb-switch v-model="row[col.field]" @change="col.change(row)" v-if="col.if != undefined ? col.if(row) : true"/>
                <span v-else>-</span>
            </template>
            <template #html="{ row, col }">
                <span v-html="row[col.field] ? row[col.field] : col.defaultValue || ''"></span>
            </template>
            <template #templet="{ row, col, index }">
                <span v-html="col.templet(row, col, index)"></span>
            </template>
            <template #buttons="{ row, col }">
                <n-space>
                    <template v-for="it in col.buttons">
                        <n-button
                            v-if="it.if != undefined ? it.if(row) : true"
                            v-permission="it.permission"
                            :type="it.type"
                            :text="it.link"
                            :dashed="it.dashed"
                            :href="it.href"
                            :color="it.color"
                            :target="it.target"
                            :tag="it.tag || (it.link ? 'a' : 'button')"
                            :text-color="it.textColor || '#2D8CF0'"
                            @click="it.click(row)"
                        >
                            <template #icon v-if="it.icon">
                                <n-icon>
                                    <component :is="icons5[it.icon] || fluent[it.icon]" />
                                </n-icon>
                            </template>
                            {{ it.label }}
                        </n-button>
                    </template>
                </n-space>
            </template>
            <template #dictType="{ row, col }">
                <span>{{ dictStore.getDictLabel(col.dictType, row[col.field] + '') }}</span>
            </template>
            <template #dynamic="{ row, col }">
                <slot :name="col.field" :row="row" :col="col"/>
            </template>
            <template #title="{ col }">
                <div @click="dataSort(col)">
                    <label>{{ col.label }}</label>
                    <n-icon v-if="col.dataSortRule">
                        <CaretUpOutline />
                    </n-icon>
                    <n-icon v-if="col.dataSortRule == false">
                        <CaretDownOutline />
                    </n-icon>
                    <n-icon color="#248EF4" v-if="col.realSort && !col.realSortRule">
                        <ArrowSort16Filled />
                    </n-icon>
                    <n-icon color="#248EF4" v-if="col.realSortRule == '0'">
                        <ArrowSortUp16Filled />
                    </n-icon>
                    <n-icon color="#248EF4" v-if="col.realSortRule == '1'">
                        <ArrowSortDown16Filled />
                    </n-icon>
                </div>
                <n-icon class="down-menus" @click="headerClick($event, col)">
                    <ChevronDown />
                </n-icon>
            </template>
            <template #image="{ row, col }">
                <n-image-group v-if="row[col.field]">
                    <n-space>
                        <n-image v-for="it in row[col.field].split(',')" width="30" height="30" :src="$global.filePrefix + it" />
                    </n-space>
                </n-image-group>
            </template>
        </n-data-table>
        <div ref="tableMenusRef" class="table-menus" :style="{ left: menusLeft, top: menusTop, display: showMenus ? 'flex' : 'none', width: menusWidth + 'px' }">
            <div class="menu" v-for="(menu, i) in dropMenus" @click="menu.click" :key="i">
                {{ menu.label }}
                <div class="items" :style="{ top: itemsTop, left: itemsLeft, width: itemsWidth + 'px' }"
                     v-if="menu.children && menu.children.length > 0">
                    <div class="item" v-for="item in menu.children" :key="item.value" @click="menu.click(item, $event)">
                        <n-checkbox v-model:checked="item.show" style="vertical-align: top;margin-right: 5px;" />{{ item.type == 'selection' ? '多选' : item.label }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Sortable from 'sortablejs'
import {ref, onMounted, nextTick, h, reactive, watch, onBeforeUnmount, computed} from 'vue'
import { ChevronDown, CaretUpOutline, CaretDownOutline } from '@vicons/ionicons5'
import * as icons5 from '@vicons/ionicons5'
import { ArrowSort16Filled, ArrowSortUp16Filled, ArrowSortDown16Filled } from '@vicons/fluent'
import * as fluent from '@vicons/fluent'
import common from '@/scripts/common'
import global from '@/scripts/global'
import MbSwitch from '@/components/magic/form/mb-switch.vue'
import {useDictStore} from "@/store/modules/dictStore";
import componentProperties from '@/components/magic-component-properties'

const dictStore = useDictStore()

const props = defineProps({
    props: {
        type: Object,
        default: () => {
        }
    },
    id: {
        type: String,
        default: ''
    },
    rowKey: {
        type: String,
        default: 'id'
    },
    nowrap: {
        type: Boolean,
        default: false
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
        default: () => null
    },
    done: {
        type: Function,
        default: () => {
        }
    },
    loading: {
        type: Boolean,
        default: () => false
    },
    showNo: {
        type: Boolean,
        default: true
    },
    selection: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['update:checked-row-keys', 'selected-row'])
const tableRef = ref()
const tableSlots = ref()
const checkedRowKeys = ref()
const columns = ref([])
const showColumns = ref([])
const bindProps = reactive(props.props || {})
const getNowrap = computed(() => props.nowrap != undefined ? props.nowrap : componentProperties.table.nowrap != undefined ? componentProperties.table.nowrap : false)
let currentRowDom = null
bindProps.rowProps = (row) => {
    return {
        style: 'cursor: pointer;',
        onClick: (e) => {
            let setBackgroundColor = (dom, color) => {
                dom.forEach(d => {
                    d && d.querySelectorAll('td').forEach(it => {
                        it.style['background-color'] = color
                    })
                })
            }
            currentRowIndex.value = bindProps.data.findIndex(it => it[props.rowKey] == row[props.rowKey])
            if(currentRowDom){
                setBackgroundColor([currentRowDom, currentRowDom.previousElementSibling, currentRowDom.nextElementSibling], 'var(--n-merged-td-color)')
            }
            currentRowDom = e.currentTarget
            setBackgroundColor([currentRowDom], componentProperties.table.selectedRowColor)
            emit('selected-row', row)
        }
    }
}
const scrollX = ref()

function createTable() {
    if (props.page) {
        bindProps.pagination = {
            page: 1,
            pageCount: 1,
            pageSize: props.limit,
            showSizePicker: true,
            pageSizes: [10, 20, 50, 100, 200, 500, 1000],
            onChange: (page) => {
                bindProps.pagination.page = page
                loadData()
            },
            onUpdatePageSize: (pageSize) => {
                bindProps.pagination.pageSize = pageSize
                bindProps.pagination.page = 1
                loadData()
            }
        }
    }
    bindProps.remote = !!props.url
    bindProps.loading = false
    watch(() => props.data, () => {
        if (props.page) {
            bindProps.pagination.page = 1
        }
        bindProps.data = props.data
    }, {deep: true})
    watch(() => props.loading, value => bindProps.loading = value)
}

function loadData(options) {
    if (props.url) {
        let where = common.renderWhere(props.where)
        requestData({ where, loading: options && options.loading })
    }
    if (props.data) {
        bindProps.data = props.data
    }
}

function requestData({ where, loading }) {
    loading = loading == undefined ? true : loading
    if(loading){
        bindProps.loading = true
    }
    if (props.page) {
        where.current = bindProps.pagination.page
        where.size = bindProps.pagination.pageSize
    } else {
        where.size = 99999999
    }
    let processData = (res) => {
        const {data} = res
        bindProps.data = data.list || []
        if(loading){
            bindProps.loading = false
        }
        if (props.page) {
            bindProps.pagination.pageCount = Math.ceil(data.total / where.size)
            bindProps.pagination.itemCount = data.total
        }
        props.done(bindProps.data)
    }
    if (props.method.toLowerCase() == 'post') {
        common.$post(props.url, where).then(processData)
    } else {
        common.$get(props.url, where).then(processData)
    }
}
createTable()

function calcScrollX(){
    scrollX.value = showColumns.value.reduce((total, it) => total + Number(
            typeof(it.width) == 'number' ? it.width :
                typeof(it.width) == 'string' ? it.width.replace('px', '') : 200
        )
        , 0)
}

function fixCols() {
    tableSlots.value = tableRef.value.$slots
    const keys = Object.keys(tableSlots.value)
    if(props.selection){
        columns.value.push({
            type: 'selection',
            show: true,
            width: 70,
            fixed: 'left'
        })
    }
    if(props.showNo){
        columns.value.push({
            label: '序号',
            title: '序号',
            width: 70,
            align: 'center',
            show: true,
            fixed: 'left',
            render: (_,index) => {
                return index + 1
            }
        })
    }
    props.cols.forEach((col) => {
        let column = {}
        column.field = col.field
        column.key = col.field
        column.label = col.label
        column.title = (col) => {
            return h(tableSlots.value['title'], {col})
        }
        column.align = col.align
        column.width = col.width || 200
        column.minWidth = col.minWidth
        column.maxWidth = col.maxWidth
        column.fixed = col.fixed
        column.show = true
        column.realSort = col.realSort
        if(getNowrap.value){
            column.ellipsis = {
                tooltip: true
            }
        }
        column.resizable = true
        let type = col.type
        if (!col.render && type && keys.indexOf(type) != -1) {
            renderSlot(col, type)
        } else {
            if (col.dictType) {
                renderSlot(col, 'dictType')
            }
            if(col.templet){
                renderSlot(col, 'templet')
            }
        }
        if (col.render) {
            column.render = col.render
        }else{
            column.render = (row) => {
                return row[col.field] ? row[col.field] : col.defaultValue || ''
            }
        }
        if (col.props) {
            for (let key in col.props) {
                column[key] = col.props[key]
            }
        }
        columns.value.push(column)
    })
    let renderShowColumns = () => {
        showColumns.value = columns.value.filter(it => it.show)
        calcScrollX()
    }
    if(componentProperties?.table?.remoteLoadColumn){
        componentProperties.table?.remoteLoadColumn(props.id, columns.value).then(value => {
            columns.value = value
            renderShowColumns()
        }).catch(() => {
            renderShowColumns()
        })
    }else{
        renderShowColumns()
    }
    let columnResizeTimeout = null
    watch(() => columns, () => {
        clearTimeout(columnResizeTimeout)
        columnResizeTimeout = setTimeout(() => {
            if(componentProperties?.table?.saveCols){
                componentProperties?.table?.saveCols(props.id, columns.value)
            }
        }, 500)
        renderShowColumns()
    }, { deep: true })
}

function renderSlot(col, type) {
    col.render = (row, index) => {
        return h(tableSlots.value[type], {row, index, col})
    }
}

const tableKey = ref('magicTable' + common.uuid())
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

function reload(options) {
    loadData(options)
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

function unstableColumnResize(widthAfterResize, limitWidth, column){
    column.width = limitWidth
    calcScrollX()
}

const tableMenusRef = ref()
const menusWidth = ref(158)
const itemsWidth = ref(140)
const menusLeft = ref('')
const menusTop = ref('')
const itemsLeft = ref('')
const itemsTop = ref('')
const showMenus = ref(false)
let currentCol = null
const dropMenus = reactive([{
    value: 'asc',
    label: '升序排序',
    click: () => {
        dataSort(currentCol, '0')
        showMenus.value = false
    }
}, {
    value: 'desc',
    label: '降序排序',
    click: () => {
        dataSort(currentCol, '1')
        showMenus.value = false
    }
}, {
    value: 'lock-column',
    label: '锁定到此列',
    click: () => {
        fixedColumn(columns.value.map(it => it.field).indexOf(currentCol.field))
        showMenus.value = false
    }
}, {
    value: 'undo-lock',
    label: '撤销锁定',
    click: () => {
        unFixedColumn()
        showMenus.value = false
    }
}, {
    value: 'columns',
    label: '表格列',
    children: columns,
    click: (col, e) => {
        if (e && e.target.className.indexOf('n-checkbox-box') == -1) {
            col.show = !col.show
        }
    }
}])
function getMousePos(event) {
    let e = event || window.event;
    let scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    let scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    let x = e.pageX || e.clientX + scrollX;
    let y = e.pageY || e.clientY + scrollY;
    return { 'x': x, 'y': y };
}
function headerClick(e, col) {
    currentCol = col
    let clientWidth = document.body.clientWidth;
    let clientHeight = document.body.clientHeight;
    let coord = getMousePos(e)
    if ((clientWidth - menusWidth.value - coord.x) < 0) {
        menusLeft.value = (clientWidth - menusWidth.value) + 'px'
        if ((clientWidth - menusWidth.value - itemsWidth.value - coord.x) < 0) {
            itemsLeft.value = (clientWidth - menusWidth.value - itemsWidth.value) + 'px'
        }
    } else {
        menusLeft.value = coord.x + 'px'
        itemsLeft.value = (coord.x + menusWidth.value) + 'px'
    }
    menusTop.value = coord.y + 'px'
    showMenus.value = true
    nextTick(() => {
        let itemsHeight = tableMenusRef.value.querySelectorAll('.items .item').length * 30 + 8
        itemsHeight = itemsHeight > 500 ? 500 : itemsHeight
        let tableMenus = tableMenusRef.value.getBoundingClientRect()
        if ((clientHeight - tableMenus.bottom) < itemsHeight) {
            itemsTop.value = (tableMenus.bottom - itemsHeight - 8)
        } else {
            itemsTop.value = tableMenus.bottom - 28
        }
        if(itemsTop.value < 0 ){
            itemsTop.value = 0  + 'px'
        }else{
            itemsTop.value = itemsTop.value  + 'px'
        }
    })
}
function dataSort(col, rule) {
    columns.value.filter(it => it.field != col.field).forEach(it => {
        it.dataSortRule = undefined
    })
    columns.value.filter(it => it.realSort && it.field != col.field).forEach(it => {
        it.realSortRule = undefined
    })
    if (col.realSort) {
        if(rule){
            col.realSortRule = rule
        }else{
            if (!col.realSortRule) {
                col.realSortRule = '0' // asc
            } else {
                col.realSortRule = col.realSortRule == '0' ? '1' : '0'
            }
        }
        props.where.orderByColumn = col.field.replace(/([A-Z])/g, "_$1").toLowerCase()
        props.where.direction = col.realSortRule
        reload()
    } else {
        if(rule){
            col.dataSortRule = ('0' == rule ? true : false)
        }else{
            if (!col.dataSortRule) {
                col.dataSortRule = true
            } else {
                col.dataSortRule = !col.dataSortRule
            }
        }
        bindProps.data.sort((a, b) => {
            if (typeof (a[col.field]) == 'number') {
                if (col.dataSortRule) {
                    return a[col.field] - (b[col.field] || 0)
                }
                return (b[col.field] || 0) - a[col.field]
            } else {
                if (col.dataSortRule) {
                    return (a[col.field] || '').localeCompare(b[col.field] || '')
                }
                return (b[col.field] || '').localeCompare(a[col.field] || '')
            }
        })
    }
}

let fixed = false
function fixedColumn(index) {
    unFixedColumn()
    columns.value.forEach((it, i) => {
        if (i <= index) {
            it.fixed = 'left'
        }
    })
    fixed = true
}
function unFixedColumn() {
    fixed = false
    columns.value.forEach((it) => {
        if(it.fixed != 'right'){
            it.fixed = false
        }
    })
}

function getFixedCount() {
    let index = 0;
    if (props.showNo) {
        index++
    }
    if (props.selection) {
        index++
    }
    return index
}

function arrIndexExchange(array, x, y) {
    let arr_temp = [].concat(array);
    arr_temp.splice(x, 0, arr_temp.splice(y, 1)[0]);
    return arr_temp;
}

let sortableTh = null
function columnDrop() {
    const wrapperTr = tableRef.value.$el.querySelector(`.n-data-table-base-table-header thead tr`)
    sortableTh = Sortable.create(wrapperTr, {
        animation: 180,
        delay: 0,
        handle: '.n-data-table-th__title-wrapper',
        onEnd: evt => {
            nextTick(() => {
                let _oldIndex = evt.oldIndex, _newIndex = evt.newIndex;
                let fixedIndex = 0
                for(let i =0; i<columns.value.length; i++){
                    let it = columns.value[i];
                    if(it.fixed == 'left'){
                        fixedIndex = i;
                    }
                }
                if(evt.newIndex > fixedIndex){
                    fixedIndex = fixedIndex - 1
                }else{
                    if(columns.value[_oldIndex].fixed != columns.value[_newIndex].fixed){
                        fixedIndex = fixedIndex + 1
                    }
                }
                let newIndexLabel = columns.value.filter(it => it.show).filter((it, j) => j == evt.newIndex)[0].label
                columns.value.slice(0,columns.value.findIndex(it => it.label == newIndexLabel)).forEach(it => !it.show && _newIndex++)
                columns.value.slice(0,columns.value.findIndex(it => it.label == evt.clone.innerText)).forEach(it => !it.show && _oldIndex++)
                columns.value = arrIndexExchange(columns.value, _newIndex, _oldIndex)
                if (columns.value.filter((it, i) => i <= _newIndex).some(it => it.fixed && it.fixed === 'left')) {
                    unFixedColumn()
                    fixedColumn(fixedIndex)
                }
            })
        },
        onMove: evt => {
            if (evt.related.cellIndex < getFixedCount()) {
                return false
            }
            return true
        }
    })
}
function hideMenus(e){
    if (document.getElementsByClassName('table-menus') && document.getElementsByClassName('table-menus').length > 0 && !document.getElementsByClassName('table-menus')[0].contains(e.srcElement) && e.target.nodeName != 'svg' && e.target.nodeName != 'path') {
        showMenus.value = false
    }
}

const currentRowIndex = ref(0)
function directionOperation(e) {
    e.preventDefault()
    if (e.target.nodeName != 'INPUT') {
        let updateRowDom = null
        if (e && e.keyCode == 38) {// 上
            if (currentRowIndex.value == 0) {
                currentRowIndex.value = 0
            } else {
                currentRowIndex.value--
            }
            if(currentRowDom.previousElementSibling){
                updateRowDom = currentRowDom.previousElementSibling
                currentRowDom.previousElementSibling.click()
            }
        } else if (e && e.keyCode == 40) {// 下
            if (currentRowIndex.value == bindProps.data.length - 1) {
                currentRowIndex.value = bindProps.data.length - 1
            } else {
                currentRowIndex.value++
            }
            if(currentRowDom.nextElementSibling){
                updateRowDom = currentRowDom.nextElementSibling
                currentRowDom.nextElementSibling.click()
            }
        }
        if(props.virtualScroll){
            tableRef.value.scrollTo({index: currentRowIndex.value})
        }else{
            tableRef.value.scrollTo({el: updateRowDom})
        }
    }
}

function addEventListener() {
    document.body.addEventListener('click', hideMenus)
    tableRef.value.$el.addEventListener('keydown', directionOperation)
}

function removeListener() {
    document.body.removeEventListener('click', hideMenus)
    tableRef.value.$el.removeEventListener('keydown', directionOperation)
}

onMounted(() => {
    fixCols()
    reload()
    bindProps.size = global.uiSize;
    nextTick(() => {
        addEventListener()
        columnDrop()
        watch(showTable, (value) => {
            if(value){
                nextTick(() => {
                    columnDrop()
                })
            }
        })
    })
})

onBeforeUnmount(() => {
    try{
        sortableTh.destroy()
    }catch(ignore){}
    removeListener()
})

defineExpose({expand, toggleExpand, reload, exportExcel})

</script>
<style scoped>
.btn-blue {
    color: #2D8CF0;
    transition-property: color;
    transition-duration: .25s;
}

.btn-blue:hover{
    color: #7eb6f3;
}
.table-menus {
    color: black;
    display: flex;
    flex: 1;
    flex-direction: column;
    position: fixed;
    z-index: 99999;
    background: white;
    box-shadow: 0 8px 16px 0 rgb(0 0 0 / 80%);
    border-radius: 3px;
}

.table-menus>.menu {
    font-size: 13px;
    padding: 0 8px 0 16px;
    height: 28px;
    line-height: 28px;
    cursor: pointer;
    position: relative;
    flex: 1;
    flex-direction: column;
}

.table-menus>.menu>.items {
    display: none;
    position: fixed;
    top: 50px;
    z-index: 99999;
    background: white;
    color: black;
    max-height: 500px;
    overflow-y: auto;
}

.table-menus>.menu>.items {
    padding: 4px 0;
    box-shadow: 0 0 20px rgb(0 0 0 / 20%);
}

.table-menus>.menu:hover>.items {
    display: block;
}

.items .item {
    font-size: 12px;
    width: 100%;
    height: 30px;
    padding-left: 24px;
    line-height: 30px;
    float: left;
    box-sizing: border-box;
}

.items .item:hover,
.table-menus .menu:hover {
    background-color: #e0f0fe;
}
.down-menus {
    float: right;
    position: absolute;
    right: 12px;
    top: 0.6em;
    width: 0.6em;
    height: 0.6em;
    cursor: pointer;
    display: none;
}
.n-data-table-tr th:hover .down-menus,
.n-data-table-tr th .down-menus:hover {
    display: block;
}
.n-data-table{
    outline: none;
}
.nowrap :deep(td),
.nowrap :deep(th){
    white-space: nowrap;
    overflow: hidden;
}
.nowrap :deep(.n-space){
    flex-wrap: nowrap!important;
}
</style>
