<style scoped>
.left{
  width: calc(20% - 20px);
  margin-right: 20px;
  float: left;
}
.right{
  width: 80%;
  height: 100%;
  float: right;
}
.app-container{
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div class="app-container">
    <div class="left">
      <mb-tree
        url="/system/office/tree"
        v-model="tableOptions.where.officeId"
        :expand="false"
        search
        search-width="100%"
        :checked="false"
        @check-change="checkChange"
      />
    </div>
    <div class="right">
      <div class="mb-list">
        <div class="mb-search">
          <mb-search :where="tableOptions.where" @search="reloadTable">
            <template #buttons>
              <n-button type="primary" @click="table.exportExcel()">
                导出
              </n-button>
            </template>
          </mb-search>
        </div>

        <div class="mb-toolbar">
          <n-button v-permission="'user:save'" type="primary" @click="handleCreate">添加</n-button>
<!--          <mb-button v-permission="'user:delete'" plain :request-url="'/system/user/delete'" :btn-type="'delete'" :request-data="{ id: ids }" :after-handler="reloadTable" />-->
<!--          <mb-upload-file ref="importUserRef" action="/system/user/import/preview" label="导入用户" :show-tip="false" :show-file-list="false" :show-remove-tip="false" :on-success="importUserSuccess" />-->
        </div>

        <div class="mb-table">
          <mb-table ref="table" v-bind="tableOptions" @selection-change="selectionChange" />
        </div>

        <mb-modal ref="previewUsersDialog" title="预览数据" @confirm="importUsers">
          <mb-table v-bind="importUserTableOptions" />
        </mb-modal>

        <mb-modal ref="userFormDialog" :title="dialogTitle" @confirm="userForm.save($event)" width="670px">
          <user-form ref="userForm" :key="'userForm'" @reload-table="reloadTable" />
        </mb-modal>
      </div>
    </div>
    <div class="clear"></div>
  </div>
</template>

<script setup>
import UserForm from './user-form.vue'

import { ref, reactive, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import common from '@/scripts/common'
const route = useRoute()

const importUserRef = ref()
const previewUsersDialog = ref()
const importUserTableOptions = reactive({

})
const sourceDatas = ref()
function importUserSuccess(res, file, fileList){
  const { datas } = res.data
  sourceDatas.value = res.data.sourceDatas
  importUserRef.value.handlerRemove(file)
  if(datas && datas.length){
    let cols = []
    for(let key in datas[0]){
      cols.push({
        field: key,
        label: key
      })
    }
    previewUsersDialog.value.show(() => {
      importUserTableOptions.data = datas
      importUserTableOptions.cols = cols
    })
  }
}
function importUsers(){
  common.$postJson('/system/user/import', {
    datas: sourceDatas.value
  }).then(res => {
    if(res.data){
      $message.success('导入成功')
      previewUsersDialog.value.hide()
      table.value.reload()
    }
  })
}
const tableOptions = reactive({
  url: '/system/user/list',
  page: true,
  selection: true,
  where: {
    username: {
      label: '登录名称'
    },
    name: {
      label: '姓名/昵称'
    },
    roleId: {
      component: 'select',
      label: '角色',
      props: {
        url: '/system/role/all',
        multiple: true,
        width: '200px'
      }
    },
    officeId: ''
  },
  cols: [
    {
      field: 'username',
      label: '登录名称'
    },
    {
      field: 'name',
      label: '姓名/昵称'
    },
    {
      field: 'officeName',
      label: '所属机构'
    },
    {
      field: 'roles',
      label: '角色'
    },
    {
      field: 'phone',
      label: '手机号'
    },
    {
      field: 'isLogin',
      label: '禁止登录',
      type: 'switch',
      exportRender: (row) => {
        return row.isLogin == 1 ? '已禁用' : '未禁用'
      },
      width: 100,
      if: (row) => {
        return row.id != '1'
      },
      change: (row) => {
        common.$get('/system/user/change/login/status', {
          id: row.id,
          isLogin: row.isLogin
        })
      }
    },
    {
      field: 'createDate',
      label: '创建时间',
      width: 180
    },
    {
      label: '操作',
      type: 'buttons',
      width: 140,
      fixed: 'right',
      buttons: [
        {
          permission: 'user:save',
          label: '修改',
          type: 'primary',
          link: true,
          click: (row) => {
            handleUpdate(row)
          }
        },
        {
          permission: 'user:delete',
          label: '删除',
          type: 'primary',
          link: true,
          if: (row) => {
            return row.id != '1'
          },
          click: (row) => {
            common.handleDelete({
              url: '/system/user/delete',
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
const ids = ref([])
const userFormDialog = ref()
const table = ref()
const userForm = ref()

if(route.query.roleId){
  tableOptions.where.roleId.value = route.query.roleId
}

if(route.query.officeId){
  tableOptions.where.officeId = route.query.officeId
}

function checkChange(values) {
  tableOptions.where.officeId = values
  nextTick(() => reloadTable())
}

function selectionChange(columns) {
  ids.value = columns.map(it => it['id']).join(',')
}

function reloadTable() {
  userFormDialog.value.hide()
  table.value.reload()
}

function handleCreate() {
  dialogTitle.value = '添加'
  userFormDialog.value.show()
  nextTick(() => {
    userForm.value.resetTemp()
  })
}

function handleUpdate(row) {
  dialogTitle.value = '修改'
  userFormDialog.value.show()
  nextTick(() => {
    userForm.value.getInfo(row)
  })
}

</script>
