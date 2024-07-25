<template>
    <div class="user-center">
        <n-form ref="dataForm" :rules="rules" :model="temp" label-placement="left" label-width="80px">
            <n-form-item label="头像" path="headPortrait">
                <mb-upload-image v-model="temp.headPortrait"/>
            </n-form-item>
            <n-form-item label="姓名/昵称" path="name">
                <n-input v-model:value="temp.name" disabled/>
            </n-form-item>
            <n-form-item label="手机号码" path="phone">
                <n-input v-model:value="temp.phone" maxlength="11" autocomplete="new-password"/>
            </n-form-item>
            <n-form-item label="当前密码" path="password">
                <n-input v-model:value="temp.password" type="password" autocomplete="new-password"/>
            </n-form-item>
            <n-form-item label="新设密码" path="newPassword">
                <n-input v-model:value="temp.newPassword" type="password" autocomplete="new-password"/>
            </n-form-item>
            <n-form-item label="确认密码" path="confirmPassword">
                <n-input v-model:value="temp.confirmPassword" type="password" autocomplete="new-password"/>
            </n-form-item>
            <n-button type="primary" size="large" block round @click="save">
                <m-icon style="margin-right: 4px" icon="SaveSharp" />
                保存信息
            </n-button>
        </n-form>
    </div>
</template>

<script setup>
import {ref, reactive, nextTick} from 'vue'
import {useUserStore} from "@/store/modules/userStore";

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

<style scoped>
.user-center {
    width: 1000px;
    margin: 0 auto;
}
</style>
