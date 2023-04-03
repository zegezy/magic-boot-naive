<template>
    <div class="mb-list">
        <div class="mb-search">
            <mb-search :where="tableOptions.where" @search="reloadTable"/>
        </div>
        <div class="mb-toolbar">
            <n-space>
                <n-button v-permission="'configure:save'" type="primary" @click="handleCreate">
                    添加
                </n-button>
            </n-space>
        </div>
        <div class="mb-table">
            <mb-table ref="table" v-bind="tableOptions"/>
        </div>
        <mb-modal ref="roleFormDialog" :title="dialogTitle" width="900px" @confirm="save($event)">
            <n-form ref="dataForm" :rules="rules" :model="temp" label-placement="left" label-width="100px">
                <n-grid :cols="24">
                    <n-gi :span="12">
                        <n-form-item label="键值" path="configureKey">
                            <mb-input v-model="temp.configureKey"/>
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="12">
                        <n-form-item label="数据值" path="configureValue">
                            <n-input v-model:value="temp.configureValue"/>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :cols="24">
                    <n-gi :span="12">
                        <n-form-item label="名称" path="configureName">
                            <mb-input v-model:value="temp.configureName"/>
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="12">
                        <n-form-item label="配置类型" path="configureType">
                            <mb-select v-model="temp.configureType" type="dict_type"/>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :cols="24">
                    <n-gi :span="24">
                        <n-form-item label="条件筛选" path="configureCondition">
                            <n-input
                                type="textarea"
                                :rows="4"
                                placeholder="请输入条件筛选"
                                v-model:value="temp.configureCondition">
                            </n-input>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :cols="24">
                    <n-gi :span="24">
                        <n-form-item label="配置说明" path="configureDescRibe">
                            <n-input
                                type="textarea"
                                :rows="4"
                                placeholder="请输入配置说明"
                                v-model:value="temp.configureDescRibe">
                            </n-input>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :cols="24">
                    <n-gi :span="24">
                        <n-form-item label="备注" path="remarks">
                            <n-input
                                type="textarea"
                                :rows="4"
                                placeholder="请输入备注"
                                v-model:value="temp.remarks">
                            </n-input>
                        </n-form-item>
                    </n-gi>
                </n-grid>
            </n-form>
        </mb-modal>
    </div>
</template>

<script setup>

import {ref, reactive, nextTick} from 'vue'
import common from '@/scripts/common'
import {useDictStore} from "@/store/modules/dictStore";

const dictStore = useDictStore()

const dialogTitle = ref('')
const roleFormDialog = ref()
const tableOptions = reactive({
    url: '/system/configure/list',
    page: true,
    where: {
        configureCondition: {
            label: '查询条件'
        },
        configureKey: {
            label: '配置键值'
        },
        configureValue: {
            label: '配置数据'
        }
    },
    cols: [
        {
            field: 'configureKey',
            label: '配置键值',
            width: 200
        },
        {
            field: 'configureValue',
            label: '配置数据'
        },
        {
            field: 'configureName',
            label: '配置名称'
        },
        {
            field: 'configureType',
            label: '配置类型',
            dictType: 'dict_type'
        },
        {
            field: 'configureCondition',
            label: '查询条件'
        },
        {
            field: 'configureDescRibe',
            label: '配置说明',
            width: 200
        },
        {
            field: 'remarks',
            label: '备注',
            width: 200
        },
        {
            field: 'createDate',
            label: '创建时间',
            width: 200
        },
        {
            label: '操作',
            type: 'buttons',
            width: 220,
            fixed: 'right',
            buttons: [
                {
                    permission: 'configure:save',
                    label: '修改',
                    link: true,
                    click: (row) => {
                        handleUpdate(row)
                    }
                },
                {
                    permission: 'configure:delete',
                    label: '删除',
                    link: true,
                    click: (row) => {
                        common.handleDelete({
                            url: '/system/configure/delete',
                            id: row.id,
                            done: () => {
                                reloadTable()
                                dictStore.getDictData()
                            }
                        })
                    }
                }
            ]
        }
    ]
})
const temp = ref(getTemp())
const dialogFormVisible = ref(false)
const dialogStatus = ref('')
const textMap = reactive({
    update: '修改',
    create: '添加'
})
const rules = reactive({
    configureName: {required: true, message: '请输入配置名称', trigger: 'change'},
    configureKey: {required: true, message: '请输入配置键值', trigger: 'change'},
    configureValue: {required: true, message: '请输入配置数据', trigger: 'change'},
    configureType: {required: true, message: '请选择类型', trigger: 'change'}
})
const table = ref()
const dataForm = ref()

function getTemp() {
    return {
        id: '',
        configureCondition: '',
        configureName: '',
        configureKey: '',
        configureValue: '',
        configureType: '',
        configureDescRibe: '',
        remarks: ''
    }
}

function reloadTable() {
    table.value.reload()
}

function handleCreate() {
    temp.value = getTemp()
    dialogTitle.value = '添加'
    roleFormDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

function save() {
    dataForm.value.validate((errors) => {
        if (!errors) {
            common.$post('/system/configure/save', temp.value).then((response) => {
                roleFormDialog.value.hide()
                $message.success((dialogStatus.value === 'create' ? '创建' : '修改') + '成功')
                reloadTable()
            })
        }
    })
}

function handleUpdate(row) {
    common.objAssign(temp.value, row)
    dialogTitle.value = '添加'
    roleFormDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

</script>
