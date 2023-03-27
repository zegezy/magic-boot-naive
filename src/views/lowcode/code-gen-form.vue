<template>
  <el-form ref="dataForm" :model="genInfo" :rules="genInfoRules" label-position="right" label-width="120px">
    <el-tabs v-model="activeName">
      <el-tab-pane label="表信息" name="basic">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="数据源" prop="datasource">
              <mb-select v-model="genInfo.datasource" url="/system/code/gen/database" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="表名" prop="tableName">
              <mb-select v-model="genInfo.tableName" :options="tables" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="描述" prop="tableComment">
              <el-input v-model="genInfo.tableComment" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="field">
        <mb-editor-table v-model="genInfo.columns" :cols="cols" :show-no="false" :operation="false" :toolbar="false" />
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="gen">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="生成模板" prop="info.template">
              <mb-select v-model="genInfo.info.template" :options="[{ label: '单表（增删改查）', value: 'singleTable' }]" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="info.moduleName">
              <template #label>
                模块名称
                <el-tooltip content="第一级分组名称，例如：系统功能" placement="top">
                  <el-icon><ElIconQuestionFilled /></el-icon>
                </el-tooltip>
              </template>
              <el-input v-model="genInfo.info.moduleName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="info.modulePath">
              <template #label>
                模块路径
                <el-tooltip content="第一级分组的路径，例如：/system" placement="top">
                  <el-icon><ElIconQuestionFilled /></el-icon>
                </el-tooltip>
              </template>
              <el-input v-model="genInfo.info.modulePath"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="info.businessName">
              <template #label>
                功能名称
                <el-tooltip content="第二级分组名称，例如：菜单管理" placement="top">
                  <el-icon><ElIconQuestionFilled /></el-icon>
                </el-tooltip>
              </template>
              <el-input v-model="genInfo.info.businessName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="info.businessPath">
              <template #label>
                功能路径
                <el-tooltip content="第二级分组路径，例如：/menu" placement="top">
                  <el-icon><ElIconQuestionFilled /></el-icon>
                </el-tooltip>
              </template>
              <el-input v-model="genInfo.info.businessPath"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级菜单" prop="pid">
              <el-tree-select v-model="genInfo.info.pid" :data="menuTree" :key="genInfo.info.pid" style="width: 100%" check-strictly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                代码生成
                <el-tooltip content="接口和页面直接生成到magic-api的api,component" placement="top">
                  <el-icon><ElIconQuestionFilled /></el-icon>
                </el-tooltip>
              </template>
              <el-button type="primary" @click="executeGen()" style="margin-bottom: 10px">代码生成</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-form>
</template>

