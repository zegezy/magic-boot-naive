import { defineStore } from 'pinia'
import {ref, computed, nextTick} from 'vue'
import router from "@/scripts/router";

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

  function contains(path){
    if(tabs.value.filter(it => it.path == path).length > 0){
      return true
    }
    return false
  }

  function refresh({ path, query }, push){
    let toTab = null
    let _i = 0
    for(let i = 0; i < tabs.value.length; i++){
      let it = tabs.value[i]
      if(it.path == path){
        _i = i
        toTab = it
        break
      }
    }
    tabs.value.splice(_i, 1)
    hide()
    nextTick(() => {
      tabs.value.splice(_i, 0, toTab)
      show()
      if(push){
        router.push({
          path: `${path}`,
          query: query || toTab.query
        })
      }else{
        router.replace({
          path: `/redirect${path}`,
          query: query || toTab.query
        })
      }
    })
  }

  function refreshPush(to){
    refresh(to, true)
  }

  function refreshReplace(to){
    refresh(to, false)
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
    contains,
    refreshPush,
    refreshReplace,
    getCurrentTab,
    getTabs,
    getShow
  }
})