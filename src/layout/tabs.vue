<template>
  <div class="modern-tabs">
    <div class="tabs-wrapper" ref="tabsWrapper">
      <div class="tabs-scroll" ref="tabsScroll">
        <div
            v-for="tab in tabsStore.getTabs"
            :key="tab.path"
            class="tab-item"
            :class="{ active: tabsStore.getCurrentTab === tab.path }"
            @click="handleTabClick(tab)"
            @contextmenu.prevent="handleContextMenu($event, tab)"
        >
          <mb-icon v-if="tab.meta.icon" :icon="tab.meta.icon" class="tab-icon"/>
          <span class="tab-title">{{ tab.meta.title }}</span>
          <n-button
              v-if="tab.path !== '/home'"
              quaternary
              circle
              size="tiny"
              class="close-btn"
              @click.stop="handleClose(tab)"
          >
            <template #icon>
              <mb-icon icon="error"/>
            </template>
          </n-button>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <n-dropdown
        :show="showDropdown"
        :options="dropdownOptions"
        :x="dropdownX"
        :y="dropdownY"
        placement="bottom-start"
        @clickoutside="showDropdown = false"
        @select="handleDropdownSelect"
    />
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {useTabsStore} from '@/store/modules/tabsStore'
import {useRouter} from 'vue-router'
import MbIcon from '@/components/magic/basic/mb-icon.vue'

const router = useRouter()
const tabsStore = useTabsStore()
const showDropdown = ref(false)
const dropdownX = ref(0)
const dropdownY = ref(0)
const currentTab = ref(null)

// 右键菜单选项
const dropdownOptions = computed(() => [
  {
    label: '刷新页面',
    key: 'refresh'
  },
  {
    label: '关闭标签',
    key: 'close',
    disabled: tabsStore.getTabs.length <= 1
  },
  {
    label: '关闭其他',
    key: 'closeOthers',
    disabled: tabsStore.getTabs.length <= 1
  },
  {
    label: '关闭所有',
    key: 'closeAll',
    disabled: tabsStore.getTabs.length <= 1
  }
])

// 处理标签点击
function handleTabClick(tab) {
  if (tab.path !== tabsStore.getCurrentTab) {
    router.push(tab.path)
  }
}

// 处理右键菜单
function handleContextMenu(e, tab) {
  showDropdown.value = true
  dropdownX.value = e.clientX
  dropdownY.value = e.clientY
  currentTab.value = tab
}

// 处理右键菜单选择
function handleDropdownSelect(key) {
  const index = tabsStore.getTabs.findIndex(t => t.path === currentTab.value.path)
  switch (key) {
    case 'refresh':
      router.replace({
        path: '/redirect' + currentTab.value.path
      })
      break
    case 'close':
      if (index !== -1) {
        tabsStore.closeTab(index)
      }
      break
    case 'closeOthers':
      tabsStore.closeOtherTabs(currentTab.value.path)
      break
    case 'closeAll':
      tabsStore.closeAllTabs()
      break
  }
  showDropdown.value = false
}

// 处理关闭的函数
function handleClose(tab) {
  const index = tabsStore.getTabs.findIndex(t => t.path === tab.path)
  console.log('Closing tab index:', index)
  if (index !== -1) {
    // 如果关闭的是当前激活的标签，需要先跳转到其他标签
    if (tab.path === tabsStore.getCurrentTab) {
      // 优先选择左侧标签，如果没有则选择右侧标签
      const nextTab = tabsStore.getTabs[index - 1] || tabsStore.getTabs[index + 1]
      if (nextTab) {
        router.push(nextTab.path)
      }
    }
    // 关闭标签
    tabsStore.closeTab(index)
  }
}
</script>

<style scoped lang="less">
.modern-tabs {
  position: relative;
  width: 100%;
  height: 100%;

  .tabs-wrapper {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 5px;

    // 隐藏滚动条但保持功能
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .tabs-scroll {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 8px;
    }
  }

  .tab-item {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    margin-right: 6px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

    .tab-icon {
      font-size: 16px;
      color: #666;
      margin-right: 6px;
      transition: color 0.3s ease;
    }

    .tab-title {
      font-size: 14px;
      color: #333;
      transition: color 0.3s ease;
    }

    .close-btn {
      width: 0;
      padding: 0;
      opacity: 0;
      transition: all 0.2s ease;
      color: #999;
      overflow: hidden;

      &:hover {
        color: var(--primary-color, #177ddc);
        background-color: rgba(23, 125, 220, 0.1);
      }
    }

    &:hover {
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
      transform: translateY(-1px);

      .close-btn {
        width: 16px;
        opacity: 1;
        margin-left: 6px;
      }
    }

    &.active {
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-color: rgba(255, 255, 255, 0.9);

      .tab-icon,
      .tab-title {
        color: var(--primary-color, #177ddc) !important;
        font-weight: 500;
      }
    }
  }
}
</style>
