<template>
<!--  <n-layout position="absolute">-->
<!--    <n-layout-header class="h-16" bordered>-->
<!--      magic boot-->
<!--    </n-layout-header>-->
<!--    <n-layout has-sider class="absolute top-16 right-0 bottom-0 left-0">-->
<!--      <n-layout-sider-->
<!--        bordered-->
<!--        show-trigger-->
<!--        collapse-mode="width"-->
<!--        :collapsed-width="64"-->
<!--        :width="240"-->
<!--        :native-scrollbar="false"-->
<!--      >-->
<!--        <n-menu-->
<!--          :indent="24"-->
<!--          :collapsed-width="64"-->
<!--          :collapsed-icon-size="22"-->
<!--          :options="menuOptions"-->
<!--        />-->
<!--      </n-layout-sider>-->
<!--      <n-layout>-->
<!--        <n-layout-header class="h-10">-->
<!--          &lt;!&ndash; tabs &ndash;&gt;-->
<!--        </n-layout-header>-->
<!--        <n-layout-content class="absolute top-10 right-0 bottom-0 left-0">-->
<!--          <router-view v-slot="{ Component }">-->
<!--            <component :is="Component" />-->
<!--          </router-view>-->
<!--        </n-layout-content>-->
<!--      </n-layout>-->
<!--    </n-layout>-->
<!--  </n-layout>-->
  <n-layout position="absolute" has-sider>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="200"
      show-trigger
    >
      <n-layout position="absolute">
        <n-layout-header class="h-16">
          magic-boot
        </n-layout-header>
        <n-layout-content class="absolute top-16 right-0 bottom-0 left-0" :native-scrollbar="false">
          <n-menu
            ref="menuRef"
            v-model:value="selectedKey"
            :indent="24"
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="menuOptions"
          />
        </n-layout-content>
      </n-layout>
    </n-layout-sider>
    <n-layout>
      <n-layout-header class="h-16">
        logout
      </n-layout-header>
      <n-layout-content class="absolute top-16 right-0 bottom-0 left-0">
        <n-layout position="absolute">
          <n-layout-header class="h-12 p-2">
            <tabs />
          </n-layout-header>
          <n-layout-content class="absolute top-12 right-0 bottom-0 left-0 px-2">
            <router-view v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </n-layout-content>
        </n-layout>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
  import { ref, h, watch } from 'vue';
  import tabs from './tabs.vue'
  import { RouterLink } from 'vue-router'
  // import {
  //   BookOutline as BookIcon
  // } from "@vicons/ionicons5";
  import { NIcon } from 'naive-ui';
  import { useUserStore } from "@/store/modules/userStore"
  import { useTabsStore } from "@/store/modules/tabsStore"
  const tabsStore = useTabsStore()
  const userStore = useUserStore()
  const menuRef = ref()
  const currentTab = tabsStore.getCurrentTab
  const selectedKey = ref(currentTab)
  selectMenu(currentTab)
  watch(() => tabsStore.getCurrentTab, (key) => selectMenu(key))
  function selectMenu(key){
    selectedKey.value = key
    menuRef.value?.showOption(key);
  }
  // function renderIcon(icon) {
  //   return () => h(NIcon, null, { default: () => h(icon) });
  // }

  const menuOptions = ref(recursionRouters(userStore.getPermissionRouters))

  function recursionRouters(children){
    let menus = []
    children.forEach((chi) => {
      let menu = {}
      if(!$xe.isEmpty(chi.children)){
        menu.key = chi.path
        menu.label = chi.title
        menu.children = recursionRouters(chi.children)
      }else{
        menu.key = chi.path
        menu.label = () => h(
          RouterLink,
          {
            to: {
              path: chi.path
            }
          },
          { default: () => chi.title }
        )
      }
      menus.push(menu)
    })
    return menus
  }

</script>