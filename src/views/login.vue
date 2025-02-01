<template>
    <div class="login-container">
        <div class="login-content">
            <div class="login-left">
                <div class="background-shapes">
                    <div class="shape shape-1"></div>
                    <div class="shape shape-2"></div>
                    <div class="shape shape-3"></div>
                    <div class="shape shape-4"></div>
                </div>
                <div class="brand">
                    <div class="brand-title">「{{ $global.title }}」</div>
                    <div class="brand-desc">"加速您的开发世界，轻松启动您的创意"</div>
                </div>
            </div>
            <div class="login-right">
                <div class="login-form-wrapper">
                    <h2 class="welcome">欢迎回来</h2>
                    <n-form ref="formRef" :model="formData" class="login-form">
                        <n-form-item path="phone" :rule="phoneRule">
                            <n-input
                                v-model:value="formData.phone"
                                placeholder="请输入手机号"
                                @keyup.enter="handleSubmit"
                            >
                                <template #prefix>
                                    <div class="input-icon">
                                        <n-icon><PersonOutline/></n-icon>
                                    </div>
                                </template>
                            </n-input>
                        </n-form-item>
                        
                        <n-form-item path="password" :rule="passwordRule">
                            <n-input
                                v-model:value="formData.password"
                                type="password"
                                placeholder="请输入密码"
                                @keyup.enter="handleSubmit"
                            >
                                <template #prefix>
                                    <div class="input-icon">
                                        <n-icon><LockClosedOutline/></n-icon>
                                    </div>
                                </template>
                            </n-input>
                        </n-form-item>

                        <n-form-item v-if="codeEnable == 'true'" path="code">
                            <div class="verify-code-wrapper">
                                <!-- 验证码相关代码保持不变 -->
                            </div>
                        </n-form-item>

                        <div class="form-footer">
                            <n-button
                                type="primary"
                                size="large"
                                block
                                :loading="loading"
                                @click="handleSubmit"
                                class="submit-btn"
                            >
                                {{ loading ? '登录中...' : '登录' }}
                            </n-button>
                        </div>
                    </n-form>
                </div>
            </div>
        </div>

        <!-- 租户选择弹窗 -->
        <n-modal v-model:show="showTenantSelect" title="选择租户" :maskClosable="false">
            <n-list>
                <n-list-item v-for="tenant in tenantList" :key="tenant.id">
                    <n-thing>
                        <template #header>
                            {{ tenant.name }}
                        </template>
                        <template #description>
                            <n-button type="primary" size="small" @click="selectTenant(tenant)">
                                进入系统
                            </n-button>
                        </template>
                    </n-thing>
                </n-list-item>
            </n-list>
        </n-modal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/userStore'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const showTenantSelect = ref(false)
const tenantList = ref([])

const formData = ref({
    phone: '',
    password: '',
    code: '',
    uuid: ''
})

// 手机号验证规则
const phoneRule = {
    required: true,
    message: '请输入手机号',
    trigger: 'blur',
    pattern: /^1[3-9]\d{9}$/
}

// 密码验证规则
const passwordRule = {
    required: true,
    message: '请输入密码',
    trigger: 'blur'
}

// 获取当前域名对应的租户
async function getCurrentTenant() {
    try {
        const domain = window.location.hostname
        const res = await $common.get(`/system/tenant/getByDomain/${domain}`)
        return res.data
    } catch (error) {
        return null
    }
}

// 获取用户可访问的租户列表
async function getUserTenants() {
    const res = await $common.get('/system/tenant/user/list')
    tenantList.value = res.data
    if (tenantList.value.length === 1) {
        // 只有一个租户时自动选择
        await selectTenant(tenantList.value[0])
    } else {
        showTenantSelect.value = true
    }
}

// 选择租户
async function selectTenant(tenant) {
    try {
        await userStore.setCurrentTenant(tenant)
        showTenantSelect.value = false
        router.push('/')
    } catch (error) {
        $message.error(error.message)
    }
}

