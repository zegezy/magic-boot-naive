<template>
    <div>
        <n-form :size="$global.uiSize.value" ref="dataForm" :rules="rules" :model="temp" label-placement="left" label-width="100px">
            <n-grid :cols="24">
                <n-gi :span="12">
                    <n-form-item label="菜单类型" path="type">
                        <n-radio-group v-model:value="menuType">
                            <n-radio-button key="menu" value="menu" label="菜单"/>
                            <n-radio-button key="button" value="button" label="按钮"/>
                        </n-radio-group>
                    </n-form-item>
                </n-gi>
                <n-gi :span="12">
                    <n-form-item label="上级菜单" path="pid">
                        <n-tree-select
                            v-model:value="temp.pid"
                            :options="menuTree"
                        />
                    </n-form-item>
                </n-gi>
            </n-grid>
            <n-form-item label="菜单名称" path="name">
                <n-input v-model:value="temp.name"/>
            </n-form-item>
            <n-form-item label="菜单链接" path="url" v-if="menuType == 'menu'">
                <n-input v-model:value="temp.url"/>
            </n-form-item>
            <n-form-item label="打开方式" path="openMode"
                         v-if="menuType == 'menu'">
                <n-radio-group v-model:value="openModeRef">
                    <n-radio-button key="0" value="0" label="页签"/>
                    <n-radio-button key="1" value="1" label="新标签页"/>
                    <n-radio-button key="2" value="2" label="iframe"/>
                </n-radio-group>
            </n-form-item>
            <n-form-item label="关联组件" path="componentId"
                         v-if="menuType == 'menu' && !(temp.url.startsWith('http') || (temp.url.startsWith('/') && temp.url.indexOf('.htm') != -1))">
                <n-tree-select
                    v-model:value="temp.componentId"
                    :options="componentTree"
                    key-field="id"
                    label-field="name"
                    check-strategy="child"
                    default-expand-all
                    clearable
                />
            </n-form-item>
            <n-form-item label="权限标识" path="permission" v-if="menuType == 'button'">
                <n-input v-model:value="temp.permission"/>
            </n-form-item>

            <div class="flex flex-wrap">
                <div style="width: 50%">
                    <n-form-item label="菜单显示" path="isShow" v-if="menuType == 'menu'">
                        <n-radio-group v-model:value="temp.isShow">
                            <n-radio-button :key="1" :value="1" label="显示"/>
                            <n-radio-button :key="0" :value="0" label="不显示"/>
                        </n-radio-group>
                    </n-form-item>
                </div>
                <div style="width: 50%">
                    <n-form-item label="路由缓存" path="keepAlive" v-if="menuType == 'menu'">
                        <n-radio-group v-model:value="temp.keepAlive">
                            <n-radio-button :key="1" :value="1" label="缓存"/>
                            <n-radio-button :key="0" :value="0" label="不缓存"/>
                        </n-radio-group>
                    </n-form-item>
                </div>
                <div style="width: 50%">
                    <n-form-item label="排序" path="sort">
                        <n-input-number v-model:value="temp.sort" button-placement="both"/>
                    </n-form-item>
                </div>
                <div style="width: 50%">
                    <n-form-item label="图标" path="icon">
                        <a @click="openIcons">
                            <n-input v-model:value="temp.icon">
                                <template #suffix>
                                    <mb-icon :icon="temp.icon" />
                                </template>
                            </n-input>
                        </a>
                    </n-form-item>
                </div>
            </div>
        </n-form>
        <mb-modal ref="iconDialog" width="650px" title="选择图标">
            <menu-icons :select-icon="selectIcon" />
        </mb-modal>
    </div>
</template>

<script setup>
import {ref, reactive, watch, nextTick} from 'vue'
import MenuIcons from './menu-icons'

const props = defineProps({
    menuTree: {
        type: Array,
        default: () => []
    },
    menuData: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['reload-table'])
const componentTree = ref()
const dataForm = ref()
const menuType = ref('menu')
const iconDialog = ref()
const openModeRef = ref('0')
const getTemp = () => {
    return {
        id: '',
        name: '',
        url: '',
        permission: '',
        sort: 0,
        descRibe: '',
        isShow: 1,
        pid: 0,
        icon: '',
        keepAlive: 0,
        componentId: '',
        openMode: '0'
    }
}

$common.get('/system/component/tree').then(res => {
    $treeTable.deleteEmptyChildren(res.data.list)
    componentTree.value = res.data.list
})

const temp = ref(getTemp())

let validateUrl = (rule, value, callback) => {
    if (menuType.value == 'menu') {
        if (!value) {
            callback(new Error('请输入菜单链接'))
        } else {
            if(value.startsWith('http') || value.startsWith('/')){
                callback()
            }else{
                callback(new Error('菜单链接只能以"http"或"/"开头'))
            }
        }
    } else {
        if(value.startsWith('http') || value.startsWith('/')){
            callback()
        }else{
            callback(new Error('菜单链接只能以"http"或"/"开头'))
        }
    }
}

let validatePermission = (rule, value, callback) => {
    if (menuType.value == 'button') {
        if (!value) {
            callback(new Error('请输入权限标识'))
        } else {
            callback()
        }
    } else {
        callback()
    }
}

const rules = reactive({
    pid: {required: true, message: '请选择上级菜单', trigger: 'change'},
    name: {required: true, message: '请输入菜单名称', trigger: 'change'},
    url: {required: true, trigger: 'change', validator: validateUrl},
    permission: {required: true, trigger: 'change', validator: validatePermission}
})

watch(menuType, (type) => {
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
    if (type == 'menu') {
        temp.value.isShow = 1
    } else {
        temp.value.isShow = 0
    }
})

watch(openModeRef, (value) => {
    temp.value.openMode = value
})

function save(d) {
    dataForm.value.validate((errors) => {
        if (!errors) {
            d.loading()
            if (temp.value.pid == temp.value.id) {
                $message.warning('上级菜单不能选当前菜单')
                d.hideLoading()
                return
            }
            if ($treeTable.isChildren($treeTable.queryChildren(props.menuData, temp.value.id), temp.value.pid)) {
                $message.warning('上级菜单不能选当前菜单子级')
                d.hideLoading()
                return
            }
            if (menuType.value == 'menu') {
                temp.value.permission = ''
            } else {
                temp.value.isShow = 0
                temp.value.keepAlive = 0
                temp.value.icon = ''
                temp.value.url = ''
            }
            $common.post('/system/menu/save', temp.value).then(() => {
                d.hideLoading()
                $message.success(d.title + '成功')
                d.hide()
                emit('reload-table')
            }).catch(() => d.hideLoading())
        }
    })
}

function addSubMenu(id) {
    resetTemp()
    menuType.value = 'menu'
    temp.value.pid = id
    temp.value.id = $common.uuid()
    getSort()
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

function getInfo(row) {
    for (let t in temp.value) {
        temp.value[t] = row[t]
    }
    openModeRef.value = temp.value.openMode || '0'
    menuType.value = temp.value.url ? 'menu' : 'button'
    $treeTable.clearFont(temp.value, ['name', 'url', 'permission'])
    nextTick(() => {
        dataForm.value.restoreValidation()
    })
}

function resetTemp() {
    temp.value = getTemp()
}

function selectIcon(symbol) {
    temp.value.icon = symbol
    iconDialog.value.hide()
}

function openIcons() {
    iconDialog.value.show()
}

function getSort() {
    $common.get('/system/menu/sort', {pid: temp.value.pid}).then(res => {
        temp.value.sort = res.data
    })
}

defineExpose({addSubMenu, getInfo, save})

</script>
