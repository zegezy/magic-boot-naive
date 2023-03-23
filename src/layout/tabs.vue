<template>
  <!--  <n-space>-->
    <div class="tabs">
      <n-tag
          @contextmenu="handleContextMenu(tab,$event)"
          v-for="tab in tabsStore.getTabs"
          :closable="tab.path!==`/home`"
          @close="handleClose(tab.path)"
          @click="jump(tab)"
          :type="tabsStore.getCurrentTab == tab.path ? 'primary' : 'default'"
          :class="tabsStore.getCurrentTab == tab.path?'selected':''"
          :bordered="false"
      >
        {{ tab.meta.title }}
      </n-tag>

      <n-dropdown
          placement="bottom-start"
          trigger="manual"
          :x="xAxis"
          :y="yAxis"
          :options="dropdownOptions"
          :show="showDropdown"
          :on-clickoutside="onClickoutside"
          @select="handleDropdownSelect"
      />
    </div>

  <!--  </n-space>-->
</template>

<script setup>
import {useTabsStore} from '@/store/modules/tabsStore'
import router from '@/scripts/router'
import {ref} from "vue";

const tabsStore = useTabsStore()
const tabs = tabsStore.getTabs

const showDropdown = ref(false);
const dropdownOptions = ref([
  {
    label: "关闭当前",
    key: 0
  },
  {
    label: "关闭其它",
    key: 1
  },
  {
    label: "关闭全部",
    key: 2
  }
])

// 弹出菜单展示位置
const xAxis = ref(0);
const yAxis = ref(0);

function handleClose(path) {
  if (tabs.length == 1) {
    tabs.splice(0, 1)
    router.push({
      path: '/home'
    })
  } else {
    tabs.forEach((it, i) => {
      if (it.path == path) {
        tabs.splice(i, 1)
        router.push({
          path: tabs[tabs.length - 1].path,
          query: tabs[tabs.length - 1].query
        })
      }
    })
  }
}

function jump(item) {
  router.push({
    path: item.path,
    query: tabs.filter(it => it.path == item.path)[0].query
  })
}

function handleContextMenu(item, e) {
  e.preventDefault();
  xAxis.value = e.clientX;
  yAxis.value = e.clientY;
  showDropdown.value = true;
}

function onClickoutside() {
  showDropdown.value = false;
}

function handleDropdownSelect(e) {
  //TODO 处理弹出菜单点击事件
  console.log("点击项:", e)
  showDropdown.value = false;
}
</script>

<style scoped lang="less">

.n-tag {
  padding: 17px 20px;
  cursor: pointer;
  margin-right: 4px;
  border-radius: 4px;
  //flex-shrink: 0;
}

.selected {

}

.tabs {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
}
</style>
