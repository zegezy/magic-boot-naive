<template>
    <div :class="monacoVolarClass" style="width: 100%;height: 100%;"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as monaco from "monaco-editor-core";
import {loadGrammars, loadTheme} from "monaco-volar";

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
    onSave: {
        type: Function,
        default: () => {}
    }
})

const monacoVolarClass = ref('monaco-volar' + $common.uuid())

function getModelUri(){
    return monaco.Uri.parse(`file:///${props.fileName}.vue`)
}

function getModel(){
    return monaco.editor.getModel(getModelUri())
}
let editorInstance = null
let editorModel = null
function afterReady(theme) {

    editorModel = monaco.editor.createModel(props.code, 'vue', getModelUri());
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
    addCommands()
    loadGrammars(monaco, editorInstance);
}

function addCommands(){
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function(ed) {
        props.onSave(getValue())
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

function getValue(){
    return getModel().getValue()
}

function dispose(){
    editorModel.dispose()
    editorInstance.dispose()
}

defineExpose({ setValue, getValue, dispose })

</script>
