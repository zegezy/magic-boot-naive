<style scoped>
.tools i,
.tools svg{
    cursor: pointer;
}
.logo-content {
    text-align: center;
    width: 400px;
    margin: 0 auto;
    padding-top: 30vh;
}
.title-bg{
    background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.25;
}
</style>

<template>
    <div class="h-full">
        <n-split direction="horizontal" style="height: 100%" :default-size="0.15" :max="0.3" :min="0.1">
            <template #1>
                <div class="h-full">
                    <mb-tree
                        ref="treeRef"
                        url="/system/component/tree"
                        :expand="false"
                        search
                        search-width="100%"
                        :checked="false"
                        :checkable="false"
                        show-line
                        @node-click="nodeClick"
                        :contextmenu="treeContextmenu"
                        :icon="{ expand: 'FolderOpenOutline', collapse: 'Folder', node: 'LogoVue' }"
                    />
                    <mb-modal ref="nameModal" :title="updateComponent ? '修改': '添加'" @confirm="saveComponent">
                        <n-form :size="$global.uiSize.value" ref="dataForm" :rules="rules" :model="formData" label-placement="left" label-width="60px">
                            <n-form-item label="名称" path="name">
                                <n-input v-model:value="formData.name"/>
                            </n-form-item>
                            <n-form-item label="备注" path="remark">
                                <n-input v-model:value="formData.remark"/>
                            </n-form-item>
                        </n-form>
                    </mb-modal>
                </div>
            </template>
            <template #2>
                <div style="padding: 5px;height: 100%; box-sizing: border-box;">
                    <div class="logo-content" v-if="tabs.length == 0">
                        <div class="text-6xl mt-0 mb-0 italic font-black title-bg">
                            {{ $global.title }}
                        </div>
                        <p class="text-base" style="color: #213547">【有些事情本来很遥远，你争取，它就会离你越来越近】</p>
                        <n-button type="primary" color="#42b883" @click="createFile('0', 0)">新建文件夹</n-button>
                        <div class="flex flex-wrap justify-between mt-4" style="color: #b6b6b6">
                            <div class="text-base w-1/2 mb-4">保存Ctrl + S</div>
                            <div class="text-base w-1/2">撤销Ctrl + Z</div>
                            <div class="text-base w-1/2">反撤销Ctrl + Shift + Z</div>
                        </div>
                    </div>
                    <n-tabs
                        v-else
                        v-model:value="tabId"
                        type="card"
                        closable
                        tab-style="min-width: 80px;"
                        @close="tabClose"
                        class="h-full w-full"
                    >
                        <template #suffix>
                            <div class="tools flex flex-row items-center" style="padding:5px 5px;">
                                <n-button class="mr-2" type="primary" size="small" @click="saveCode()">
                                    <template #icon>
                                        <mb-icon icon="SaveSharp" color="#fff" />
                                    </template>
                                    编译并保存
                                </n-button>

                                <n-button type="primary" secondary size="small" @click="openHistory(tabs.filter(it => it.id == tabId)[0])">
                                    <template #icon>
                                        <mb-icon icon="History24Filled" color="#2d8cf0" />
                                    </template>
                                    历史记录
                                </n-button>
                            </div>
                        </template>
                        <n-tab-pane
                            v-for="tab in tabs"
                            :key="tab.id"
                            :tab="tab.name + (tab.isSave && tab.isSave == 1 ? ' *' : '')"
                            :name="tab.id"
                            display-directive="show"
                            class="h-full w-full"
                            style="padding: 0px"
                        >
                            <div class="flex flex-col h-full">
                                <div style="flex: 1">
                                    <mb-monaco-volar
                                        :ref="(el) => setComponentRef(el, tab.id)"
                                        :code="tab.code"
                                        :file-name="tab.id"
                                        @didChangeModelContent="onDidChangeModelContent(tab)"
                                        @save="saveCode()"
                                    />
                                </div>
                            </div>
                        </n-tab-pane>
                    </n-tabs>
                </div>
            </template>
        </n-split>
        <mb-modal ref="errorInfoModal" width="900px" title="错误信息" :show-footer="false">
            <textarea v-model="errorInfo" :rows="40" style="width: 100%" />
        </mb-modal>
        <n-drawer
            v-model:show="showDrawer"
            :default-height="800"
            placement="bottom"
            resizable
            @after-leave="drawerClose"
        >
            <n-drawer-content closable :title="currentNode.name + ' - 历史记录'">
                <div class="flex h-full">
                    <div style="width: 400px" class="h-full">
                        <mb-table v-bind="historyTableOptions" @selected-row="historyTableSelect" />
                    </div>
                    <div class="compare flex-1  h-full">
                        <div class="flex flex-col h-full">
                            <div class="flex items-center">
                                <div class="flex-1 flex items-center">
                                    <div class="flex-1">
                                        {{ currentHistoryOldDate }} by {{ currentHistoryOldCreateBy }}
                                    </div>
                                    <div style="padding: 0px 40px 5px 0px">
                                        <n-button type="primary" @click="restoreToThisVersion">还原到此版本</n-button>
                                    </div>
                                </div>
                                <div class="flex-1">当前版本</div>
                            </div>
                            <mb-monaco-volar
                                compare
                                ref="historyEditorRef"
                                :code="historyCode"
                                :old-code="historyOldCode"
                                :file-name="currentNodeId"
                            />
                        </div>
                    </div>
                </div>
            </n-drawer-content>
        </n-drawer>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {compileCode} from "@/scripts/compiler/sfc-compiler";
