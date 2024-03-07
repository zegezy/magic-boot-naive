<style scoped>
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
        <n-split direction="horizontal" style="height: 100%" :default-size="0.15" :max="0.2" :min="0.1">
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
                    <mb-modal ref="nameModal" :title="updateComponent ? '修改': '添加下级'" @confirm="saveComponent">
                        <mb-input v-model="nodeNameInput" />
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
                        <n-button type="primary" color="#42b883" @click="createFile('0')">新建文件夹/文件</n-button>
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
                        <n-tab-pane
                            v-for="tab in tabs"
                            :key="tab.id"
                            :tab="tab.name"
                            :name="tab.id"
                            display-directive="show"
                            class="h-full w-full"
                            style="padding: 0px"
                        >
                            <div class="flex flex-col h-full">
                                <div class="tools flex flex-row items-center" style="padding:0px 5px; height: 30px;">
                                    <mb-icon icon="save" color="black" size="1.5em" title="编译并保存" @click="saveCode()" />
                                </div>
                                <div style="flex: 1">
                                    <mb-monaco-volar
                                        :ref="(el) => setComponentRef(el, tab.id)"
                                        :code="tab.code"
                                        :file-name="tab.id"
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
                    <div class="compare flex-1">
                        <mb-monaco-volar
                            compare
                            ref="historyEditorRef"
                            :code="historyCode"
                            :old-code="historyOldCode"
                            :file-name="currentNodeId"
                        />
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
const nodeNameInput = ref()
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
    $common.get('/system/component/history/detail', { id: row.id }).then(res => {
        historyOldCode.value = res.data
    })
}
function drawerClose(){
    historyEditorRef.value.dispose()
}
const treeContextmenu = ref([{
    key: 'addSub',
    label: '添加下级',
    click: (node) => {
        createFile(node.id)
    }
}, {
    key: 'updateComponent',
    label: '修改',
    click: (node) => {
        nodeNameInput.value = node.name
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
    click: (node) => {
        currentNodeId.value = node.id
        currentNode.value = node
        showDrawer.value = true
        historyTableWhere.componentId = node.id
        if(monacoVolarRefs[currentNodeId.value]){
            historyCode.value = monacoVolarRefs[currentNodeId.value].getValue()
        }else{
            // todo 获取最后一次的代码更新
        }
    }
}])
function createFile(id){
    nodeNameInput.value = ''
    updateComponent.value = false
    currentNodeId.value = id
    nameModal.value.show()
}
function saveComponent(){
    $common.post('/system/component/save/tree',{
        [updateComponent.value ? 'id' : 'pid']: currentNodeId.value,
        name: nodeNameInput.value
    }).then(() => {
        nameModal.value.hide()
        if(updateComponent.value){
            tabs.value.forEach(it => {
                if(it.id == currentNodeId.value){
                    it.name = nodeNameInput.value
                }
            })
        }
        treeRef.value.reload()
    })
}
function nodeClick(option){
    if(!option.children){
        if(tabs.value.some(it => it.id == option.id)){
            tabId.value = option.id
        }else{
            $common.get('/system/component/getSourceCode', { id: option.id }).then(res => {
                tabs.value.push({
                    id: option.id,
                    name: option.name,
                    code: res.data || ''
                })
                tabId.value = option.id
            })
        }
    }
}

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
    let sourceCode = monacoVolarRefs[id].getValue()
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
</script>
