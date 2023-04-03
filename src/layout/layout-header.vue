<template>
    <div class="p-4">
        <div class="header">
            <div style="width: 95%">
                <div>
                    <n-breadcrumb>
                        <n-breadcrumb-item>
                            首页
                        </n-breadcrumb-item>
                        <n-breadcrumb-item>
                            {{ $router.currentRoute.value.meta.title }}
                        </n-breadcrumb-item>
                    </n-breadcrumb>
                </div>
            </div>
            <div>
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
                    {{ userStore.getInfo.name.substring(0, 1) }}
                </n-avatar>
            </div>
            <div>
                <n-dropdown :options="options" @select="handleSelect">
                    <n-button text style="font-size: 20px;text-align: center">
                        <n-icon>
                            <SettingsOutline/>
                        </n-icon>
                    </n-button>
                </n-dropdown>
            </div>
        </div>
    </div>
</template>

<script setup>
import {SettingsOutline} from "@vicons/ionicons5"
import {ref} from 'vue'
import {useUserStore} from "@/store/modules/userStore";
import router from '@/scripts/router'

const userStore = useUserStore()

const options = ref([
    {
        label: "个人中心",
        key: "userCenter",
    },
    {
        label: "退出",
        key: "logout",
    }
])

function handleSelect(key) {
    switch (key) {
        case 'logout':
            userStore.logout()
            break;
        case 'userCenter':
            router.push({
                path: '/user-center'
            })
            break;
    }
}

</script>

<style scoped lang="less">
.header {
    display: flex;
    justify-content: space-around;
    align-items: center;
}
</style>
