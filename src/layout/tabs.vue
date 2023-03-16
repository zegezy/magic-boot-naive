<template>
  <n-space>
    <n-tag
      v-for="tab in tabsStore.getTabs"
      closable
      @close="handleClose(tab.path)"
      @click="jump(tab)"
      :type="tabsStore.getCurrentTab == tab.path ? 'success' : 'default'"
    >
      {{ tab.meta.title }}
    </n-tag>
  </n-space>
</template>

<script setup>
  import { useTabsStore } from '@/store/modules/tabsStore'
  import router from '@/scripts/router'
  const tabsStore = useTabsStore()
  const tabs = tabsStore.getTabs

  function handleClose(path){
    if(tabs.length == 1){
      tabs.splice(0, 1)
      router.push({
        path: '/home'
      })
    }else{
      tabs.forEach((it, i) => {
        if(it.path == path){
          tabs.splice(i, 1)
          router.push({
            path: tabs[tabs.length - 1].path,
            query: tabs[tabs.length - 1].query
          })
        }
      })
    }
  }
  function jump(item){
    router.push({
      path: item.path,
      query: tabs.filter(it => it.path == item.path)[0].query
    })
  }
</script>

<style scoped>
.n-tag{
  cursor: pointer;
  height: 32px;
}
</style>