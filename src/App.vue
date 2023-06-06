<template>
    <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="lightThemeOverrides">
        <n-message-provider>
            <n-dialog-provider>
<!--                <n-theme-editor>-->
                    <router-view/>
<!--                </n-theme-editor>-->
            </n-dialog-provider>
        </n-message-provider>
    </n-config-provider>
</template>

<script setup>
import {NConfigProvider, NThemeEditor, zhCN, dateZhCN} from 'naive-ui'
import {lightThemeOverrides} from "@/styles";

</script>

<style lang="less">
@import 'styles/index.less';
.n-config-provider{
    height: 100%;
}
</style>
