<template>
    <div className="monaco-volar" style="width: 100%;height: 100%;"></div>
</template>

<script setup>
import {onMounted} from "vue";
import * as onigasm from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";
import * as monaco from "monaco-editor-core";
import {loadGrammars, loadTheme} from "monaco-volar";
import editorWorker from "monaco-editor-core/esm/vs/editor/editor.worker?worker";
import vueWorker from "monaco-volar/vue.worker?worker";
import data from "./mb-vue-init-template.vue?raw";
import * as volar from "@volar/monaco";


function loadOnigasm() {
    return onigasm.loadWASM(onigasmWasm);
}

loadOnigasm()


function loadMonacoEnv() {
    self.MonacoEnvironment = {
        async getWorker(_, label) {
            if (label === "vue") {
                return new vueWorker();
            }
            return new editorWorker();
        },
    };
}

loadMonacoEnv()


let initialized = false
let takeoverMode = false

async function setup() {

    if (initialized) {
        return;
    }
    initialized = true;

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
    const languageId = takeoverMode
        ? [
            "vue",
            "javascript",
            "typescript",
            "javascriptreact",
            "typescriptreact",
            "json",
        ]
        : ["vue"];
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

function afterReady(theme) {

    monaco.languages.register({id: "vue", extensions: [".vue"]});
    monaco.languages.onLanguage("vue", setup);

    const model = monaco.editor.createModel(data, 'vue', monaco.Uri.parse("file:///demo.vue"));
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
    Promise.all([loadMonacoEnv(), loadOnigasm(), loadTheme(monaco.editor)]).then(
        ([, , theme]) => {
            afterReady(theme.dark);
        }
    );
})

</script>
