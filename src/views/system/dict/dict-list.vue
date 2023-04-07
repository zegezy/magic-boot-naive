<template>
    <div class="mb-list">
        <div class="mb-search">
            <mb-search :where="tableOptions.where" @search="reloadTable"/>
        </div>
        <div class="mb-toolbar">
            <n-space>
                <n-button :size="$global.uiSize.value" v-permission="'dict:save'" type="primary" @click="handleCreate">
                    <n-icon>
                        <AddOutline/>
                    </n-icon>
                    添加字典
                </n-button>
            </n-space>
        </div>
        <div class="mb-table">
            <mb-table ref="table" v-bind="tableOptions"/>
        </div>

        <mb-modal :size="$global.uiSize.value" ref="dictDialog" :title="dialogTitle" width="600px" @confirm="save($event)">
            <n-form :size="$global.uiSize.value" ref="dataForm" :rules="rules" :model="temp" label-placement="left" label-width="80px">
                <n-grid :cols="24">
                    <n-gi :span="12">
                        <n-form-item label="字典类型" path="dictType">
                            <mb-select v-model="temp.dictType" type="dict_type"/>
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="12">
                        <n-form-item label="类型" path="type">
                            <n-input v-model:value="temp.type"/>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :cols="24">
                    <n-gi :span="12">
                        <n-form-item label="描述" path="descRibe">
                            <n-input v-model:value="temp.descRibe"/>
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="12">
                        <n-form-item label="备注" path="remarks">
                            <n-input v-model:value="temp.remarks"/>
                        </n-form-item>
                    </n-gi>
                </n-grid>
            </n-form>
        </mb-modal>

        <mb-modal ref="dictItemsDialog" title="字典项" width="1400px" :show-footer="false">
            <dict-items v-model:dict-id="dictId"/>
        </mb-modal>

    </div>
</template>

<script setup>
import DictItems from './dict-items'
import common from '@/scripts/common'
import {ref, reactive, nextTick} from 'vue'
import {useDictStore} from "@/store/modules/dictStore";
import {AddOutline} from "@vicons/ionicons5";

const dictStore = useDictStore()

const tableOptions = reactive({
    url: '/system/dict/list',
    page: true,
    where: {
        type: {
            label: '类型'
        },
        dictType: {
            component: 'select',
            label: '字典类型',
            props: {
                'all-option': true,
                type: 'dict_type'
            }
        }
    },
    cols: [
        {
            field: 'type',
            label: '类型'
        },
        {
            field: 'descRibe',
            label: '描述'
        },
        {
            field: 'dictType',
            label: '字典类型',
            width: 200,
            dictType: 'dict_type'
        },
        {
            field: 'createDate',
            label: '创建时间'
        },
        {
            field: 'remarks',
            label: '备注',
            width: 200
        },
        {
            label: '操作',
            type: 'buttons',
            width: 220,
            fixed: 'right',
            buttons: [
                {
                    permission: 'dict:save',
                    label: '修改',
                    link: true,
                    click: (row) => {
                        handleUpdate(row)
                    }
                },
                {
                    permission: 'dict:delete',
                    label: '删除',
                    link: true,
                    click: (row) => {
                        common.handleDelete({
                            url: '/system/dict/delete',
                            id: row.id,
                            done: () => {
                                reloadTable()
                                dictStore.getDictData()
                            }
                        })
                    }
                },
                {
                    permission: 'dict:items:view',
                    label: '字典项',
                    link: true,
                    click: (row) => {
                        dictItemsDialog.value.show()
                        dictId.value = row.id
                    }
                }
            ]
        }
    ]
})

const dictId = ref('')
const temp = ref(getTemp())
const dialogTitle = ref('')
const rules = reactive({
    dictType: {required: true, message: '请选择字典类型', trigger: 'change'},
    type: {required: true, message: '请输入类型', trigger: 'change'},
    descRibe: {required: true, message: '请输入描述', trigger: 'change'}
})
const table = ref()
const dictDialog = ref()
const dataForm = ref()
const dictItemsDialog = ref()

function getTemp() {
    return {
        id: '',
        dictType: '',
        type: '',
        descRibe: '',
        remarks: ''
    }
}

function reloadTable() {
    table.value.reload()
}

function handleCreate() {
    temp.value = getTemp()
    dialogTitle.value = '添加'
    dictDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

function save(d) {
    dataForm.value.validate((errors) => {
        if (!errors) {
            d.loading()
            common.$post('/system/dict/save', temp.value).then((response) => {
                d.hideLoading()
                temp.value.id = response.data
                dictDialog.value.hide()
                $message.success(dialogTitle.value + '成功')
                reloadTable()
                dictStore.getDictData()
            }).catch(() => d.hideLoading())
        }
    })
}

function handleUpdate(row) {
    common.objAssign(temp.value, row)
    dialogTitle.value = '修改'
    dictDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

</script>
