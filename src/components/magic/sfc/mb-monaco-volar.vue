<template>
    <div :class="monacoVolarClass" style="width: 100%;height: 100%;"></div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import * as monaco from "monaco-editor-core";
import {loadGrammars, loadTheme} from "monaco-volar";
import {registerNaiveMonacoCompletionProvider} from "../../../scripts/monaco/naiveui-monaco-prompt";

const props = defineProps({
    theme: {
        type: String,
        default: 'dark'// dark or light
    },
    fileName: {
        type: String,
        default: ''
    },
    code: {
        type: String,
        default: ''
    },
    oldCode: {
        type: String,
        default: ''
    },
    onSave: {
        type: Function,
        default: () => {}
    },
    onDidChangeModelContent: {
        type: Function,
        default: () => {}
    },
    compare: {
        type: Boolean,
        default: false
    }
})


watch(() => props.code, (value) => {
    setValue(value)
})
watch(() => props.oldCode, (value) => {
    setOldValue(value)
})
const monacoVolarClass = ref('monaco-volar' + $common.uuid())

function getModelUri(){
    let fileName = props.compare ? (props.fileName + 'compare') : props.fileName
    return monaco.Uri.parse(`file:///${fileName}.vue`)
}

function getOldModelUri(){
    return monaco.Uri.parse(`file:///${props.fileName}-old.vue`)
}

function getModel(){
    return monaco.editor.getModel(getModelUri())
}

function getOldModel(){
    return monaco.editor.getModel(getOldModelUri())
}
let editorInstance = null
let editorModel = null
let editorOldModel = null
function afterReady(theme) {
    editorModel = monaco.editor.createModel(props.code, 'vue', getModelUri());
    if(props.compare){
        editorInstance = monaco.editor.createDiffEditor(document.querySelector(`.${monacoVolarClass.value}`), {
            theme,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: {
                enabled: true,
            },
            inlineSuggest: {
                enabled: false,
            },
            "semanticHighlighting.enabled": true,
        })
        editorOldModel = monaco.editor.createModel(props.oldCode, 'vue', getOldModelUri());
        editorInstance.setModel({
            modified: editorModel,
            original: editorOldModel
        })
    }else{
        editorInstance = monaco.editor.create(document.querySelector(`.${monacoVolarClass.value}`), {
            theme,
            model: editorModel,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: {
                enabled: false,
            },
            inlineSuggest: {
                enabled: false,
            },
            "semanticHighlighting.enabled": true,
        })
        editorInstance.onDidChangeModelContent((e) => {
            props.onDidChangeModelContent(e)
        })
        addCommands()
        loadGrammars(monaco, editorInstance);
        // 注册naive-ui组件自动提示
        registerNaiveMonacoCompletionProvider(monaco);
    }
}

function addCommands(){
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function(ed) {
        props.onSave()
        // props.onSave(props.fileName)
        // 不能在 addCommand 回调里面 获取组件的变量并传出去 会有问题
    });
}

onMounted(() => {
    loadTheme(monaco.editor).then(theme => {
        afterReady(theme[props.theme]);
    })
})

function setValue(value){
    getModel().setValue(value)
}

function setOldValue(value){
    getOldModel().setValue(value)
}

function getValue(){
    return getModel().getValue()
}

function getOldValue(){
    return getOldModel().getValue()
}

function dispose(){
    editorModel && editorModel.dispose()
    editorOldModel && editorOldModel.dispose()
    editorInstance.dispose()
}

defineExpose({ setValue, setOldValue, getValue, getOldValue, dispose })

</script>
