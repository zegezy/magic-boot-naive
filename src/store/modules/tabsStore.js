import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabsStore = defineStore('tabs', () => {

  const currentTab = ref('')
  const tabs = ref([])
  const isShow = ref(true)

  function setCurrentTab(value){
    currentTab.value = value
  }

  const getCurrentTab = computed(() => currentTab.value)

  function pushTab(value){
    tabs.value.push(value)
  }

  function closeTab(i){
    tabs.value.splice(i, 1)
  }

  function replaceTab(value, i){
    tabs.value[i] = value
  }

  function show(){
    isShow.value = true
  }

  function hide(){
    isShow.value = false
  }

  const getShow = computed(() => isShow.value)
  const getTabs = computed(() => tabs.value)

  return {
    setCurrentTab,
    pushTab,
    closeTab,
    show,
    hide,
    replaceTab,
    getCurrentTab,
    getTabs,
    getShow
  }
})