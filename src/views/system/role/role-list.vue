<style scoped>
:deep(.n-form-item .n-form-item-blank) {
    display: table;
}
</style>

<template>
    <div class="mb-list">
        <div class="mb-search">
            <mb-search :where="tableOptions.where" @search="reloadTable"/>
        </div>
        <div class="mb-toolbar">
            <n-button :size="$global.uiSize.value"  v-permission="'role:save'" type="primary" @click="handleCreate">
                <mb-icon icon="AddOutline" />
                添加角色
            </n-button>
        </div>
        <div class="mb-table">
            <mb-table ref="table" v-bind="tableOptions"/>
        </div>
        <mb-modal :size="$global.uiSize.value" ref="roleFormDialog" :title="dialogTitle" width="900px" @confirm="save($event)">
            <n-form :size="$global.uiSize.value" ref="dataForm" :rules="rules" label-placement="left" :model="temp" label-width="80px">
                <n-grid :cols="24" :x-gap="24">
                    <n-gi :span="12">
                        <n-form-item label="角色名称" path="name">
                            <n-input v-model:value="temp.name"/>
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="12">
                        <n-form-item label="角色编码" path="code">
                            <n-input v-model:value="temp.code"/>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :cols="24">
                    <n-gi :span="24">
                        <n-form-item label="角色描述" path="descRibe">
                            <n-input
                                type="textarea"
                                :rows="4"
                                placeholder="请输入描述"
                                v-model:value="temp.descRibe">
                            </n-input>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :cols="24">
                    <n-gi :span="12">
                        <n-form-item label="菜单权限" path="menus">
                            <mb-tree
                                ref="tree"
                                v-model="temp.menus"
                                style="height: 270px; overflow: auto"
                                url="/system/menu/tree"
                                checkable
                                search
                            />
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="12">
                        <n-form-item label="数据权限" path="permission">
                            <mb-select v-model="temp.permission" :options="permissionData" style="margin-bottom: 5px"/>
                            <mb-tree
                                v-if="temp.permission == 1"
                                style="height: 270px; overflow: auto;"
                                ref="office"
                                checkable
                                url="/system/office/tree"
                                v-model="temp.offices"
                            />
                        </n-form-item>
                    </n-gi>
                </n-grid>
            </n-form>
        </mb-modal>

        <mb-modal ref="assignPermissionsDialog" title="分配权限" width="550px"
                  @confirm="assignPermissions.save($event)">
            <role-assign-permissions ref="assignPermissions" :key="temp.id" :id="temp.id"
                                     @close="() => { assignPermissionsDialog.hide(); temp.id = '' }"/>
        </mb-modal>

    </div>
</template>

<script setup>
import {ref, reactive, watch, nextTick} from 'vue'
import {push} from '@/scripts/router'
import RoleAssignPermissions from './role-assign-permissions'

const permissionData = reactive([{
    label: '全部',
    value: '0'
}, {
    label: '自定义',
    value: '1'
}, {
    label: '本级及子级',
    value: '2'
}, {
    label: '本级',
    value: '3'
}])
const assignPermissions = ref()
const assignPermissionsDialog = ref()
const table = ref()
const roleFormDialog = ref()
const dataForm = ref()
const tableOptions = reactive({
    id: 'role-list',
    url: '/system/role/list',
    where: {
        name: {
            label: '角色名称'
        }
    },
    cols: [
        {
            field: 'name',
            label: '角色名称'
        },
        {
            field: 'code',
            label: '角色编码'
        },
        {
            field: 'descRibe',
            label: '角色描述'
        },
        {
            field: 'permission',
            label: '数据权限',
            render: (row) => {
                return permissionData[row.permission].label
            }
        },
        {
            label: '操作',
            type: 'buttons',
            width: 300,
            fixed: 'right',
            buttons: [
                {
                    permission: 'role:save',
                    label: '修改',
                    link: true,
                    click: (row) => {
                        handleUpdate(row)
                    }
                },
                {
                    permission: 'role:delete',
                    label: '删除',
                    link: true,
                    click: (row) => {
                        $common.handleDelete({
                            url: '/system/role/delete',
                            id: row.id,
                            done: () => reloadTable()
                        })
                    }
                },
                {
                    permission: 'role:permission',
                    label: '权限',
                    link: true,
                    click: (row) => {
                        temp.value.id = row.id
                        assignPermissionsDialog.value.show()
                    }
                },
                {
                    permission: 'role:user:list',
                    label: '用户列表',
                    link: true,
                    click: (row) => {
                        push({
                            path: '/system/user/user-list',
                            query: {roleId: row.id}
                        })
                    }
                }
            ]
        }
    ]
})
const dialogTitle = ref('')
const temp = ref(getTemp())
const rules = reactive({
    name: {required: true, message: '请输入角色名称', trigger: 'change'},
    code: {required: true, message: '请输入角色编码', trigger: 'change'}
})

watch(() => temp.value.permission, () => {
    if (temp.value.permission != 1) {
        temp.value.offices = ''
    }
})

function reloadTable() {
    table.value.reload()
}

function getTemp() {
    return {
        id: '',
        name: '',
        menus: '',
        offices: '',
        permission: '0',
        code: '',
        descRibe: ''
    }
}

function resetTemp() {
    temp.value = getTemp()
}

function handleCreate() {
    resetTemp()
    dialogTitle.value = '添加'
    roleFormDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

function save(d) {
    dataForm.value.validate((errors) => {
        if (!errors) {
            d.loading()
            $common.post('/system/role/save', temp.value).then(() => {
                d.hideLoading()
                reloadTable()
                roleFormDialog.value.hide()
                $message.success(dialogTitle.value + '成功')
            }).catch(() => d.hideLoading())
        }
    })
}

function handleUpdate(row) {
    for (let t in temp.value) {
        temp.value[t] = row[t]
    }
    $common.get('/system/menu/by/role', {roleId: row.id}).then(res => {
        temp.value.menus = res.data.join(',')
    })
    $common.get('/system/office/by/role', {roleId: row.id}).then(res => {
        temp.value.offices = res.data.join(',')
    })
    dialogTitle.value = '修改'
    roleFormDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

</script>
