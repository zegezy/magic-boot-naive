<template>
    <n-form :size="$global.uiSize.value" ref="dataForm" :rules="rules" :model="temp" label-placement="left" label-width="90px">
        <n-grid :cols="24" :x-gap="24">
            <n-gi :span="12">
                <n-form-item label="登录名称" path="username">
                    <n-input v-model:value="temp.username" autocomplete="new-password"/>
                </n-form-item>
            </n-gi>
            <n-gi :span="12">
                <n-form-item label="密码" path="password">
                    <n-input v-model:value="temp.password" type="password" autocomplete="new-password"/>
                </n-form-item>
            </n-gi>
        </n-grid>
        <n-grid :cols="24" :x-gap="24">
            <n-gi :span="12">
                <n-form-item label="姓名/昵称" path="name">
                    <n-input v-model:value="temp.name" autocomplete="new-password"/>
                </n-form-item>
            </n-gi>
            <n-gi :span="12">
                <n-form-item label="手机号" path="phone">
                    <n-input v-model:value="temp.phone"/>
                </n-form-item>
            </n-gi>
        </n-grid>
        <n-grid :cols="24" :x-gap="24">
            <n-gi :span="12">
                <n-form-item label="组织机构" path="officeId">
                    <mb-tree-select url="/system/user/offices" v-model="temp.officeId" :key="temp.officeId"
                                    placeholder="请选择组织机构"/>
                </n-form-item>
            </n-gi>
            <n-gi :span="12">
                <n-form-item label="选择角色" path="roles">
                    <mb-select v-model="temp.roles" url="/system/role/all" placeholder="请选择角色" multiple/>
                </n-form-item>
            </n-gi>
        </n-grid>
        <n-form-item label="登录状态" path="isLogin" v-if="temp.id != '1'">
            <n-radio-group v-model:value="temp.isLogin">
                <n-radio-button label="有效" :value="0" :key="0"/>
                <n-radio-button label="锁定" :value="1" :key="1"/>
            </n-radio-group>
        </n-form-item>
    </n-form>
</template>

<script setup>

import {ref, reactive, nextTick} from 'vue'
import common from '@/scripts/common'

const emit = defineEmits(['reload-table'])

const rules = reactive({
    name: {required: true, message: '请输入姓名/昵称', trigger: 'change'},
    username: {required: true, message: '请输入登录名称', trigger: 'change'},
    roles: {required: true, message: '请选择角色', trigger: 'blur'},
    officeId: {required: true, message: '请选择组织机构', trigger: 'change'}
})
const temp = ref(getTemp())
const dataForm = ref()

function getTemp() {
    return {
        id: '',
        name: '',
        username: '',
        password: '',
        phone: '',
        isLogin: 0,
        roles: null,
        officeId: null
    }
}

function resetTemp() {
    rules.password = [{required: true, message: '请输入密码', trigger: 'change'}]
    temp.value = getTemp()
    nextTick(() => {
        nextTick(() => {
            dataForm.value.restoreValidation()
        })
    })
}

function save(d) {
    dataForm.value.validate((errors) => {
        if (!errors) {
            d.loading()
            common.$post('/system/user/save', temp.value).then(() => {
                d.hideLoading()
                $message.success(d.title + '成功')
                emit('reload-table')
            }).catch(() => d.hideLoading())
        }
    })
}

function getInfo(row) {
    delete rules.password
    for (let t in temp.value) {
        if (t !== 'roles') {
            temp.value[t] = row[t]
        }
    }
    common.$get('/system/user/roles', {userId: temp.value.id}).then((res) => {
        temp.value.roles = res.data.join(',')
    })
}

defineExpose({save, getInfo, resetTemp})

</script>
