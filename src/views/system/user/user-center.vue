<template>
    <div class="user-center">
        <n-card title="个人信息" class="profile-card">
            <n-grid :cols="24" :x-gap="12">
                <n-grid-item :span="13">
                    <n-form
                        ref="dataForm"
                        :rules="rules"
                        :model="temp"
                        label-placement="left"
                        label-width="90"
                        :size="'small'"
                        class="profile-form"
                    >
                        <n-form-item label="头像" path="headPortrait">
                            <div class="avatar-upload">
                                <mb-upload-image v-model="temp.headPortrait">
                                    <template #default="{ preview }">
                                        <div class="avatar-wrapper">
                                            <n-avatar
                                                :src="preview || temp.headPortrait"
                                                :fallback-src="'/avatar-default.png'"
                                                :size="80"
                                                round
                                            />
                                            <div class="avatar-mask">
                                                <mb-icon icon="camera" />
                                                <span>更换头像</span>
                                            </div>
                                        </div>
                                    </template>
                                </mb-upload-image>
                            </div>
                        </n-form-item>

                        <n-divider>基本信息</n-divider>
                        
                        <n-form-item label="姓名/昵称" path="name">
                            <n-input
                                v-model:value="temp.name"
                                disabled
                                placeholder="用户名称"
                            >
                                <template #prefix>
                                    <mb-icon icon="user" />
                                </template>
                            </n-input>
                        </n-form-item>
                        
                        <n-form-item label="手机号码" path="phone">
                            <n-input
                                v-model:value="temp.phone"
                                maxlength="11"
                                placeholder="请输入手机号码"
                                autocomplete="new-password"
                            >
                                <template #prefix>
                                    <mb-icon icon="phone" />
                                </template>
                            </n-input>
                        </n-form-item>
                        
                        <n-divider>修改密码</n-divider>
                        
                        <n-form-item label="当前密码" path="password">
                            <n-input
                                v-model:value="temp.password"
                                type="password"
                                show-password-on="click"
                                placeholder="请输入当前密码"
                                autocomplete="new-password"
                            >
                                <template #prefix>
                                    <mb-icon icon="password" />
                                </template>
                            </n-input>
                        </n-form-item>
                        
                        <n-form-item label="新设密码" path="newPassword">
                            <n-input
                                v-model:value="temp.newPassword"
                                type="password"
                                show-password-on="click"
                                placeholder="请输入新密码"
                                autocomplete="new-password"
                            >
                                <template #prefix>
                                    <mb-icon icon="password" />
                                </template>
                            </n-input>
                        </n-form-item>
                        
                        <n-form-item label="确认密码" path="confirmPassword">
                            <n-input
                                v-model:value="temp.confirmPassword"
                                type="password"
                                show-password-on="click"
                                placeholder="请再次输入新密码"
                                autocomplete="new-password"
                            >
                                <template #prefix>
                                    <mb-icon icon="password" />
                                </template>
                            </n-input>
                        </n-form-item>
                        
                        <div class="form-actions">
                            <n-button
                                type="primary"
                                size="large"
                                round
                                @click="save"
                                style="min-width: 120px;"
                            >
                                <template #icon>
                                    <mb-icon icon="settings" />
                                </template>
                                保存修改
                            </n-button>
                        </div>
                    </n-form>
                </n-grid-item>
                
                <n-grid-item :span="11">
                    <div class="tips-section">
                        <n-alert
                            type="info"
                            title="温馨提示"
                            :bordered="false"
                            class="tip-card"
                        >
                            <template #icon>
                                <mb-icon icon="info" />
                            </template>
                            <p>• 头像支持 jpg、png、gif 格式，大小不超过 2M</p>
                            <p>• 手机号码用于接收系统通知和找回密码</p>
                            <p>• 密码长度至少 6 位，建议使用字母、数字和符号的组合</p>
                            <p>• 为了您的账号安全，修改密码后需要重新登录</p>
                        </n-alert>
                    </div>
                </n-grid-item>
            </n-grid>
        </n-card>
    </div>
</template>

<script setup>
import {ref, reactive, nextTick} from 'vue'
import {useUserStore} from "@/store/modules/userStore";
import MbIcon from "@/components/magic/basic/mb-icon.vue";

const userStore = useUserStore()

const temp = ref(getTemp())

let validatePass2 = (rule, value, callback) => {
    if (temp.value.newPassword) {
        if (value === '') {
            callback(new Error('请再次输入密码'));
        } else if (value !== temp.value.newPassword) {
            callback(new Error('两次输入密码不一致!'));
        } else {
            callback();
        }
    } else {
        callback();
    }
}
const rules = reactive({
    password: [{required: true, message: '请输入原密码', trigger: 'blur'}, {min: 6, message: '密码不少于6位'}],
    phone: [{min: 11, message: '请输入11位手机号', trigger: 'blur'}],
    newPassword: [{min: 6, message: '密码不少于6位'}],
    confirmPassword: [{min: 6, message: '密码不少于6位'}, {validator: validatePass2}],
})
const dataForm = ref()

function getTemp() {
    return {
        id: '',
        name: '',
        password: '',
        phone: '',
        headPortrait: '',
        newPassword: '',
        confirmPassword: ''
    }
}

function resetTemp() {
    temp.value = getTemp()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

function save() {
    dataForm.value.validate((errors) => {
        if (!errors) {
            $common.post('/system/user/center/update', temp.value).then(() => {
                $message.success('修改成功')
            })
        }
    })
}

$common.objAssign(temp.value, userStore.getInfo, ['password'])
</script>

<style scoped lang="less">
.user-center {
    max-width: 1000px;
    margin: 12px auto;
    
    .profile-card {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        
        :deep(.n-card-header) {
            padding: 10px 16px;
        }
        
        :deep(.n-card__content) {
            padding: 0 16px 16px;
        }
    }
    
    .profile-form {
        padding: 8px 0;
        
        .avatar-upload {
            display: flex;
            justify-content: center;
            margin-bottom: 12px;
            
            .avatar-wrapper {
                position: relative;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
                
                &:hover {
                    .avatar-mask {
                        opacity: 1;
                    }
                }
                
                .avatar-mask {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.5);
                    color: #fff;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    
                    .mb-icon {
                        font-size: 20px;
                        margin-bottom: 4px;
                    }
                    
                    span {
                        font-size: 12px;
                    }
                }
            }
        }
        
        :deep(.n-form-item) {
            margin-bottom: 12px;
        }
        
        :deep(.n-divider) {
            margin: 12px 0;
        }
        
        .form-actions {
            margin-top: 24px;
            text-align: center;
        }
    }
    
    .tips-section {
        padding: 8px 0;
        height: 100%;
        display: flex;
        
        .tip-card {
            flex: 1;
            background: rgba(var(--primary-color-rgb), 0.05);
            white-space: nowrap;
            overflow: visible;
            
            :deep(.n-alert-body) {
                white-space: normal;
            }
            
            :deep(.n-alert-header) {
                font-size: 15px;
                font-weight: 500;
            }
            
            p {
                margin: 6px 0;
                line-height: 1.6;
                font-size: 14px;
                color: #666;
            }
        }
    }
}
</style>
