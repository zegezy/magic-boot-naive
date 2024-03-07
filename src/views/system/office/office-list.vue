<template>
    <div class="mb-list">
        <div class="mb-search">
            <n-space>
                <n-input :size="$global.uiSize.value" v-model:value="searchValue" @keyup.enter="searchOffice" placeholder="菜单名称、链接、权限标识"
                         style="width: 200px"></n-input>
                <n-button :size="$global.uiSize.value" type="primary" @click="searchOffice">
                    <mb-icon icon="Search" />
                    搜索
                </n-button>
                <n-button :size="$global.uiSize.value" @click="() => { searchValue = ''; searchOffice() }">
                    <mb-icon icon="TrashOutline" />
                    清空
                </n-button>
            </n-space>
        </div>
        <div class="mb-toolbar">
            <n-space>
                <n-button :size="$global.uiSize.value" type="primary" @click="addSubOffice('0')" v-permission="'office:save'">
                    <mb-icon icon="AddOutline" />
                    添加机构
                </n-button>
                <n-button :size="$global.uiSize.value" type="primary" @click="() => table.toggleExpand()">
                    <mb-icon icon="ArrowDownOutline" />
                    展开/折叠
                </n-button>
            </n-space>
        </div>
        <div class="mb-table">
            <mb-table ref="table" v-bind="tableOptions"/>
        </div>
        <mb-modal :size="$global.uiSize.value" ref="officeFormDialog" width="700px" :title="dialogTitle" @confirm="save($event)">
            <n-form :size="$global.uiSize.value" ref="dataForm" :rules="rules" :model="temp" label-placement="left" label-width="80px">
                <n-grid :cols="24" :x-gap="24">
                    <n-gi :span="12">
                        <n-form-item label="机构类型" path="type">
                            <mb-select v-model="temp.type" type="office_type" width="100%" :key="temp.type"/>
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="12">
                        <n-form-item label="上级机构" path="pid">
                            <n-tree-select
                                v-model:value="temp.pid"
                                :options="officeTree"
                            />
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :cols="24" :x-gap="24">
                    <n-gi :span="12">
                        <n-form-item label="机构名称" path="name">
                            <n-input v-model:value="temp.name"/>
                        </n-form-item>
                    </n-gi>
                    <n-gi :span="12">
                        <n-form-item label="机构编码" path="code">
                            <n-input v-model:value="temp.code"/>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid :gutter="24" :x-gap="24">
                    <n-gi :span="12">
                        <n-form-item label="排序" prop="sort">
                            <n-input-number v-model:value="temp.sort" button-placement="both"/>
                        </n-form-item>
                    </n-gi>
                </n-grid>
            </n-form>
        </mb-modal>
    </div>
</template>

<script setup>
import {ref, reactive, onMounted, watch, nextTick} from 'vue'
import {push} from '@/scripts/router'

const officeData = ref([])
const officeTree = ref([])
const searchValue = ref('')
const table = ref()
const tableOptions = reactive({
    id: 'office-list',
    loading: false,
    showNo: false,
    page: false,
    cols: [
        {
            field: 'name',
            label: '机构名称',
            align: 'left',
            type: 'html',
            width: 280
        },
        {
            field: 'code',
            label: '机构编码',
            width: 120,
            align: 'center',
            type: 'html'
        },
        {
            field: 'type',
            dictType: 'office_type',
            label: '机构类型',
            width: 300,
            align: 'center'
        },
        {
            field: 'sort',
            label: '序号',
            width: 60,
            align: "center"
        },
        {
            label: '排序',
            type: 'buttons',
            width: 160,
            buttons: [
                {
                    label: '上移',
                    link: true,
                    click: (row) => {
                        $common.get('/system/office/sort/up', {
                            id: row.id,
                            pid: row.pid,
                            sort: row.sort
                        }).then(() => {
                            reloadTable()
                        })
                    }
                },
                {
                    label: '下移',
                    link: true,
                    click: (row) => {
                        $common.get('/system/office/sort/down', {
                            id: row.id,
                            pid: row.pid,
                            sort: row.sort
                        }).then(() => {
                            reloadTable()
                        })
                    }
                }
            ]
        },
        {
            label: '操作',
            type: 'buttons',
            width: 360,
            fixed: 'right',
            align: 'center',
            buttons: [
                {
                    label: '添加下级机构',
                    link: true,
                    permission: 'office:save',
                    click: (row) => {
                        addSubOffice(row.id)
                    }
                },
                {
                    label: '修改',
                    link: true,
                    permission: 'office:save',
                    click: (row) => {
                        handleUpdate(row)
                    }
                },
                {
                    label: '删除',
                    link: true,
                    permission: 'office:delete',
                    click: (row) => {
                        $common.handleDelete({
                            url: '/system/office/delete',
                            id: row.id,
                            done: () => reloadTable()
                        })
                    }
                },
                {
                    permission: 'office:user:list',
                    label: '用户列表',
                    link: true,
                    click: (row) => {
                        push({
                            path: '/system/user/user-list',
                            query: {officeId: row.id}
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
    type: {required: true, message: '请选择机构类型', trigger: 'change'},
    pid: {required: true, message: '请选择上级机构', trigger: 'change'},
    name: {required: true, message: '请输入机构名称', trigger: 'change'},
    code: {required: true, message: '请输入机构编码', trigger: 'change'}
})
const officeFormDialog = ref()
const dataForm = ref()

onMounted(() => reloadTable())

watch(officeData, () => {
    officeTree.value = [{
        label: '根节点',
        key: '0',
        children: $treeTable.genTree(officeData.value)
    }]
})

function searchOffice() {
    if (searchValue.value) {
        tableOptions.data = $treeTable.recursionSearch(['name', 'code'], $common.copyNew(officeData.value), searchValue.value)
    } else {
        tableOptions.data = officeData.value
    }
}

function getTemp() {
    return {
        id: '',
        name: '',
        sort: 0,
        pid: '',
        type: '',
        code: ''
    }
}

function resetTemp() {
    temp.value = getTemp()
}

function getSort() {
    $common.get('/system/office/sort', {pid: temp.value.pid}).then(res => {
        temp.value.sort = res.data
    })
}

function addSubOffice(id) {
    resetTemp()
    temp.value.pid = id
    temp.value.id = $common.uuid()
    getSort()
    dialogTitle.value = '添加'
    officeFormDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

function save(d) {
    dataForm.value.validate((errors) => {
        if (!errors) {
            d.loading()
            if (temp.value.pid == temp.value.id) {
                $message.warning('上级机构不能选当前机构')
                return
            }
            if ($treeTable.isChildren($treeTable.queryChildren(officeData.value, temp.value.id), temp.value.pid)) {
                $message.warning('上级机构不能选当前机构子级')
                return
            }
            $common.post('/system/office/save', temp.value).then(() => {
                d.hideLoading()
                $message.success(dialogTitle.value + '成功')
                reloadTable()
                officeFormDialog.value.hide()
            }).catch(() => d.hideLoading())
        }
    })
}

function reloadTable() {
    tableOptions.loading = true
    $common.get('/system/office/tree').then(res => {
        officeData.value = res.data.list
        tableOptions.data = officeData.value
        tableOptions.loading = false
    })
}

function handleUpdate(row) {
    for (let t in temp.value) {
        temp.value[t] = row[t]
    }
    $treeTable.clearFont(temp.value, ['name', 'code'])
    dialogTitle.value = '修改'
    officeFormDialog.value.show()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

</script>
