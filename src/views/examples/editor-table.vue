<template>
    <div style="padding: 50px;height: 500px">
        <n-button type="primary" @click="getData" style="margin-bottom: 10px">获取数据</n-button>
        <mb-editor-table v-model="tableDatas" :cols="cols" :show-no="false" :operation="false"/>
    </div>
</template>

<script setup>
import {h, reactive, ref} from 'vue'
import * as icons from "@vicons/ionicons5";
import {NIcon} from "naive-ui";

// const tableDatas = ref([{"columnName":"headPortrait","columnComment":"头像","columnType":"varchar(1000)"},{"columnName":"isLogin","columnComment":"禁止登录：0未禁用，1已禁用","columnType":"int"},{"columnName":"name","columnComment":"姓名/昵称","columnType":"varchar(255)"},{"columnName":"officeId","columnComment":"组织机构id","columnType":"varchar(36)"},{"columnName":"password","columnComment":"密码","columnType":"varchar(255)"},{"columnName":"phone","columnComment":"手机号","columnType":"varchar(255)"},{"columnName":"sort","columnComment":"排序","columnType":"int"},{"columnName":"status","columnComment":"状态","columnType":"char(1)"},{"columnName":"username","columnComment":"登录名","columnType":"varchar(255)"}])
const  tableDatas = ref([])
//
// $common.get('/system/code/gen/columns', {tableName: 'sys_user'}).then(res => {
//     var columns = res.data.columns
//     var primary = res.data.primary
//     columns.forEach(it => {
//         tableDatas.value.push({
//             columnName: it.columnName.replace(/\_(\w)/g, (all, letter) => letter.toUpperCase()),
//             columnComment: it.columnComment,
//             columnType: it.columnType
//         })
//     })
// })

// const cols = reactive([{
//     field: 'columnName',
//     label: '列名'
// }, {
//     field: 'columnComment',
//     label: '列说明',
//     component: 'input',
//     alwaysEdit: true
// }, {
//     field: 'columnType',
//     label: '字段类型'
// }, {
//     field: 'save',
//     label: '保存',
//     component: 'switch',
//     width: '80px',
//     edit: (row) => {
//         return row.columnComment == '1'
//     }
// }, {
//     field: 'list',
//     label: '列表',
//     component: 'switch',
//     width: '80px'
// }, {
//     field: 'query',
//     label: '查询',
//     component: 'switch',
//     width: '80px'
// }, {
//     field: 'where',
//     label: '匹配方式',
//     component: 'select',
//     props: {
//         options: [{
//             label: '=',
//             value: '='
//         }, {
//             label: '!=',
//             value: '!='
//         }, {
//             label: '>',
//             value: '>'
//         }, {
//             label: '>=',
//             value: '>='
//         }, {
//             label: '<',
//             value: '<'
//         }, {
//             label: '<=',
//             value: '<='
//         }, {
//             label: 'Between',
//             value: 'Between'
//         }, {
//             label: 'Like',
//             value: 'Like'
//         }, {
//             label: '左Like',
//             value: '左Like'
//         }, {
//             label: '右Like',
//             value: '右Like'
//         }]
//     }
// }, {
//     field: 'required',
//     label: '必填',
//     component: 'switch',
//     width: '80px'
// }, {
//     field: 'component',
//     label: '控件类型',
//     component: 'select',
//     props: {
//         options: [{
//             label: '单行文本框',
//             value: `component: 'input'`
//         }, {
//             label: '多行文本框',
//             value: `component: 'input',
//                     props: {
//                         type: 'textarea'
//                     }
//       `
//         }, {
//             label: '单选下拉框',
//             value: `component: 'select'`
//         }, {
//             label: '多选下拉框',
//             value: `component: 'select',
//                     props: {
//                         multiple: true
//                     }
//       `
//         }, {
//             label: '单选框',
//             value: `component: 'radio-group'`
//         }, {
//             label: '复选框',
//             value: `component: 'checkbox-group'`
//         }, {
//             label: '日期选择',
//             value: `component: 'date'`
//         }, {
//             label: '日期时间',
//             value: `component: 'date',
//                     props: {
//                         type: 'datetime',
//                         format: 'YYYY-MM-DD HH:mm:ss'
//                     }
//       `
//         }, {
//             label: '图片上传',
//             value: `component: 'upload-image'`
//         }, {
//             label: '文件上传',
//             value: `component: 'upload-file'`
//         }, {
//             label: '多图片上传',
//             value: `component: 'upload-image',
//                     props: {
//                         multiple: true
//                     }
//       `
//         }, {
//             label: '多文件上传',
//             value: `component: 'upload-file',
//                     props: {
//                         multiple: true
//                     }
//       `
//         }]
//     }
// }, {
//     component: 'select',
//     field: 'dictType',
//     label: '字典类型',
//     props: {
//         url: '/system/dict/all',
//         showValue: true
//     }
// }])

$common.get('/system/menu/tree').then(res => {
    tableDatas.value = res.data.list
})

const cols = reactive([
    // {
    //     field: '',
    //     label: '',
    //     width: 80
    // },
    {
        field: 'name',
        label: '菜单名称',
        type: 'html',
        component: 'input',
        labelStyle: 'display: inline-flex;width: 70%;'
    },
    {
        field: 'url',
        label: '路径',
        type: 'html',
        component: 'textarea'
    },
    {
        field: 'permission',
        label: '权限标识',
        width: 150,
        type: 'html',
        component: 'input'
    },
    {
        field: 'sort',
        label: '序号',
        component: 'input'
    },
    // {
    //     field: 'asdf',
    //     label: '图',
    //     component: 'upload-image',
    //     width: 150,
    //     alwaysEdit: true,
    //     props: {
    //         width: 100,
    //         height: 100
    //     }
    // },
    {
        field: 'asdf1',
        label: '备注',
        component: 'textarea',
        width: 300,
        componentStyle: {
            width: '502px'
        }
    }
])

function getData() {
    console.log(tableDatas)
}

</script>
