<template>
  <n-data-table
    v-if="showTable"
    v-bind="bindProps"
    ref="tableRef"
    :key="tableKey"
    :class="tableKey"
    :columns="columns"
    :virtual-scroll="virtualScroll"
    table-layout="fixed"
    style="height: 100%"
    flex-height
    :row-key="it => it.id"
    :default-expand-all="defaultExpandAll"
    @update:page="table.handlerPage"
  >
    <template #switch="{ row, col }">
      <mb-switch v-model="row[col.key]" @change="col.change(row)" v-if="(!col.if && true) || (col.if && col.if(row))" />
    </template>
    <template #html="{ row, col }">
      <span v-html="row[col.key]"></span>
    </template>
    <template #buttons="{ row, col }">
      <template v-for="it in col.buttons">
        <a v-if="it.link" v-permission="it.permission" class="mx-1 cursor-pointer" @click="it.click(row)">{{ it.title }}</a>
      </template>
    </template>
  </n-data-table>
</template>

<script setup>
  import { ref, onMounted, nextTick, h, useSlots } from 'vue'
  import common from '@/scripts/common'
  import { createTable } from './mb-table.js'
  import { NButton } from 'naive-ui'
  import MbSwitch from '@/components/magic/form/mb-switch.vue'
  const slots = useSlots()
  const props = defineProps({
    props: {
      type: Object,
      default: () => {}
    },
    virtualScroll: {
      type: Boolean,
      default: true
    },
    url: {
      type: String,
      default: ''
    },
    where: {
      type: Object,
      default: () => {}
    },
    columns: {
      type: Array,
      default: () => []
    },
    method: {
      type: String,
      default: 'post'
    },
    size: {
      type: Number,
      default: 10
    },
    page: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: () => []
    },
    done: {
      type: Function,
      default: () => {}
    },
    loading: {
      type: Boolean,
      default: () => false
    }
  })
  const tableRef = ref()
  const emit = defineEmits(['update:modelValue'])

  function fixColumns(){
    const slots = tableRef.value.$slots
    const keys = Object.keys(slots)
    props.columns.forEach((col) => {
      let type = col.type
      if(type){
        if(keys.indexOf(type) != -1){
          col.render = (row) => {
            return h(slots[type], { row, col })
          }
        }
        // 主要是为了解决 树形数据 展开的图标 所在列问题，如果不重置 不会在第一列
        col.type = undefined
      }
    })
  }
  nextTick(() => {
    fixColumns()
  })

  const tableKey = ref('magicTable' + common.uuid())
  const table = createTable(props)
  const bindProps = table.getBindProps()
  const showTable = ref(true)
  const defaultExpandAll = ref(false)
  function expand(){
    showTable.value = false
    defaultExpandAll.value = true
    nextTick(() => showTable.value = true)
  }

  function toggleExpand(){
    showTable.value = false
    defaultExpandAll.value = !defaultExpandAll.value
    nextTick(() => showTable.value = true)
  }

  onMounted(() => {
    table.loadData()
  })

  defineExpose({ expand, toggleExpand })

</script>