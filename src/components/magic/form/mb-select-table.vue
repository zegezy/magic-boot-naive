<style scoped>
.mb-list{
    border-radius: 5px;
    border: 1px solid #ccc;
    background: white;
    padding: 10px;
}
</style>

<template>
    <div class="list-container" ref="listContainerRef">
        <mb-input ref="magicInput" @click="inputClick" v-model="inputValue" />
        <div class="mb-list" :style="{ width: width + 'px', height: height + 'px', ...componentStyle }" v-if="showList">
            <div class="mb-search" v-if="!search">
                <mb-search :where="selectTableOptions.where" @search="reloadTable" />
            </div>
            <div class="mb-toolbar">
                <n-button v-if="multiple" :size="$global.uiSize.value" type="primary" @click="selectDataList">
                    选择数据
                </n-button>
            </div>
            <div class="mb-table">
                <mb-table
                    ref="magicTable"
                    v-bind="selectTableOptions"
                    v-model:checked-row-keys="checkedRowKeys"
                    @dblclick="tableDblclick"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
// 表格选择组件
import { onBeforeUnmount, ref, watch, toRaw } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { clone, cloneDeep } from 'lodash-es'
const magicTable = ref()
const magicInput = ref()
const listContainerRef = ref()
const checkedRowKeys = ref()
const showList = ref(false)

const props = defineProps({
    // 绑定值
    modelValue: {
        required: true
    },
    // 表格宽度
    width: {
        type: Number,
        default: 500
    },
    // 表格高度
    height: {
        type: Number,
        default: 300
    },
    // 表格配置选项
    tableOptions: {
        type: Object,
        default: () => {}
    },
    // 选择数据回调
    onSelectData: {
        type: Function,
        default: () => {}
    },
    // 是否多选
    multiple: {
        type: Boolean,
        default: false
    },
    // 关闭当前列编辑模式回调
    closeCurrentColEditMode: {
        type: Function,
        default: undefined
    },
    // 搜索配置
    search: {
        type: Object,
        default: undefined
    }
})

const selectTableOptions = ref(cloneDeep(props.tableOptions))
const sourceData = ref()
selectTableOptions.value.done = (data) => {
    sourceData.value = data
}
initTableOptions()
watch(() => props.tableOptions, (value) => {
    selectTableOptions.value = value
    initTableOptions()
}, { deep: true })
function initTableOptions(){
    selectTableOptions.value.selection = props.multiple
}

const inputValue = ref(clone(props.modelValue))
if(props.search){
    watch(inputValue, (value) => {
        let fields = props.search.fields
        if(props.search.static){
            selectTableOptions.value.data = sourceData.value.filter((it) => {
                for(let i = 0; i<fields.length; i++){
                    if(it[fields[i]].indexOf(value) != -1){
                        return true
                    }
                }
                return false
            })
        }else{
            selectTableOptions.value.where = selectTableOptions.value.where || {}
            fields.forEach(field => {
                selectTableOptions.value.where[field] = value
            })
        }
    })
    watch(() => selectTableOptions.value.where, () => reloadTable(), { deep: true })
}
watch(() => props.modelValue, (value) => {
    inputValue.value = value
})

watch(() => listContainerRef.value, () => {
    addEventListener()
    onClickOutside(listContainerRef, () => closeTable())
})

function tableDblclick({ row }){
    props.onSelectData({
        selectData: row,
        multiple: false,
        _deconstruction_: true
    })
    closeTable()
}

function selectDataList(){
    let rowKey = selectTableOptions.value['rowKey'] || 'id'
    props.onSelectData({
        selectData: magicTable.value.getData().filter(it => checkedRowKeys.value.indexOf(it[rowKey]) != -1),
        multiple: true,
        _deconstruction_: true
    })
    closeTable()
}

const componentStyle = ref()
function inputClick(){
    let style = {}
    let inputRect = magicInput.value.$el.getBoundingClientRect()
    let bodyClientWidth = document.body.clientWidth
    let bodyClientHeight = document.body.clientHeight
    let top = inputRect.y + inputRect.height
    let left = inputRect.x
    style.position = 'fixed'
    style['z-index'] = 999999
    if((bodyClientWidth - props.width - left) < 1){
        style.right = `1px`
        style.left = 'unset'
    }else{
        style.left = `${left}px`
        style.right = 'unset'
    }

    if((bodyClientHeight - props.height - top) < 1){
        style.bottom = `${bodyClientHeight - inputRect.y}px`
        style.top = 'unset'
    }else{
        style.top = `${top}px`
        style.bottom = 'unset'
    }
    componentStyle.value = style
    showList.value = true
}

function reloadTable() {
    magicTable.value && magicTable.value.reload()
}

function keydown(e){
    // esc
    if(e && e.keyCode == 27){
        closeTable()
    }
}

function closeTable(){
    props.closeCurrentColEditMode && props.closeCurrentColEditMode()
    showList.value = false
}

function addEventListener() {
    listContainerRef.value.addEventListener('keydown', keydown)
}

function removeListener() {
    listContainerRef.value.removeEventListener('keydown', keydown)
}

onBeforeUnmount(() => {
    removeListener()
})

function focus(){
    magicInput.value.$refs[Object.keys(toRaw(magicInput.value.$refs))[0]].focus()
    inputClick()
}

defineExpose({ focus })

</script>
