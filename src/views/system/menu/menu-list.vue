<template>
  <div class="mb-list">
    <div class="mb-search">
      <n-space>
        <n-input v-model:value="searchValue" @keyup.enter="searchMenu" placeholder="菜单名称、链接、权限标识" style="width: 200px"></n-input>
        <n-button type="primary" @click="searchMenu">
          搜索
        </n-button>
        <n-button @click="() => { searchValue = ''; searchMenu() }">
          清空
        </n-button>
      </n-space>
    </div>
    <div class="mb-toolbar">
      <n-space>
        <n-button type="primary" @click="addSubMenu('0')" v-permission="'menu:save'">
          添加菜单
        </n-button>
        <n-button type="primary" @click="() => table.toggleExpand()">展开/折叠</n-button>
      </n-space>
    </div>
    <div class="mb-table">
      <mb-table ref="table" v-bind="tableOptions" key="123123123"/>
    </div>
    <mb-modal ref="menuFormDialog" style="width: 1050px" :title="dialogTitle" @confirm="menuFormRef.save($event)">
      <menu-form ref="menuFormRef" :menu-tree="menuTree" :menu-data="menuData" @reload-table="reloadTable" />
    </mb-modal>
  </div>
</template>

<script setup>

import { ref,reactive, onMounted, nextTick, watch } from 'vue'
import MenuForm from './menu-form'
import common from '@/scripts/common'
import treeTable from '@/scripts/treeTable'

let menuTree = ref([])
const menuData = ref([])
let searchValue = ref('')
const table = ref()
const tableOptions = reactive({
  loading: false,
  showNo: false,
  page: false,
  columns: [
    {
      key: 'name',
      title: '菜单名称',
      type: 'html'
    },
    {
      key: 'url',
      title: '路径',
      type: 'html'
    },
    {
      key: 'permission',
      title: '权限标识',
      width: 150,
      type: 'html'
    },
    {
      key: 'icon',
      title: '图标',
    },
    {
      key: 'sort',
      title: '排序',
    },
    {
      title: '排序',
      type: 'buttons',
      width: 180,
      buttons: [
        {
          title: '上移',
          click: (row) => {
            common.$get('/system/menu/sort/up',{
              id: row.id,
              pid: row.pid,
              sort: row.sort
            }).then(() => {
              reloadTable()
            })
          }
        },
        {
          title: '下移',
          click: (row) => {
            common.$get('/system/menu/sort/down',{
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
      key: 'isShow',
      title: '是否显示',
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
      key: 'keepAlive',
      title: '是否缓存',
      type: 'switch',
      width: 100,
      change: (row) => {
        common.$get('/system/menu/change', {
          id: row.id,
          keepAlive: row.keepAlive
        })
      }
    },
    {
      title: '操作',
      type: 'buttons',
      width: 280,
      fixed: 'right',
      align: 'left',
      buttons: [
        {
          title: '添加下级菜单',
          type: 'primary',
          link: true,
          permission: 'menu:save',
          icon: 'ElIconPlus',
          click: (row) => {
            addSubMenu(row.id)
          }
        },
        {
          title: '修改',
          type: 'primary',
          link: true,
          permission: 'menu:save',
          icon: 'ElIconEdit',
          click: (row) => {
            handleUpdate(row)
          }
        },
        {
          title: '删除',
          type: 'primary',
          link: true,
          permission: 'menu:delete',
          icon: 'ElIconDelete',
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

function reloadTable(){
  tableOptions.loading = true
  common.$get('/system/menu/tree').then(res => {
    menuData.value = res.data.list
    tableOptions.data = menuData.value
    tableOptions.loading = false
  })
}

function searchMenu() {
  table.value.expand()
  if(searchValue.value){
    tableOptions.data = treeTable.recursionSearch(['name', 'url', 'permission'], common.copyNew(menuData.value), searchValue.value)
  }else{
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

function generateIconCode(symbol) {
  return `<svg style="width: 20px;height: 20px;fill: #999" aria-hidden="true" class="svg-icon disabled"><use href="#icon-${symbol}"></use></svg>`
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
