<template>
  <n-form ref="formRef" :model="model">
    <n-form-item path="age" label="用户名">
      <n-input v-model:value="model.username" @keydown.enter.prevent />
    </n-form-item>
    <n-form-item path="password" label="密码">
      <n-input
        v-model:value="model.password"
        type="password"
        @keydown.enter.prevent
      />
    </n-form-item>
    <n-form-item>
      <n-button round type="primary" @click="loginClick">
        登录
      </n-button>
    </n-form-item>
  </n-form>
</template>

<script setup>
  import router from '@/scripts/router'
  import { useUserStore } from '@/store/modules/userStore'
  import { reactive } from 'vue'
  const userStore = useUserStore()
  const model = reactive({
    username: '',
    password: ''
  })
  function loginClick(){
    userStore.login({ username: model.username, password: model.password }).then(token => {
      if(token){
        router.push({ path: '/home' })
      }
    })
  }
</script>