// 登录提交
async function handleSubmit() {
    try {
        loading.value = true
        await formRef.value?.validate()
        
        // 执行登录
        await userStore.login({
            phone: formData.value.phone,
            password: formData.value.password,
            code: formData.value.code,
            uuid: formData.value.uuid
        })
        
        // 获取用户可访问的租户列表
        await getUserTenants()
        
    } catch (error) {
        $message.error(error.message)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped lang="less">
.login-container {
    min-height: 100vh;
    background-color: #f7f9fc;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-content {
    width: 1000px;
    height: 600px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1);
    display: flex;
    overflow: hidden;
}

.login-left {
    flex: 1;
    background: #2468f2;
    padding: 48px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.background-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    
    .shape {
        position: absolute;
        background: linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
        border-radius: 50%;
        
        &-1 {
            width: 500px;
            height: 500px;
            top: -250px;
            right: -100px;
            background: linear-gradient(135deg, #4d89f7 0%, #2468f2 100%);
            animation: float 15s infinite;
        }
        
        &-2 {
            width: 300px;
            height: 300px;
            bottom: -150px;
            right: 50%;
            background: linear-gradient(135deg, #2468f2 0%, #1b4fc6 100%);
            animation: float 20s infinite;
            animation-delay: -2s;
        }
        
        &-3 {
            width: 200px;
            height: 200px;
            top: 40%;
            left: -100px;
            background: linear-gradient(135deg, #4d89f7 0%, #2468f2 100%);
            animation: float 18s infinite;
            animation-delay: -5s;
        }
        
        &-4 {
            width: 400px;
            height: 400px;
            bottom: -200px;
            right: -200px;
            background: linear-gradient(135deg, #2468f2 0%, #1b4fc6 100%);
            animation: float 25s infinite;
            animation-delay: -8s;
        }
    }
}

.brand {
    position: relative;
    z-index: 1;
    text-align: center;
    margin-top: 15vh;
    
    .brand-title {
        font-size: 3rem;
        font-weight: 600;
        color: #fff;
        margin-bottom: 24px;
        text-shadow: 0 2px 8px rgba(0,0,0,0.15);
        animation: fadeInDown 0.8s;
    }
    
    .brand-desc {
        font-size: 1.25rem;
        color: rgba(255, 255, 255, 0.95);
        line-height: 1.6;
        text-shadow: 0 1px 4px rgba(0,0,0,0.1);
        animation: fadeInUp 0.8s;
    }
}

.login-right {
    width: 400px;
    padding: 48px 40px;
    display: flex;
    align-items: center;
}

.login-form-wrapper {
    width: 100%;
}

.welcome {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 32px;
}

.login-form {
    :deep(.n-form-item) {
        margin-bottom: 12px !important;
    }
    
    :deep(.n-input) {
        height: 40px;
        
        .n-input__prefix {
            margin: 0;
            width: 40px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
        }
        
        .n-input__input-el {
            font-size: 14px;
            padding-left: 0;
        }
    }
}

.input-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
    font-size: 1.25rem;
}

.verify-code-wrapper {
    display: flex;
    gap: 8px;
    
    .n-input {
        flex: 1;
    }
    
    .code-img {
        height: 40px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
            opacity: 0.8;
        }
    }
}

.form-footer {
    margin-top: 20px;
    
    .submit-btn {
        height: 40px;
        font-size: 15px;
        font-weight: 500;
        background-image: linear-gradient(to right, #2468f2, #4d89f7);
        border: none;
        border-radius: 6px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: linear-gradient(to right, #4d89f7, #2468f2);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(36, 104, 242, 0.25);
            
            &::before {
                opacity: 1;
            }
        }
        
        &:active {
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(36, 104, 242, 0.2);
        }
        
        :deep(.n-button__content) {
            position: relative;
            z-index: 1;
            letter-spacing: 2px;
            font-weight: 500;
        }
    }
}

@keyframes float {
    0%, 100% {
        transform: translate(0, 0);
    }
    25% {
        transform: translate(10px, -10px);
    }
    50% {
        transform: translate(-5px, 15px);
    }
    75% {
        transform: translate(-15px, -5px);
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 1024px) {
    .login-content {
        width: 90%;
        height: auto;
        flex-direction: column;
    }
    
    .login-left {
        padding: 36px;
        
        .brand {
            margin-top: 10vh;
            
            .brand-title {
                font-size: 2.5rem;
            }
            
            .brand-desc {
                font-size: 1.125rem;
            }
        }
    }
    
    .login-right {
        width: 100%;
        padding: 36px;
    }
}

@media (max-width: 480px) {
    .login-container {
        padding: 0;
    }
    
    .login-content {
        width: 100%;
        min-height: 100vh;
        border-radius: 0;
    }
    
    .login-left {
        padding: 24px;
        
        .brand {
            margin-top: 5vh;
            
            .brand-title {
                font-size: 2rem;
            }
            
            .brand-desc {
                font-size: 1rem;
            }
        }
    }
    
    .login-right {
        padding: 24px;
    }
}
</style>
