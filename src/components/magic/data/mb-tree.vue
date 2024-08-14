<template>
    <div class="h-full w-full" :style="style">
        <div class="flex flex-col h-full w-full">
            <div style="margin-bottom: 5px;" v-if="expand || checked">
                <n-space>
                    <n-button :size="$global.uiSize.value"  v-if="expand" type="primary" @click="doExpand">展开/折叠</n-button>
                    <n-button :size="$global.uiSize.value"  v-if="checked" type="primary"
                              @click="() => { treeAllChecked = !treeAllChecked; checkedAll(treeAllChecked) }">全选/全不选
                    </n-button>
                </n-space>
            </div>
            <div style="padding: 5px" v-if="search">
                <n-input :size="$global.uiSize.value"  v-model:value="searchValue" placeholder="输入关键字进行过滤"/>
            </div>
            <n-tree
                class="flex-1"
                v-bind="props.props"
                virtual-scroll
                block-line
                :cascade="cascade"
                :checkable="checkable"
                :show-line="showLine"
                :style="treeStyle"
                key-field="id"
                label-field="name"
                :data="treeData"
                :checked-keys="checkedKeys"
                :pattern="searchValue"
                :show-irrelevant-nodes="false"
                :default-expand-all="defaultExpandAll"
                :node-props="nodeProps"
                @update:checked-keys="updateCheckedKeys"
                @update:expanded-keys="updatePrefixWithExpaned"
            />
        </div>
        <n-dropdown
            placement="bottom-start"
            trigger="manual"
            :show="showDropdown"
            :options="contextmenu"
            :x="dropdownX"
            :y="dropdownY"
            @select="dropdownSelect"
            @clickoutside="() => showDropdown = false"
        >
            <!-- 需要有一个空的节点，不然报错-->
            <div></div>
        </n-dropdown>
    </div>
</template>

<script setup>

import {watch, ref, nextTick, onBeforeMount, h} from 'vue'
import treeTable from '@/scripts/treeTable'
import { clone, uniq, pull, pullAll, isEmpty } from 'lodash-es'
import MbIcon from "@/components/magic/basic/mb-icon.vue";

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
        type: String,
        default: ''
    },
    treeStyle: {
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
    },
    cascade: {
        type: Boolean,
        default: true
    },
    checkable: {
        type: Boolean,
        default: false
    },
    showLine: {
        type: Boolean,
        default: false
    },
    contextmenu: {
        type: Array,
        default: undefined
    },
    icon: {
        type: Object,
        default: undefined
    },
    defaultExpandAll: {
        type: Boolean,
        default: true
    }
})
const showDropdown = ref(false)
const dropdownX = ref()
const dropdownY = ref()
const checkedAllKeys = ref([])
const checkedKeys = ref([])

function updateCheckedKeys(keys, option, meta) {
    if(!props.cascade){
        checkedKeys.value = keys
    }else{
        let action = meta.action
        let node = meta.node
        let id = node.id
        let pid = node.pid
        let children = node.children
        // 去重
        checkedAllKeys.value = uniq(checkedAllKeys.value)
        if (isEmpty(children)) {
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
    }
    updateKeys()
}

function updatePrefixWithExpaned(_keys, _option, meta){
    if(props.icon){
        if (!meta.node)
            return;
        switch (meta.action) {
            case "expand":
                meta.node.prefix = () => h(MbIcon, { icon: props.icon.expand })
                break;
            case "collapse":
                meta.node.prefix = () => h(MbIcon, { icon: props.icon.collapse })
                break;
        }
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
    if(menu && menu.pid && menu.pid != '0'){
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
const defaultExpandAll = ref(props.defaultExpandAll)
const refreshTree = ref(false)
const treeAllChecked = ref(false)
const searchValue = ref('')

onBeforeMount(() => {
    loadTreeData()
})

function updateKeys(){
    // 如果开启级联 并且需要返回带父级的值
    if(props.cascade && props.keyAll){
        emit('update:modelValue', checkedAllKeys.value.join(','))
        emit('check-change', checkedAllKeys.value.join(','))
    }else{
        emit('update:modelValue', checkedKeys.value.join(','))
        emit('check-change', checkedKeys.value.join(','))
    }
}

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
        if(props.cascade){
            checkedKeys.value = ids
        }else{
            checkedKeys.value = values
        }
    }
}

function doExpand() {
    refreshTree.value = false
    defaultExpandAll.value = !defaultExpandAll.value
    nextTick(() => refreshTree.value = true)
}

const currentNode = ref()
function nodeProps({option}) {
    return {
        onClick() {
            emit('node-click', option)
        },
        onContextmenu(e) {
            currentNode.value = option
            props.contextmenu.forEach(it => {
                it.show = (it.if && it.if(currentNode.value))
            })
            showDropdown.value = true;
            dropdownX.value = e.clientX;
            dropdownY.value = e.clientY;
            e.preventDefault();
        }
    }
}

function recursionRenderIcon(children){
    children.forEach(it => {
        if(it.isGroup){
            if(it.children && it.children.length){
                it.prefix = () => h(MbIcon, { icon: defaultExpandAll.value ? props.icon.expand : props.icon.collapse })
                recursionRenderIcon(it.children)
            }else{
                it.prefix = () => h(MbIcon, { icon: props.icon.collapse })
            }
        }else{
            it.prefix = () => h(MbIcon, { icon: props.icon.node, color: '#42b883' })
        }
    })
}

function loadTreeData() {
    $common.get(props.url, props.params).then((res) => {
        treeTable.deleteEmptyChildren(res.data.list)
        if(props.icon){
            recursionRenderIcon(res.data.list)
        }
        treeData.value = res.data.list
        loadSourceData(treeData.value)

        refreshTree.value = true
        nextTick(() => selectIds(props.modelValue))
        watch(() => props.modelValue, (value) => {
            nextTick(() => selectIds(value))
        })
    })
}

function reload(){
    loadTreeData()
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
    updateKeys()
}

function dropdownSelect(key){
    showDropdown.value = false
    props.contextmenu && props.contextmenu.filter(it => it.key == key)[0].click(currentNode.value)
}

defineExpose({getTree, reload})

</script>

