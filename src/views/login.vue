<template>
    <div>
        <n-grid :x-gap="12">
            <n-grid-item :span="15">
                <div class="left-bar">
                    <div class="logo-content">
                        <p class="text-6xl mt-0 mb-0 italic font-black text-white">「{{ $global.title }}」</p>
                        <p class="text-base text-gray-50">"加速您的开发世界，轻松启动您的创意"</p>
                    </div>
                </div>
            </n-grid-item>
            <n-grid-item :span="9">
                <div class="login-form">
                    <p class="text-4xl">欢迎回来</p>
                    <n-form ref="formRef" :model="loginForm">
                        <n-form-item path="age" label="用户名">
                            <n-input v-model:value="loginForm.username" @keyup.enter.native="handleLogin"
                                     placeholder="请输入用户名"/>
                        </n-form-item>
                        <n-form-item path="password" label="密码">
                            <n-input
                                v-model:value="loginForm.password"
                                type="password"
                                @keyup.enter.native="handleLogin"
                                placeholder="请输入密码"
                            />
                        </n-form-item>
                        <n-form-item path="code" label="验证码" v-if="codeEnable == 'true'">
                            <n-input
                                v-model:value="loginForm.code"
                                @keyup.enter.native="handleLogin"
                                placeholder="请输入验证码"
                            />
                            <img class="code-img" :src="codeImg" @click="refreshCode">
                        </n-form-item>
                        <n-form-item>
                            <n-button round block size="large" type="info" :loading="loading" @click="handleLogin">
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
import {reactive, ref, getCurrentInstance} from 'vue'
const app = getCurrentInstance().appContext.app

const userStore = useUserStore()
const codeImg = ref()
const loginForm = reactive({
    username: '',
    password: '',
    code: ''
})
const loading = ref(false)
const codeEnable = ref()

function getCodeEnable() {
    $common.get('/system/config/getCodeEnable').then(res => {
        codeEnable.value = res.data
    })
}

getCodeEnable()

function refreshCode() {
    $common.get('/system/security/verification/code').then(res => {
        codeImg.value = 'data:image/png;base64,' + res.data.img
        loginForm.uuid = res.data.uuid
    })
}

refreshCode()

function handleLogin() {
    if (!loginForm.username) {
        $message.warning('请输入用户名')
        return
    } else if (!loginForm.password) {
        $message.warning('请输入密码')
        return
    } else {
        loading.value = true
        userStore.login(loginForm, app).then(token => {
            if (token) {
                router.push({path: '/home'})
            } else {
                loading.value = false
            }
        }).catch(() => {
            refreshCode()
            loading.value = false
        })
    }
}
</script>

<style scoped>
.login-form {
    margin-top: 10vh;
    padding: 25px;
}

.left-bar {
    background-color: #3f7ee8;
    min-height: 100vh;
}

.logo-content {
    text-align: center;
    width: 500px;
    margin: 0 auto;
    padding-top: 30vh;
}
</style>
