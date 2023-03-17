<template>
  <div>
    <n-grid :x-gap="12">
      <n-grid-item :span="15">
      <div class="left-bar">
        <div class="logo-content">
          <p class="text-6xl mt-0 mb-0 italic font-black text-white">「Magic Boot」</p>
          <p class="text-base text-gray-50">"加速您的开发世界，轻松启动您的创意"</p>
        </div>
      </div>
      </n-grid-item>
      <n-grid-item :span="9">
        <div class="login-form">
          <p class="text-4xl">欢迎回来</p>
          <n-form ref="formRef" :model="model">
            <n-form-item path="age" label="用户名">
              <n-input v-model:value="model.username" placeholder="请输入用户名" @keydown.enter.prevent/>
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                  v-model:value="model.password"
                  type="password"
                  @keydown.enter.prevent
                  placeholder="请输入密码"
              />
            </n-form-item>
            <n-form-item>
              <n-button round block size="large" type="info" @click="loginClick">
                登录
              </n-button>
            </n-form-item>
          </n-form>
        </div>

      </n-grid-item>
    </n-grid>

  </div>
</template>

<script setup>
import router from '@/scripts/router'
import {useUserStore} from '@/store/modules/userStore'
import {reactive} from 'vue'

const userStore = useUserStore()
const model = reactive({
  username: '',
  password: ''
})

function loginClick() {
  userStore.login({username: model.username, password: model.password}).then(token => {
    if (token) {
      router.push({path: '/home'})
    }
  })
}
</script>

<style scoped>
.login-form{
  margin-top: 10vh;
  padding: 25px;
}
.left-bar{
  background-color: #3f7ee8;
  min-height: 100vh;
}
.logo-content{
  text-align: center;
  width: 500px;
  margin:0 auto;
  padding-top: 30vh;
}
</style>