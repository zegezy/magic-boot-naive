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

import {watch, ref, reactive, nextTick, onBeforeMount} from 'vue'
import common from '@/scripts/common'
import treeTable from '@/scripts/treeTable'
import global from "@/scripts/global.js";

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
    }
})

const checkedKeys = ref([])

function updateCheckedKeys(keys, option, meta) {
    let action = meta.action
    let node = meta.node
    let id = node.id
    let children = node.children
    if ($xe.isEmpty(children)) {
        if (action == 'check') {
            checkedKeys.value.push(id)
        } else {
            checkedKeys.value.splice(checkedKeys.value.indexOf(id), 1)
        }
    } else {
        let selectedKeys = getIds(children)
        selectedKeys.push(id)
        if (action == 'check') {
            checkedKeys.value.push(...selectedKeys)
        } else {
            selectedKeys.forEach(key => {
                checkedKeys.value.splice(checkedKeys.value.indexOf(key), 1)
            })
        }
    }
    emit('update:modelValue', checkedKeys.value.join(','))
    emit('check-change', checkedKeys.value.join(','))
}

function getIds(children) {
    let ids = []
    children.forEach(it => {
        ids.push(it.id)
        if (it.children && it.children.length > 0) {
            ids.push(...getIds(it.children))
        }
    })
    return ids
}

const tree = ref()
const treeData = ref([])
const defaultExpandAll = ref(true)
const refreshTree = ref(false)
const treeAllChecked = ref(false)
const searchValue = ref('')

onBeforeMount(async () => {
    await loadTreeData()
})

watch(() => props.modelValue, (value) => {
    nextTick(() => selectIds(value))
})

function selectIds(ids) {
    checkedKeys.value = ids.split(',')
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
        })
        refreshTree.value = true
        await nextTick(() => selectIds(props.modelValue))
    }
}

function getTree() {
    return tree.value
}

function checkedAll(checked) {
    if (checked) {
        checkedKeys.value = getIds(treeData.value)
    } else {
        checkedKeys.value = []
    }
}

defineExpose({getTree})

</script>

