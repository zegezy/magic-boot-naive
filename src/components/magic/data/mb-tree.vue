<template>
    <div>
        <div style="margin-bottom: 5px;" v-if="expand || checked">
            <n-space>
                <n-button :size="$global.uiSize.value"  v-if="expand" type="primary" @click="doExpand">展开/折叠</n-button>
                <n-button :size="$global.uiSize.value"  v-if="checked" type="primary"
                          @click="() => { treeAllChecked = !treeAllChecked; checkedAll(treeAllChecked) }">全选/全不选
                </n-button>
            </n-space>
        </div>
        <div style="margin-bottom: 5px;" v-if="search">
            <n-input :size="$global.uiSize.value"  v-model:value="searchValue" placeholder="输入关键字进行过滤"/>
        </div>
        <n-tree
            v-bind="props.props"
            virtual-scroll
            block-line
            cascade
            checkable
            :style="style"
            key-field="id"
            label-field="name"
            :data="treeData"
            :checked-keys="checkedKeys"
            :pattern="searchValue"
            :show-irrelevant-nodes="false"
            :default-expand-all="defaultExpandAll"
            :node-props="nodeProps"
            @update:checked-keys="updateCheckedKeys"
        />
    </div>
</template>

<script setup>

import {watch, ref, nextTick, onBeforeMount} from 'vue'
import common from '@/scripts/common'
import treeTable from '@/scripts/treeTable'
import { clone, uniq, pull, pullAll } from 'lodash-es'

const emit = defineEmits(['update:modelValue', 'check-change', 'node-click'])

const props = defineProps({
    url: {
        type: String,
        default: ''
    },
    params: {
        type: Object,
        default: () => {
        }
    },
    modelValue: {
        type: String,
        default: ''
    },
    style: {
        type: Object,
        default: () => {
        }
    },
    props: {
        type: Object,
        default: () => {
        }
    },
    expand: {
        type: Boolean,
        default: true
    },
    checked: {
        type: Boolean,
        default: true
    },
    search: {
        type: Boolean,
        default: false
    },
    searchWidth: {
        type: String,
        default: '230px'
    },
    keyAll: {
        type: Boolean,
        default: true
    }
})

const checkedAllKeys = ref([])
const checkedKeys = ref([])

function updateCheckedKeys(keys, option, meta) {
    let action = meta.action
    let node = meta.node
    let id = node.id
    let pid = node.pid
    let children = node.children
    // 去重
    checkedAllKeys.value = uniq(checkedAllKeys.value)
    if ($xe.isEmpty(children)) {
        if (action == 'check') {
            // 添加"当前节点"
            checkedKeys.value.push(id)

            // 添加"所有父级"和"当前节点"
            checkedAllKeys.value.push(...getParentIds(id))
            checkedAllKeys.value.push(id)
        } else {
            // 删除"当前节点"
            pull(checkedKeys.value, id)

            // 删除"当前节点"和"所有子级未全选的父级"
            pull(checkedAllKeys.value, id)
            upRecursionCheck(pid)
        }
    } else {
        // 获取所有子级（不包含任何父级）
        let selectedKeys = getIds(children)
        // 获取所有子级（包含所有父级）
        let selectedAllKeys = getIds(children, true)
        if (action == 'check') {
            // 添加当前节点下所有的子级（不包含任何父级）
            checkedKeys.value.push(...selectedKeys)

            // 添加"当前节点"和"所有子级"和"所有父级"
            checkedAllKeys.value.push(id)
            checkedAllKeys.value.push(...getParentIds(id))
            checkedAllKeys.value.push(...selectedAllKeys)
        } else {
            // 删除当前节点下所有的子级（不包含任何父级）
            pullAll(checkedKeys.value, selectedKeys)
            // 删除"当前节点"和"所有子级"和"所有父级"
            pullAll(checkedAllKeys.value, selectedAllKeys)
            pull(checkedAllKeys.value, id)
            upRecursionCheck(pid)
        }
    }
    // 去重
    checkedAllKeys.value = uniq(checkedAllKeys.value)
    if(props.keyAll){
        emit('update:modelValue', checkedAllKeys.value.join(','))
        emit('check-change', checkedAllKeys.value.join(','))
    }else{
        emit('update:modelValue', checkedKeys.value.join(','))
        emit('check-change', checkedKeys.value.join(','))
    }
}

function upRecursionCheck(pid){
    if(pid != '0'){
        // 获取所有同级
        let siblings = sourceData.value.filter(it => it.pid == pid)
        // 如果同级都没有选中则取消父级id
        if(!siblings.some(it => checkedAllKeys.value.indexOf(it.id) != -1)){
            pull(checkedAllKeys.value, pid)
            // 获取父级
            let parent = sourceData.value.filter(it => it.id == pid)[0]
            upRecursionCheck(parent.pid)
        }
    }
}

function getIds(children, all) {
    all = all == undefined ? false : true
    let ids = []
    getAllSubs(children, ids, all)
    return ids
}

function getAllSubs(children, ids, all){
    children.forEach(it => {
        if (it.children && it.children.length > 0) {
            if(all){
                ids.push(it.id)
            }
            getAllSubs(it.children, ids, all)
        }else{
            ids.push(it.id)
        }
    })
}

// 获取所有父级的id
function getParentIds(id){
    let ids = []
    upRecursion(id, ids)
    return ids
}

function upRecursion(id, ids){
    let menu = sourceData.value.filter(it => it.id == id)[0]
    if(menu && menu.pid != '0'){
        ids.push(menu.pid)
        let parentMenu = sourceData.value.filter(it => it.id == menu.pid)[0]
        if(parentMenu){
            upRecursion(parentMenu.id, ids)
        }
    }
}

function loadSourceData(children){
    children.forEach(it => {
        let chi = clone(it)
        delete chi.children
        sourceData.value.push(chi)
        if(it.children && it.children.length > 0){
            loadSourceData(it.children)
        }
    })
}

const tree = ref()
const treeData = ref([])
const sourceData = ref([])
const defaultExpandAll = ref(true)
const refreshTree = ref(false)
const treeAllChecked = ref(false)
const searchValue = ref('')

onBeforeMount(async () => {
    await loadTreeData()
})

function selectIds(value) {
    if(value){
        let ids = []
        let values = value.split(',')
        checkedAllKeys.value = values
        values.forEach(id => {
            // 如果当前id没有子级
            if(!sourceData.value.some(it => it.pid == id)){
                ids.push(id)
            }
        })
        checkedKeys.value = ids
    }
}

function doExpand() {
    refreshTree.value = false
    defaultExpandAll.value = !defaultExpandAll.value
    nextTick(() => refreshTree.value = true)
}

function nodeProps({option}) {
    return {
        onClick() {
            emit('node-click', option)
        }
    }
}

async function loadTreeData() {
    if (treeData.value.length == 0) {
        await common.$get(props.url, props.params).then((res) => {
            treeTable.deleteEmptyChildren(res.data.list)
            treeData.value = res.data.list
            loadSourceData(treeData.value)
        })
        refreshTree.value = true
        await nextTick(() => selectIds(props.modelValue))
        watch(() => props.modelValue, (value) => {
            nextTick(() => selectIds(value))
        })
    }
}

function getTree() {
    return tree.value
}

function checkedAll(checked) {
    if (checked) {
        checkedKeys.value = getIds(treeData.value)
        checkedAllKeys.value = sourceData.value.map(it => it.id)
    } else {
        checkedKeys.value = []
        checkedAllKeys.value = []
    }
}

defineExpose({getTree})

</script>

