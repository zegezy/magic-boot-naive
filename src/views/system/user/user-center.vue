<template>
  <n-form ref="dataForm" :rules="rules" :model="temp" label-placement="left" label-width="80px" style="width: 800px">
    <n-form-item label="头像" path="headPortrait">
      <mb-upload-image v-model="temp.headPortrait" />
    </n-form-item>
    <n-form-item label="姓名/昵称" path="name">
      <n-input v-model:value="temp.name" disabled />
    </n-form-item>
    <n-form-item label="手机号" path="phone">
      <n-input v-model:value="temp.phone" maxlength="11" autocomplete="new-password" />
    </n-form-item>
    <n-form-item label="原密码" path="password">
      <n-input v-model:value="temp.password" type="password" autocomplete="new-password" />
    </n-form-item>
    <n-form-item label="新密码" path="newPassword">
      <n-input v-model:value="temp.newPassword" type="password" autocomplete="new-password" />
    </n-form-item>
    <n-form-item label="确认密码" path="confirmPassword">
      <n-input v-model:value="temp.confirmPassword" type="password" autocomplete="new-password" />
    </n-form-item>
    <n-form-item label=" ">
      <n-button type="primary" @click="save">
        提交
      </n-button>
    </n-form-item>
  </n-form>
</template>

<script setup>

import { ref, reactive, nextTick } from 'vue'
import common from '@/scripts/common'
import { useUserStore } from "@/store/modules/userStore";
const userStore = useUserStore()

const temp = ref(getTemp())

let validatePass2 = (rule, value, callback) => {
  if(temp.value.newPassword){
    if (value === '') {
      callback(new Error('请再次输入密码'));
    } else if (value !== temp.value.newPassword) {
      callback(new Error('两次输入密码不一致!'));
    } else {
      callback();
    }
  }else{
    callback();
  }
}
const rules = reactive({
  password: [{ required: true, message: '请输入原密码', trigger: 'change' }, { min: 6, message: '密码不少于6位' }],
  phone: [{ min: 11, message: '请输入11位手机号', trigger: 'change' }],
  newPassword: [{ min: 6, message: '密码不少于6位' }],
  confirmPassword: [{ min: 6, message: '密码不少于6位' }, { validator: validatePass2 }],
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
      common.$post('/system/user/center/update', temp.value).then(() => {
        $message.success('修改成功')
      })
    }
  })
}

common.objAssign(temp.value, userStore.getInfo, ['password'])
</script>
