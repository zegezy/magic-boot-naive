<template>

  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="lightThemeOverrides">
    <n-theme-editor>
      <router-view/>
    </n-theme-editor>
  </n-config-provider>
</template>

<script setup>
import {NConfigProvider, NThemeEditor, zhCN, dateZhCN} from 'naive-ui'
import {lightThemeOverrides} from "@/styles";

</script>