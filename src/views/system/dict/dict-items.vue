<template>
    <div class="mb-list" style="height: 600px">
        <div class="mb-search">
            <mb-search :where="tableOptions.where" @search="reloadTable" not-reset="dictId"/>
        </div>
        <div class="mb-toolbar">
            <n-space>
                <n-button :size="$global.uiSize.value" v-permission="'dict:items:save'" type="primary" @click="handleCreate">
                    <n-icon>
                        <AddOutline/>
                    </n-icon>
                    添加字典项
                </n-button>
            </n-space>
        </div>
        <div class="mb-table">
            <mb-table ref="table" v-bind="tableOptions"/>
        </div>

        <mb-modal :size="$global.uiSize.value" ref="formDialog" :title="dialogTitle" width="520px" @confirm="save($event)">
            <n-form ref="dataForm" :size="$global.uiSize.value" :rules="rules" :model="temp" label-placement="left" label-width="80px">
                <n-grid :cols="24">
                    <n-gi :span="12">
                        <n-form-item label="标签名" path="label">
                            <n-input v-model:value="temp.label"/>
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="12">
                        <n-form-item label="值" path="value">
                            <n-input v-model:value="temp.value"/>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :cols="24">
                    <n-gi :span="12">
                        <n-form-item label="排序" path="sort">
                            <n-input-number v-model:value="temp.sort" button-placement="both"/>
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

    </div>
</template>

<script setup>

import {ref, reactive, nextTick} from 'vue'
import common from '@/scripts/common'
import {useDictStore} from "@/store/modules/dictStore";
import {AddOutline} from "@vicons/ionicons5";

const dictStore = useDictStore()

const props = defineProps({
    dictId: {
        type: String,
        default: ''
    }
})

const tableOptions = reactive({
    id: 'dict-items',
    url: '/system/dict/items/list',
    page: true,
    where: {
        label: {
            label: '标签'
        },
        value: {
            label: '值'
        },
        dictId: props.dictId
    },
    cols: [
        {
            field: 'label',
            label: '标签'
        },
        {
            field: 'value',
            label: '值'
        },
        {
            field: 'sort',
            label: '排序'
        },
        {
            label: '排序',
            type: 'buttons',
            width: 150,
            buttons: [
                {
                    label: '上移',
                    link: true,
                    click: (row) => {
                        common.$get('/system/dict/items/sort/up', {
                            id: row.id,
                            sort: row.sort,
                            dictId: props.dictId
                        }).then(() => {
                            reloadTable()
                        })
                    }
                },
                {
                    label: '下移',
                    link: true,
                    click: (row) => {
                        common.$get('/system/dict/items/sort/down', {
                            id: row.id,
                            sort: row.sort,
                            dictId: props.dictId
                        }).then(() => {
                            reloadTable()
                        })
                    }
                }
            ]
        },
        {
            field: 'remarks',
            label: '备注'
        },
        {
            label: '操作',
            type: 'buttons',
            width: 160,
            fixed: 'right',
            buttons: [
                {
                    permission: 'dict:items:save',
                    label: '修改',
                    link: true,
                    click: (row) => {
                        handleUpdate(row)
                    }
                },
                {
                    permission: 'dict:items:delete',
                    label: '删除',
                    link: true,
                    click: (row) => {
                        common.handleDelete({
                            url: '/system/dict/items/delete',
                            id: row.id,
                            done: () => {
                                reloadTable()
                                common.getDictData()
                            }
                        })
                    }
                }
            ]
        }
    ]
})
const dialogTitle = ref('')
const rules = reactive({
    value: {required: true, message: '请输入值', trigger: 'change'},
    label: {required: true, message: '请输入标签名', trigger: 'change'},
    sort: {type: 'number', required: true, message: '请输入排序', trigger: 'change'}
})
const temp = ref(getTemp())
const table = ref()
const formDialog = ref()
const dataForm = ref()

function reloadTable() {
    table.value.reload()
}

function getTemp() {
    return {
        id: '',
        value: '',
        label: '',
        dictId: props.dictId,
        sort: 0,
        remarks: ''
    }
}

function getSort() {
    common.$get('/system/dict/items/sort', {dictId: props.dictId}).then(res => {
        temp.value.sort = res.data
    })
}

function handleCreate() {
    temp.value = getTemp()
    getSort()
    dialogTitle.value = '添加'
    formDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

function save(d) {
    dataForm.value.validate((errors) => {
        if (!errors) {
            d.loading()
            common.$post('/system/dict/items/save', temp.value).then(() => {
                d.hideLoading()
                formDialog.value.hide()
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
    formDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

</script>
