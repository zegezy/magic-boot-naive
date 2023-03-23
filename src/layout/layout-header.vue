<template>
  <div class="p-4">
    <div class="header">
      <div style="width: 90%">
        <div>
          <n-breadcrumb>
            <n-breadcrumb-item>
              首页
            </n-breadcrumb-item>
            <n-breadcrumb-item>
              {{$router.currentRoute.value.meta.title}}
            </n-breadcrumb-item>
          </n-breadcrumb>
        </div>
      </div>
      <div>
        <n-avatar
            round
            :size="42"
            src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
        />
      </div>
      <div>
        <n-button text style="font-size: 20px;text-align: center">
          <n-icon>
            <SettingsOutline/>
          </n-icon>
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {SettingsOutline} from "@vicons/ionicons5"
import {useRouter} from "vue-router";

const router = useRouter();

console.log(router)
</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
</style>
