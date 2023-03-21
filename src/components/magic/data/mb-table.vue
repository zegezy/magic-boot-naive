<template>
  <n-data-table
    v-if="showTable"
    v-bind="bindProps"
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
  />
</template>

<script setup>
  import { ref, onMounted, nextTick, h } from 'vue'
  import common from '@/scripts/common'
  import { createTable } from './mb-table.js'
  import { NButton } from 'naive-ui'
  import MbSwitch from '@/components/magic/form/mb-switch.vue'
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

  const emit = defineEmits(['update:modelValue'])

  function fixColumns(){
    props.columns.forEach((col) => {
      if(col.type){
        // 主要是为了解决 树形数据 展开的图标 所在列问题，如果不重置 不会在第一列
        switch(col.type){
          case 'html':
            col.render = (row) => {
              return h('span', {
                innerHTML: row[col.key]
              })
            }
            break;
          case 'buttons':
            col.render = (row) => {
              let buttons = []
              col.buttons.forEach(it => {
                buttons.push(h(
                  'a',{
                    class: 'mx-1 cursor-pointer',
                    onClick: () => it.click(row)
                  },{
                    default: () => it.title
                  }
                ))
              })
              return buttons
            }
            break;
          case 'switch':
            col.render = (row) => {
              return h(MbSwitch, {
                modelValue: row[col.key],
                'onUpdate:modelValue': (value) => row[col.key] = value,
                onChange: () => col.change(row)
              })
            }
        }
        col.type = undefined
      }
    })
  }
  fixColumns()

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