<script setup>
import {reactive, ref, watch, getCurrentInstance, onMounted, nextTick} from 'vue'
  import genCode from '@/scripts/gen/gen-mb-list.js'
  import { ElMessageBox } from 'element-plus'
  const { proxy } = getCurrentInstance()
  const dataForm = ref()
  const tables = ref([])
  const emit = defineEmits(['reload'])
  const menuTree = ref()
  proxy.$get('/system/menu/tree').then(res => {
    menuTree.value = [{
      label: '根节点',
      value: '0',
      children: proxy.$treeTable.genTree(res.data.list)
    }]
  })
  var validatePath = (rule, value, callback) => {
    if(!value.startsWith('/')){
      callback(new Error('请以“/”开头'));
    }else if(value.endsWith('/')){
      callback(new Error('不能以“/”结尾'));
    }else{
      callback();
    }
  }
  const genInfoRules = reactive({
    tableName: [{ required: true, message: '请选择表', trigger: 'change' }],
    tableComment: [{ required: true, message: '请输入描述', trigger: 'change' }],
    'info.template': [{ required: true, message: '请选择模板', trigger: 'change' }],
    'info.moduleName': [{ required: true, message: '请输入模块名称', trigger: 'change' }],
    'info.modulePath': [{ required: true, message: '请输入模块路径', trigger: 'change' },  { validator: validatePath }],
    'info.businessName': [{ required: true, message: '请输入功能名称', trigger: 'change' }],
    'info.businessPath': [{ required: true, message: '请输入功能路径', trigger: 'change' },  { validator: validatePath }]
  })
  const genInfo = ref({
    datasource: '',
    tableName: '',
    tableComment: '',
    info: {
      moduleName: '',
      modulePath: '',
      businessName: '',
      businessPath: '',
      template: 'singleTable',
      pid: ''
    },
    columns: []
  })

  function datasourceChange(){
    proxy.$get('/system/code/gen/tables?datasource='+genInfo.value.datasource).then(res => {
      tables.value = res.data
    })
  }

  function formInitClearValidate(){
    genInfo.value.tableComment = ''
    genInfo.value.info.moduleName = '';
    genInfo.value.info.modulePath = '';
    genInfo.value.info.businessName = '';
    genInfo.value.info.businessPath = '';
    genInfo.value.info.template = 'singleTable';
    genInfo.value.info.pid = '';
    genInfo.value.columns = []
    setTimeout(() => {
      dataForm.value.clearValidate()
    },1)
  }

  function watchDatasource(){
    watch(() => genInfo.value.datasource, () => {
      datasourceChange()
      genInfo.value.tableName = ''
    })
  }

  function watchTableName(){
    datasourceChange()
    watch(() => genInfo.value.tableName, (value) => {
      if(!value){
        formInitClearValidate()
        return
      }
      genInfo.value.tableComment = tables.value.filter(it => it.value == value)[0].label.replace(value, '').replace('(','').replace(')','')
      genInfo.value.columns = []
      proxy.$get('/system/code/gen/columns?datasource='+genInfo.value.datasource, { tableName: value }).then(res => {
        var columns = res.data.columns
        var primary = res.data.primary
        columns.forEach(it => {
          genInfo.value.columns.push({
            columnName: it.columnName.replace(/\_(\w)/g, (all, letter) => letter.toUpperCase()),
            columnComment: it.columnComment,
            columnType: it.columnType,
            component: `component: 'input'`,
            where: '=',
            save: true,
            query: true,
            list: true,
            required: it.required == 1
          })
        })
      })
    })
  }

  function watchInfo(){
    watchTableName()
    watchDatasource()
  }

  const activeName = ref('basic')
  const formData = reactive({
    groupName: ''
  })

  const cols = reactive([{
    field: 'columnName',
    label: '列名'
  }, {
    field: 'columnComment',
    label: '列说明',
    component: 'input'
  }, {
    field: 'columnType',
    label: '字段类型'
  }, {
    field: 'save',
    label: '保存',
    component: 'switch',
    width: '80px'
  }, {
    field: 'list',
    label: '列表',
    component: 'switch',
    width: '80px'
  }, {
    field: 'query',
    label: '查询',
    component: 'switch',
    width: '80px'
  }, {
    field: 'where',
    label: '匹配方式',
    component: 'select',
    props: {
      options: [{
        label: '=',
        value: '='
      },{
        label: '!=',
        value: '!='
      },{
        label: '<',
        value: '<'
      },{
        label: '<=',
        value: '<='
      },{
        label: '>',
        value: '>'
      },{
        label: '>=',
        value: '>='
      },{
        label: 'in',
        value: 'in'
      },{
        label: 'like',
        value: 'like'
      }]
    }
  }, {
    field: 'required',
    label: '必填',
    component: 'switch',
    width: '80px'
  }, {
    field: 'component',
    label: '控件类型',
    component: 'select',
    props: {
      options: [{
        label: '单行文本框',
        value: `component: 'input'`
      },{
        label: '多行文本框',
        value: `component: 'input',
                    props: {
                        type: 'textarea'
                    }
      `
      },{
        label: '单选下拉框',
        value: `component: 'select'`
      },{
        label: '多选下拉框',
        value: `component: 'select',
                    props: {
                        multiple: true
                    }
      `
      },{
        label: '单选框',
        value: `component: 'radio-group'`
      },{
        label: '复选框',
        value: `component: 'checkbox-group'`
      },{
        label: '日期选择',
        value: `component: 'date'`
      },{
        label: '日期时间',
        value: `component: 'date',
                    props: {
                        type: 'datetime',
                        format: 'YYYY-MM-DD HH:mm:ss'
                    }
      `
      },{
        label: '图片上传',
        value: `component: 'upload-image'`
      },{
        label: '文件上传',
        value: `component: 'upload-file'`
      },{
        label: '多图片上传',
        value: `component: 'upload-image',
                    props: {
                        multiple: true
                    }
      `
      },{
        label: '多文件上传',
        value: `component: 'upload-file',
                    props: {
                        multiple: true
                    }
      `
      }]
    }
  }, {
    component: 'select',
    field: 'dictType',
    label: '字典类型',
    props: {
      url: '/system/dict/all',
      showValue: true
    }
  }])

  function executeGen(){
    dataForm.value.validate((valid) => {
      if (valid) {
        ElMessageBox.confirm('此操作会生成代码并覆盖, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var formData = {...genInfo.value}
          formData.info = JSON.stringify(genInfo.value.info)
          formData.columns = JSON.stringify(genInfo.value.columns)
          formData.componentScript = genCode(genInfo.value.info.modulePath+genInfo.value.info.businessPath, genInfo.value.columns)
          formData.datasource = genInfo.value.datasource
          proxy.$post('/system/code/gen/execute', formData).then((res) => {
            if(res.data == 1){
              proxy.$notify({
                title: '成功',
                message: '生成成功',
                type: 'success',
                duration: 2000
              })
            }
          })
        })
      }else{
        proxy.$message.error('表单校验未通过，请重新检查提交内容')
      }
    })
  }

  function save(d){
    dataForm.value.validate((valid) => {
      if (valid) {
        var formData = {...genInfo.value}
        formData.info = JSON.stringify(genInfo.value.info)
        formData.columns = JSON.stringify(genInfo.value.columns)
        d.loading()
        proxy.$post('/system/code/gen/save', formData).then(() => {
          d.hideLoading()
          proxy.$notify({
            title: '成功',
            message: d.title + '成功',
            type: 'success',
            duration: 2000
          })
          emit('reload')
          d.hide()
        }).catch(() => d.hideLoading())
      }else{
        proxy.$message.error('表单校验未通过，请重新检查提交内容')
      }
    })
  }

  function getDetail(id){
    proxy.$get('/system/code/gen/get', { id: id }).then(res => {
      var formData = {...res.data}
      formData.datasource = formData.datasource || ''
      formData.info = JSON.parse(formData.info)
      formData.columns = JSON.parse(formData.columns)
      genInfo.value = formData
      watchInfo()
    })
  }

  defineExpose({ save, getDetail, watchInfo })

</script>
