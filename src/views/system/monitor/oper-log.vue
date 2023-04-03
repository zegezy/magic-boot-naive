<template>
    <div class="mb-list">
        <div class="mb-search">
            <mb-search :where="tableOptions.where" @search="reloadTable">
                <template #buttons>
                    <n-button type="primary" @click="table.exportExcel({fileName: '操作日志'})">
                        导出
                    </n-button>
                </template>
            </mb-search>
        </div>
        <div class="mb-table">
            <mb-table ref="table" v-bind="tableOptions"/>
        </div>
    </div>
</template>

<script setup>
import {ref, reactive} from 'vue'

const table = ref()
const tableOptions = reactive({
    url: '/system/log/oper/list',
    where: {
        userIp: {
            label: 'IP'
        },
        username: {
            label: '操作人'
        },
        apiName: {
            label: '接口名'
        },
        apiPath: {
            label: '路径'
        },
        costTime: {
            component: 'input',
            props: {
                pair: true,
                separator: '-'
            },
            label: '耗时区间'
        },
        createDate: {
            component: 'date',
            label: '创建时间',
            props: {
                type: 'datetimerange'
            }
        }
    },
    cols: [
        {
            field: 'apiName',
            label: '接口名'
        },
        {
            field: 'apiPath',
            label: '路径'
        },
        {
            field: 'apiMethod',
            label: '方法',
            width: '100px'
        },
        {
            field: 'userIp',
            label: 'ip',
            width: '150px'
        },
        {
            field: 'costTime',
            label: '耗时',
            width: '100px'
        },
        {
            field: 'userAgent',
            label: '用户代理',
            props: {
                "show-overflow-tooltip": true
            }
        },
        {
            field: 'username',
            label: '操作人',
            width: '150px'
        },
        {
            field: 'createDate',
            label: '操作时间',
            width: '180px'
        }
    ]
})

function reloadTable() {
    table.value.reload()
}
</script>
