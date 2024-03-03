<style scoped>
.tools svg{
    cursor: pointer;
}
</style>

<template>
    <n-split direction="horizontal" style="height: 100%" :default-size="0.15" :max="0.2" :min="0.1">
        <template #1>
            <div>
                <mb-tree
                    url="/system/component/tree"
                    :expand="false"
                    search
                    search-width="100%"
                    :checked="false"
                    :checkable="false"
                    show-line
                    @node-click="nodeClick"
                    :contextmenu="treeContextmenu"
                />
                <mb-modal ref="addSubDialog" title="添加下级" @confirm="addSub">
                    <mb-input v-model="nodeName" />
                </mb-modal>
            </div>
        </template>
        <template #2>
            <div class="flex flex-col h-full">
                <div style="height: 40px;border-bottom: 1px solid #ccc">
                    tab
                </div>
                <div class="tools flex flex-row items-center" style="padding:0px 5px; height: 30px;">
                    <mb-icon icon="save" color="black" size="1.5em" title="编译并保存" />
                </div>
                <div style="flex: 1">
                    <mb-monaco-volar ref="monacoVolar" />
                </div>
            </div>
        </template>
    </n-split>
</template>

<script setup>
import { ref } from 'vue'
const monacoVolar = ref()
const addSubDialog = ref()
const nodeName = ref()
const currentNodeId = ref()
const treeContextmenu = ref([{
    key: 'addSub',
    label: '添加下级',
    click: (node) => {
        currentNodeId.value = node.id
        addSubDialog.value.show()
    }
}])
function addSub(){
    $common.post('/system/component/save/tree',{ pid: currentNodeId.value, name: nodeName.value }).then(res => {
        addSubDialog.value.hide()
        nodeName.value = ''
    })
}
function nodeClick(option){
    if(!option.children){
        $common.get('/system/component/getSourceCode', { name: option.name }).then(res => {
            monacoVolar.value.setValue(res.data || '')
        })
    }
}
</script>
