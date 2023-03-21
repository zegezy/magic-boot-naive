<template>
  <mb-table v-bind="tableOptions" key="asdasdas"/>
</template>

<script setup>
import { reactive } from 'vue'
const tableOptions = reactive({
  url: '/system/user/list',
  size: 999999999,
  columns: [
    {
      key: 'username',
      title: '登录名称',
      width: 100,
    },
    {
      key: 'name',
      title: '姓名/昵称',
      width: 100,
    },
    {
      key: 'officeName',
      title: '所属机构',
      width: 100,
    },
    {
      key: 'roles',
      title: '角色',
      width: 100,
    },
    {
      key: 'phone',
      title: '手机号',
      width: 100,
    }
  ]
})
</script>