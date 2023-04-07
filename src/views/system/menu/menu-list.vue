<template>
    <div class="mb-list">
        <div class="mb-search">
            <n-space>
                <n-input v-model:value="searchValue" :size="$global.uiSize.value" @keyup.enter="searchMenu" placeholder="菜单名称、链接、权限标识"
                         style="width: 200px"></n-input>
                <n-button type="primary" :size="$global.uiSize.value" @click="searchMenu">
                    <n-icon>
                        <Search/>
                    </n-icon>
                    搜索
                </n-button>
                <n-button :size="$global.uiSize.value" @click="() => { searchValue = ''; searchMenu() }">
                    <n-icon>
                        <TrashOutline/>
                    </n-icon>
                    清空
                </n-button>
            </n-space>
        </div>
        <div class="mb-toolbar">
            <n-space>
                <n-button :size="$global.uiSize.value" type="primary" @click="addSubMenu('0')" v-permission="'menu:save'">
                    <n-icon>
                        <AddOutline/>
                    </n-icon>
                    添加菜单
                </n-button>
                <n-button :size="$global.uiSize.value" type="primary" @click="() => table.toggleExpand()">
                    <n-icon>
                        <ArrowDownOutline/>
                    </n-icon>
                    展开/折叠
                </n-button>
            </n-space>
        </div>
        <div class="mb-table">
            <mb-table ref="table" v-bind="tableOptions"/>
        </div>
        <mb-modal ref="menuFormDialog" width="650px" :title="dialogTitle" @confirm="menuFormRef.save($event)">
            <menu-form ref="menuFormRef" :menu-tree="menuTree" :menu-data="menuData" @reload-table="reloadTable"/>
        </mb-modal>
    </div>
</template>

<script setup>

import {ref, reactive, onMounted, nextTick, watch, h} from 'vue'
import MenuForm from './menu-form'
import common from '@/scripts/common'
import treeTable from '@/scripts/treeTable'
import * as icons from "@vicons/ionicons5";
import {NIcon} from 'naive-ui';
import {Search, TrashOutline, AddOutline, ArrowDownOutline} from "@vicons/ionicons5";


let menuTree = ref([])
const menuData = ref([])
let searchValue = ref('')
const table = ref()
const tableOptions = reactive({
    loading: false,
    showNo: false,
    page: false,
    cols: [
        {
            field: 'name',
            label: '菜单名称',
            type: 'html'
        },
        {
            field: 'url',
            label: '路径',
            type: 'html'
        },
        {
            field: 'permission',
            label: '权限标识',
            width: 150,
            type: 'html'
        },
        {
            field: 'icon',
            label: '图标',
            render(row) {
                if (row.icon && icons[row.icon]) {
                    return h(NIcon, null, {default: () => h(icons[row.icon])})
                }
            }
        },
        {
            field: 'sort',
            label: '序号',
        },
        {
            label: '排序',
            type: 'buttons',
            width: 180,
            buttons: [
                {
                    label: '上移',
                    link: true,
                    click: (row) => {
                        common.$get('/system/menu/sort/up', {
                            id: row.id,
                            pid: row.pid,
                            sort: row.sort
                        }).then(() => {
                            reloadTable()
                        })
                    }
                },
                {
                    label: '下移',
                    link: true,
                    click: (row) => {
                        common.$get('/system/menu/sort/down', {
                            id: row.id,
                            pid: row.pid,
                            sort: row.sort
                        }).then(() => {
                            reloadTable()
                        })
                    }
                }
            ]
        },
        {
            field: 'isShow',
            label: '是否显示',
            type: 'switch',
            width: 100,
            change: (row) => {
                common.$get('/system/menu/change', {
                    id: row.id,
                    isShow: row.isShow
                })
            }
        },
        {
            field: 'keepAlive',
            label: '是否缓存',
            type: 'switch',
            width: 100,
            if: (row) => {
                if (row.isShow == 0) {
                    return false
                }
                if (!$xe.isEmpty(row.children) && row.children.some(it => it.isShow == 1)) {
                    return false
                }
                return row.url ? true : false
            },
            change: (row) => {
                common.$get('/system/menu/change', {
                    id: row.id,
                    keepAlive: row.keepAlive
                })
            }
        },
        {
            label: '操作',
            type: 'buttons',
            width: 280,
            fixed: 'right',
            align: 'left',
            buttons: [
                {
                    label: '添加下级菜单',
                    link: true,
                    permission: 'menu:save',
                    click: (row) => {
                        addSubMenu(row.id)
                    }
                },
                {
                    label: '修改',
                    link: true,
                    permission: 'menu:save',
                    click: (row) => {
                        handleUpdate(row)
                    }
                },
                {
                    label: '删除',
                    link: true,
                    permission: 'menu:delete',
                    click: (row) => {
                        common.handleDelete({
                            url: '/system/menu/delete',
                            id: row.id,
                            done: () => reloadTable()
                        })
                    }
                }
            ]
        }
    ]
})
const dialogTitle = ref('')
const menuFormDialog = ref()
const menuFormRef = ref()

function reloadTable() {
    tableOptions.loading = true
    common.$get('/system/menu/tree').then(res => {
        menuData.value = res.data.list
        tableOptions.data = menuData.value
        tableOptions.loading = false
    })
}

function searchMenu() {
    table.value.expand()
    if (searchValue.value) {
        tableOptions.data = treeTable.recursionSearch(['name', 'url', 'permission'], common.copyNew(menuData.value), searchValue.value)
    } else {
        tableOptions.data = menuData.value
    }
}

function addSubMenu(id) {
    dialogTitle.value = '添加'
    menuFormDialog.value.show()
    nextTick(() => {
        menuFormRef.value.addSubMenu(id)
    })
}

function handleUpdate(row) {
    dialogTitle.value = '修改'
    menuFormDialog.value.show()
    nextTick(() => {
        menuFormRef.value.getInfo(row);
    })
}

onMounted(() => reloadTable())

watch(menuData, () => {
    menuTree.value = [{
        label: '根节点',
        key: '0',
        children: treeTable.genTree(menuData.value)
    }]
})

</script>
