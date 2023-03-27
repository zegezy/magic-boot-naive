<template>
  <mb-list ref="magicList" v-bind="listOptions" />
<!--  <mb-dialog ref="magicDialog" title="提示" width="600px" @confirm-click="disable">-->
<!--    <template #content>-->
<!--      <el-row :gutter="24">-->
<!--        <el-col :span="24">-->
<!--          确定要踢“{{currRow.username}}”下线并临时封禁吗？-->
<!--        </el-col>-->
<!--        <el-col :span="24">-->
<!--          <mb-radio v-model="time" :options="options"></mb-radio>-->
<!--        </el-col>-->
<!--      </el-row>-->
<!--    </template>-->
<!--  </mb-dialog>-->
</template>

<script setup>
  import {reactive, ref, getCurrentInstance} from "vue";
  const { proxy } = getCurrentInstance()
  const magicList = ref()
  // const magicDialog = ref()
  // const currRow = ref()
  // const time = ref(0)
  // const options = reactive([{
  //   label: '不封禁',
  //   value: 0
  // },{
  //   label: '1分钟',
  //   value: 60
  // },{
  //   label: '10分钟',
  //   value: 10 * 60
  // },{
  //   label: '1小时',
  //   value: 1 * 60 *60
  // },{
  //   label: '5小时',
  //   value: 5 * 60 *60
  // },{
  //   label: '永久',
  //   value: -1
  // }])
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
          type: 'btns',
          width: 140,
          fixed: 'right',
          btns: [
            {
              permission: 'online:logout',
              label: '踢人',
              type: 'primary',
              link: true,
              icon: 'ElIconBicycle',
              click: (row) => {
                // currRow.value = row
                // magicDialog.value.show()
                proxy.$alert(`确定要踢“${row.username}”下线吗？`, '提示', {
                  confirmButtonText: '确定',
                  callback: (action) => {
                    if (action === 'confirm') {
                      proxy.$get('/system/online/logout',{ token: row.token }).then(() => {
                        magicList.value.reload()
                      })
                    }
                  }
                })
              }
            }
          ]
        }
      ]
    }
  })
  // function disable(){
  //   proxy.$get('/system/online/logout',{ id: currRow.value.id, time: time.value }).then(() => {
  //     magicDialog.value.hide()
  //     magicList.value.reload()
  //   })
  // }
</script>
