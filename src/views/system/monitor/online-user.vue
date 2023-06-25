<template>
    <div style="height: 100%">
        <mb-list ref="magicList" v-bind="listOptions"/>
        <mb-modal ref="magicDialog" title="提示" width="600px" @confirm="disable">
            <n-grid :cols="24">
                <n-gi :span="24">
                    确定要踢“{{ currRow.username }}”下线并临时封禁吗？
                </n-gi>
                <n-gi :span="24">
                    <n-radio-group v-model:value="time">
                        <n-space>
                            <n-radio v-for="option in options" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </n-radio>
                        </n-space>
                    </n-radio-group>
                </n-gi>
            </n-grid>
        </mb-modal>
    </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import common from '@/scripts/common'

const magicList = ref()
const magicDialog = ref()
const currRow = ref()
const time = ref(0)
const options = reactive([{
    label: '不封禁',
    value: 0
}, {
    label: '1分钟',
    value: 60
}, {
    label: '10分钟',
    value: 10 * 60
}, {
    label: '1小时',
    value: 1 * 60 * 60
}, {
    label: '5小时',
    value: 5 * 60 * 60
}, {
    label: '永久',
    value: -1
}])
const listOptions = reactive({
    table: {
        url: '/system/online/list',
        where: {
            username: {
                label: '登录名称',
            },
            ip: {
                label: 'IP',
            }
        },
        cols: [
            {
                field: 'username',
                label: '登录名称'
            }, {
                field: 'officeName',
                label: '所属机构'
            }, {
                field: 'address',
                label: '登录地址'
            }, {
                field: 'ip',
                label: 'IP'
            }, {
                field: 'browser',
                label: '浏览器'
            }, {
                field: 'os',
                label: '操作系统',
                props: {
                    "show-overflow-tooltip": true
                }
            }, {
                field: 'createDate',
                label: '登录时间'
            }, {
                label: '操作',
                type: 'buttons',
                width: 140,
                fixed: 'right',
                buttons: [
                    {
                        permission: 'online:logout',
                        label: '踢人',
                        type: 'primary',
                        link: true,
                        icon: 'ElIconBicycle',
                        click: (row) => {
                            console.log(row)
                            currRow.value = row
                            magicDialog.value.show()
                            // $dialog.warning({
                            //   title: '提示',
                            //   content: `确定要踢“${row.username}”下线吗？`,
                            //   positiveText: '确定',
                            //   negativeText: '取消',
                            //   onPositiveClick: () => {
                            //     common.$get('/system/online/logout',{ token: row.token }).then(() => {
                            //       magicList.value.reload()
                            //     })
                            //   }
                            // })
                        }
                    }
                ]
            }
        ]
    }
})

function disable() {
    common.$get('/system/online/logout', {id: currRow.value.id, time: time.value}).then(() => {
        magicDialog.value.hide()
        magicList.value.reload()
    })
}
</script>
