<template>
    <div>
        <div>
            单独使用
            <mb-select-table
                v-model="multipleSelect"
                :height="400"
                :width="800"
                multiple
                v-bind="selectTableOptions"
                @select-data="multipleCallback"
            />
        </div>
        <div style="height: 300px">
            可编辑表格内使用
            <mb-editor-table ref="dataTableRef" v-bind="dataTableOptions" />
        </div>
    </div>
</template>

<script setup>
import {reactive, ref, watch} from "vue";

const multipleSelect = ref()
function multipleCallback({ selectData, multiple }){
    if(multiple){
        multipleSelect.value = selectData.map(it => it.username).join(' ')
    }else{
        multipleSelect.value = selectData.username
    }
}
const selectTableOptions = reactive({
    tableOptions: {
        id: 'user-list',
        url: '/system/user/list',
        page: true,
        where: {
            username: {
                label: '登录名称',
                props: {
                    width: '80px'
                }
            }
        },
        cols: [
            {
                field: 'username',
                label: '登录名称',
                realSort: true
            },
            {
                field: 'name',
                label: '姓名/昵称'
            },
            {
                field: 'officeName',
                label: '所属机构'
            },
            {
                field: 'roles',
                label: '角色',
                type: 'dynamic'
            },
            {
                field: 'phone',
                label: '手机号'
            },
            {
                field: 'createDate',
                label: '创建时间',
                width: 180
            }
        ]
    }
})

const dataTableRef = ref()
watch(dataTableRef, () => {
    dataTableRef.value.setData([{
        username: '',
        id: '1',
        roleId: '1d183eaec667423fa9adb20e24356a86',
        officeId: '',
        isLogin: 0,
        xxx: 0
    }])
})
const dataTableOptions = reactive({
    props: {
        url: '/system/user/list',
        where: {
            username: 'admin'
        }
    },
    showNo: false,
    operation: {
        delete: {
            confirm: true,
            deleteAfter() {
                console.log('已删除')
            }
        },
        sub: true,
        same: true
    },
    operationWidth: 300,
    cols: [{
        field: 'username',
        label: '登录名称',
        component: 'select-table',
        // alwaysEdit: true,
        componentProps: {
            height: 400,
            width: 800,
            multiple: true,
            onSelectData({ selectData, multiple, editorCurrentRow }){
                if(multiple){
                    selectData.forEach((it, i) => {
                        if(i == 0){
                            Object.assign(editorCurrentRow, it)
                        }else{
                            dataTableRef.value.unshift(it)
                        }
                    })
                }else{
                    editorCurrentRow.officeId = selectData.officeId
                    editorCurrentRow.username = selectData.username
                }
            },
            tableOptions: {
                id: 'user-list',
                url: '/system/user/list',
                page: true,
                selection: false,
                where: {
                    username: {
                        label: '登录名称',
                        props: {
                            width: '80px'
                        }
                    }
                },
                cols: [
                    {
                        field: 'username',
                        label: '登录名称',
                        realSort: true
                    },
                    {
                        field: 'name',
                        label: '姓名/昵称'
                    },
                    {
                        field: 'officeName',
                        label: '所属机构'
                    },
                    {
                        field: 'roles',
                        label: '角色',
                        type: 'dynamic'
                    },
                    {
                        field: 'phone',
                        label: '手机号'
                    },
                    {
                        field: 'createDate',
                        label: '创建时间',
                        width: 180
                    }
                ]
            }
        },
        copyAll: true,
        copyText: true
    },{
        field: 'officeId',
        label: '组织机构',
        component: 'tree-select',
        componentProps: {
            url: "/system/user/offices",
            placeholder: "请选择组织机构",
            multiple: true
        },
        copyAll: true,
        copyText: true
    }]
})

</script>
