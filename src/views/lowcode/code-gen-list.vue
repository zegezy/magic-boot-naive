<template>
  <mb-list ref="magicList" v-bind="listOptions" />
  <mb-dialog ref="formDialog" title="配置" @confirm-click="magicForm.save($event)" width="1400px">
    <template #content>
      <code-gen-form ref="magicForm" @reload="magicList.reload" />
    </template>
  </mb-dialog>
</template>

<script setup>
  import codeGenForm from './code-gen-form.vue'
  import {ref, reactive, getCurrentInstance, nextTick} from 'vue'
  const { proxy } = getCurrentInstance()
  const formDialog = ref()
  const magicList = ref()
  const magicForm = ref()
  const listOptions = reactive({
    tools: [{
      type: 'add',
      permission: 'code:gen:save',
      click: () => {
        formDialog.value.show()
        nextTick(() => magicForm.value.watchInfo())
      }
    }],
    table: {
      url: '/system/code/gen/list',
      where: {
        tableName: {
          label: '表名'
        },
        tableComment: {
          label: '描述'
        },
        createDate: {
          component: 'date',
          label: '创建时间',
          props: {
            type: 'daterange'
          }
        }
      },
      cols: [
        {
          field: 'tableName',
          label: '表名'
        },{
          field: 'tableComment',
          label: '描述'
        },{
          field: 'createDate',
          label: '创建时间'
        },{
          field: 'updateDate',
          label: '更新时间'
        }, {
          label: '操作',
          type: 'btns',
          width: 180,
          fixed: 'right',
          btns: [
            {
              permission: 'code:gen:save',
              label: '修改',
              type: 'primary',
              link: true,
              icon: 'ElIconEdit',
              click: (row) => {
                formDialog.value.show()
                nextTick(() => magicForm.value.getDetail(row.id))
              }
            }, {
              permission: 'code:gen:delete',
              label: '删除',
              type: 'primary',
              link: true,
              icon: 'ElIconDelete',
              click: (row) => {
                proxy.$common.handleDelete({
                  url: '/system/code/gen/delete',
                  id: row.id,
                  done: () => magicList.value.reload()
                })
              }
            }
          ]
        }
      ]
    }
  })
</script>
