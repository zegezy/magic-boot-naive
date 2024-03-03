<template>
    <div class="monaco-volar" style="width: 100%;height: 100%;"></div>
</template>

<script setup>
import { onMounted } from "vue";
import * as onigasm from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";
import * as monaco from "monaco-editor-core";
import {loadGrammars, loadTheme} from "monaco-volar";
import editorWorker from "monaco-editor-core/esm/vs/editor/editor.worker?worker";
import vueWorker from "monaco-volar/vue.worker?worker";
import templateData from "./mb-vue-init-template.vue?raw";
import * as volar from "@volar/monaco";

const props = defineProps({
    theme: {
        type: String,
        default: 'dark'// dark or light
    }
})

// 高亮代码
function loadOnigasm() {
    return onigasm.loadWASM(onigasmWasm);
}

async function setup() {
    self.MonacoEnvironment ??= {};
    self.MonacoEnvironment.getWorker ??= () => new editorWorker();

    const getWorker = self.MonacoEnvironment.getWorker;

    self.MonacoEnvironment.getWorker = (_, label) => {
        if (label === "vue") {
            return new vueWorker();
        }
        return getWorker();
    };

    const worker = monaco.editor.createWebWorker({
        moduleId: "vs/language/vue/vueWorker",
        label: "vue",
        createData: {},
    });
    const languageId = ["vue"];
    const getSyncUris = () => monaco.editor.getModels().map((model) => model.uri);
    volar.editor.activateMarkers(
        worker,
        languageId,
        "vue",
        getSyncUris,
        monaco.editor
    );
    volar.editor.activateAutoInsertion(worker, languageId, getSyncUris, monaco.editor);
    await volar.languages.registerProvides(
        worker,
        languageId,
        getSyncUris,
        monaco.languages
    );
}

function getModelUri(){
    return monaco.Uri.parse('file:///magic-boot.vue')
}

function getModel(){
    return monaco.editor.getModel(getModelUri())
}

function afterReady(theme) {

    monaco.languages.register({id: "vue", extensions: [".vue"]});
    monaco.languages.onLanguage("vue", setup);

    const model = monaco.editor.createModel(templateData, 'vue', getModelUri());
    const editorInstance = monaco.editor.create(document.querySelector('.monaco-volar'), {
        theme,
        model,
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

    loadGrammars(monaco, editorInstance);
}

onMounted(() => {
    Promise.all([loadOnigasm(), loadTheme(monaco.editor)]).then(
        ([, theme]) => {
            afterReady(theme[props.theme]);
        }
    );
})

function setValue(value){
    getModel().setValue(value)
}

function getValue(){
    return getModel().getValue()
}

defineExpose({ setValue, getValue })

</script>
