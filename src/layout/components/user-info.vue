<template>
    <div class="user-info">
        <template v-if="userStore.getInfo.headPortrait">
            <n-avatar
                round
                :size="40"
                :src="$global.baseApi + userStore.getInfo.headPortrait"
            />
        </template>
        <n-avatar
            v-else
            round
            :size="40"
        >
            {{ userStore.getInfo.name?.substring(0, 1) }}
        </n-avatar>
        <n-dropdown :options="options" @select="handleSelect">
            <n-button text style="font-size: 20px;text-align: center" :class="buttonClass">
                <mb-icon icon="settings" />
            </n-button>
        </n-dropdown>

        <!-- 设置对话框 -->
        <mb-modal ref="settingDialog" title="系统设置" width="600" @confirm="handleConfirm">
            <n-tabs>
                <n-tab-pane name="ui" tab="界面设置">
                    <n-form class="setting-form">
                        <n-form-item label="界面大小" class="setting-form-item">
                            <n-radio-group v-model:value="tempSettings.uiSize" name="ui-size">
                                <n-space>
                                    <n-radio-button value="small">
                                        <template #default>
                                            <div class="radio-content">
                                                <mb-icon icon="size-small" />
                                                <span>小型</span>
                                            </div>
                                        </template>
                                    </n-radio-button>
                                    <n-radio-button value="medium">
                                        <template #default>
                                            <div class="radio-content">
                                                <mb-icon icon="size-medium" />
                                                <span>中等</span>
                                            </div>
                                        </template>
                                    </n-radio-button>
                                    <n-radio-button value="large">
                                        <template #default>
                                            <div class="radio-content">
                                                <mb-icon icon="size-large" />
                                                <span>大型</span>
                                            </div>
                                        </template>
                                    </n-radio-button>
                                </n-space>
                            </n-radio-group>
                        </n-form-item>
                        <n-form-item label="菜单布局" class="setting-form-item">
                            <n-radio-group v-model:value="tempSettings.menuMode" name="menu-mode">
                                <n-space>
                                    <n-radio-button value="side">
                                        <template #default>
                                            <div class="radio-content">
                                                <mb-icon icon="layout-side" />
                                                <span>侧边菜单</span>
                                            </div>
                                        </template>
                                    </n-radio-button>
                                    <n-radio-button value="top">
                                        <template #default>
                                            <div class="radio-content">
                                                <mb-icon icon="layout-top" />
                                                <span>顶部菜单</span>
                                            </div>
                                        </template>
                                    </n-radio-button>
                                </n-space>
                            </n-radio-group>
                        </n-form-item>
                        <n-form-item label="面包屑导航" class="setting-form-item">
                            <n-switch v-model:value="tempSettings.showBreadcrumb">
                                <template #checked>
                                    显示
                                </template>
                                <template #unchecked>
                                    隐藏
                                </template>
                            </n-switch>
                        </n-form-item>
                    </n-form>
                </n-tab-pane>
            </n-tabs>
        </mb-modal>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useUserStore } from "@/store/modules/userStore"
import { useLayoutConfigStore } from '@/store/modules/layoutConfigStore'
import router from '@/scripts/router'
import MbIcon from "@/components/magic/basic/mb-icon.vue";

const userStore = useUserStore()
const layoutConfig = useLayoutConfigStore()
const settingDialog = ref()

// 临时存储设置，确认时才应用
const tempSettings = reactive({
    uiSize: $global.uiSize.value,
    menuMode: layoutConfig.menuMode,
    showBreadcrumb: layoutConfig.showBreadcrumb
})

const options = [
    {
        label: "个人中心",
        key: "userCenter",
    },
    {
        label: "系统设置",
        key: "setting",
    },
    {
        label: "退出",
        key: "logout",
    },
]

// 根据菜单模式动态设置按钮样式
const buttonClass = computed(() => ({
    'settings-btn': true,
    'settings-btn--light': layoutConfig.menuMode === 'top',
    'settings-btn--dark': layoutConfig.menuMode === 'side'
}))

function handleSelect(key) {
    switch (key) {
        case 'logout':
            userStore.logout()
            break
        case 'userCenter':
            router.push({
                path: '/user-center'
            })
            break
        case 'setting':
            // 打开对话框时，初始化临时设置
            tempSettings.uiSize = $global.uiSize.value
            tempSettings.menuMode = layoutConfig.menuMode
            tempSettings.showBreadcrumb = layoutConfig.showBreadcrumb
            settingDialog.value?.show()
            break
    }
}

// 确认按钮处理函数
function handleConfirm() {
    // 应用设置
    $global.uiSize.value = tempSettings.uiSize
    layoutConfig.updateConfig({
        menuMode: tempSettings.menuMode,
        showBreadcrumb: tempSettings.showBreadcrumb
    })
    // 关闭对话框
    settingDialog.value?.hide()
}
</script>

<style scoped lang="less">
.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
}

.settings-btn {
    color: #fff !important;
}

.settings-btn--light {
    color: #fff !important;
}

.settings-btn--dark {
    color: #333 !important;
}

:deep(.n-avatar) {
    background: #fff;
    color: #333;
}

.setting-form {
    padding: 8px;

    .setting-form-item {
        margin-bottom: 12px;
        
        :deep(.n-form-item-label) {
            font-weight: 500;
            font-size: 14px;
            padding-bottom: 4px;
        }

        &:last-child {
            margin-bottom: 0;
        }

        :deep(.n-form-item-blank) {
            min-height: unset;
            padding: 0;
        }

        :deep(.n-space) {
            margin: 0 !important;
        }
    }
}

.radio-content {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    
    .mb-icon {
        font-size: 16px;
    }
}

:deep(.n-radio-button) {
    min-width: 100px;
    
    .n-radio-button__state-border {
        box-shadow: none !important;
    }
}

:deep(.n-switch) {
    min-width: 60px;
}
</style> 