const monacoVolarRefs = reactive({})
const nameModal = ref()
const formData = reactive({
    remark: '',
    name: '',
    type: 0
})
const currentNodeId = ref()
const currentNode = ref()
const treeRef = ref()
const errorInfoModal = ref()
const errorInfo = ref()
const updateComponent = ref(false)
const showDrawer = ref(false)
const historyEditorRef = ref()
const historyCode = ref()
const historyOldCode = ref()
const historyTableWhere = reactive({})
const currentHistoryOldDate = ref()
const currentHistoryOldCreateBy = ref()
const historyTableOptions = reactive({
    url: '/system/component/history',
    page: false,
    where: historyTableWhere,
    cols: [{
        label: '时间',
        field: 'createDate'
    }, {
        label: '操作人',
        field: 'createBy',
        width: 150
    }]
})
function historyTableSelect(row){
    currentHistoryOldDate.value = row.createDate
    currentHistoryOldCreateBy.value = row.createBy
    $common.get('/system/component/history/detail', { id: row.id }).then(res => {
        historyOldCode.value = res.data
    })
}
function drawerClose(){
    historyEditorRef.value.dispose()
}
const treeContextmenu = ref([{
    key: 'addGroup',
    label: '添加分组',
    click: (node) => {
        createFile(node.id, 0)
    }
}, {
    key: 'addComponent',
    label: '添加组件',
    click: (node) => {
        createFile(node.id, 1)
    }
}, {
    key: 'updateComponent',
    label: '修改',
    click: (node) => {
        if(node.name.indexOf('(') !== -1){
            formData.name = analyzeName(node.name, true)
            formData.remark = analyzeName(node.name, false)
        }else{
            formData.name = node.name
        }
        updateComponent.value = true
        currentNodeId.value = node.id
        nameModal.value.show()
    }
}, {
    key: 'delete',
    label: '删除',
    click: (node) => {
        $common.handleDelete({
            url: '/system/component/delete',
            id: node.id,
            done(){
                treeRef.value.reload()
            }
        })
    }
}, {
    key: 'history',
    label: '历史记录',
    if(node){
        return !node.isGroup;
    },
    click: (node) => {
        openHistory(node)
    }
}])
function openHistory(node){
    currentNodeId.value = node.id
    currentNode.value = node
    showDrawer.value = true
    historyTableWhere.componentId = node.id
    $common.get('/system/component/getLastCode', { componentId: node.id }).then(res => {
        if(res.data){
            const { sourceCode, createDate, createBy } = res.data
            currentHistoryOldDate.value = createDate
            currentHistoryOldCreateBy.value = createBy
            historyOldCode.value = sourceCode
            if(monacoVolarRefs[currentNodeId.value]){
                historyCode.value = monacoVolarRefs[currentNodeId.value].getValue()
            }else{
                historyCode.value = sourceCode
            }
        }
    })
}
// 解析name
function analyzeName(str, outside){
    // 获取括号外 or 括号内
    const regexStr = outside ? /(.*?)(?=\()/ : /\((.*?)\)/;
    const match = str.match(regexStr);
    if (match) {
        return outside ? match[0].trim() : match[1];
    }
}
function createFile(id, type){
    formData.type = type
    formData.name = ''
    updateComponent.value = false
    currentNodeId.value = id
    nameModal.value.show()
}
function saveComponent(){
    dataForm.value.validate((errors) => {
        if (!errors) {
            $common.post('/system/component/save/tree',{
                [updateComponent.value ? 'id' : 'pid']: currentNodeId.value,
                ...formData
            }).then(() => {
                nameModal.value.hide()
                if(updateComponent.value){
                    tabs.value.forEach(it => {
                        if(it.id == currentNodeId.value){
                            it.name = formData.name
                        }
                    })
                }
                treeRef.value.reload()
            })
        }
    })
}
function nodeClick(option){
    if(!option.isGroup){
        if(tabs.value.some(it => it.id == option.id)){
            tabId.value = option.id
        }else{
            $common.get('/system/component/getSourceCode', { id: option.id }).then(res => {
                tabs.value.push({
                    id: option.id,
                    name: option.name,
                    code: res.data || '',
                    isSave: 0
                })
                tabId.value = option.id
            })
        }
    }
}

const dataForm = ref()
const rules = reactive({
    name: [{required: true, message: '请输入名称', trigger: 'change'}, {
        trigger: 'change',
        message: '名称只能包含大小写英文、数字和-_',
        validator: (rule, value) => {
            if(value){
                return /^[a-zA-Z0-9\-_]+$/.test(value)
            }
        }
    }],
    remark: [{
        trigger: 'change',
        message: '备注不能包含()',
        validator: (rule, value) => {
            return !/\(|\)/g.test(value)
        }
    }],
})

const tabs = ref([])
const tabId = ref()
function tabClose(id){
    const index = tabs.value.findIndex((it) => it.id == id);
    tabs.value.splice(index, 1);
    if(tabs.value.length > 0){
        tabId.value = tabs.value[tabs.value.length - 1].id
    }
    monacoVolarRefs[id] && monacoVolarRefs[id].dispose()
}
function setComponentRef(el, id){
    monacoVolarRefs[id] = el
}
function saveCode(){
    let id = tabId.value
    let tab = tabs.value.filter(it => it.id == id)[0]
    if(tab.isSave == 1){
        let sourceCode = monacoVolarRefs[id].getValue()
        tab.code = sourceCode
        tab.isSave = 0
        try{
            const { compileJs, compileCss } = compileCode(sourceCode)
            $common.post('/system/component/saveCode', {
                id,
                sourceCode,
                compileJs,
                compileCss
            }).then(() => {
                $message.success('编译并保存成功')
            })
        }catch (e){
            errorInfo.value = e
            errorInfoModal.value.show()
        }
    }
}
function onDidChangeModelContent(tab){
    if(monacoVolarRefs[tab.id].getValue() != tab.code){
        tab.isSave = 1
    }else{
        tab.isSave = 0
    }
}
function restoreToThisVersion(){
    monacoVolarRefs[tabId.value].setValue(historyOldCode.value)
    showDrawer.value = false
}
</script>
