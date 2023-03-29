<template>
  <div class="mb-list">
    <div class="mb-search">
      <mb-search :where="tableOptions.where" @search="reloadTable" />
    </div>
    <div class="mb-table">
      <mb-table ref="table" v-bind="tableOptions" />
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, h } from 'vue'
  const table = ref()
  const tableOptions = reactive({
    url: '/system/log/login/list',
    where: {
      createDate: {
        component: 'date',
        label: '创建时间',
        props: {
          type: 'datetimerange'
        }
      }
    },
    cols: [
      {
        field: 'username',
        label: '登录名'
      },
      {
        field: 'failPassword',
        label: '失败密码'
      },
      {
        field: 'type',
        label: '登录状态',
        width: '100px',
        render: (row) => {
          return row.type == '成功' ? h('b', { style: { color: '#409EFF' } }, { default: () => '成功' }) : h('b', { style : { color: 'red' } }, { default: () => '失败' })
        }
      },
      {
        field: 'address',
        label: '登录地址'
      },
      {
        field: 'ip',
        label: 'ip',
        width: '150px'
      },
      {
        field: 'browser',
        label: '浏览器'
      },
      {
        field: 'os',
        label: '系统',
        props: {
          "show-overflow-tooltip": true
        }
      },
      {
        field: 'createDate',
        label: '操作时间',
        width: '180px'
      }
    ]
  })
  function reloadTable(){
    table.value.reload()
  }
</script>
