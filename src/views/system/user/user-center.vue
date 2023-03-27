<template>
  <div class="app-container">
    <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 800px">
      <el-form-item label="头像" prop="headPortrait">
        <mb-upload-image v-model="temp.headPortrait" />
      </el-form-item>
      <el-form-item label="姓名/昵称" prop="name">
        <el-input v-model="temp.name" disabled />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model.integer="temp.phone" maxlength="11" autocomplete="new-password" />
      </el-form-item>
      <el-form-item label="原密码" prop="password">
        <el-input v-model="temp.password" type="password" autocomplete="new-password" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="temp.newPassword" type="password" autocomplete="new-password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="temp.confirmPassword" type="password" autocomplete="new-password" />
      </el-form-item>
      <el-form-item>
        <el-button class="filter-item" type="primary" @click="save">
          提交
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>

import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
const temp = ref(getTemp())
const { proxy } = getCurrentInstance()

var validatePass2 = (rule, value, callback) => {
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
    dataForm.value.clearValidate()
  })
}

function save() {
  dataForm.value.validate((valid) => {
    if (valid) {
      proxy.$post('/system/user/center/update', temp.value).then(() => {
        proxy.$notify({
          title: '成功',
          message: '修改成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  })
}

proxy.$common.objAssign(temp.value, proxy.$global.user.info, ['password'])
</script>
