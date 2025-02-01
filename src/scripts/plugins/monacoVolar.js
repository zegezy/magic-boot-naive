import * as onigasm from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";
import * as monaco from "monaco-editor-core";
import * as volar from "@volar/monaco";
import editorWorker from "monaco-editor-core/esm/vs/editor/editor.worker?worker";
import vueWorker from "monaco-volar/vue.worker?worker";
import {registerNaiveMonacoCompletionProvider} from "@/scripts/monaco/naiveui-monaco-prompt";

// 高亮代码
function loadOnigasm() {
    return onigasm.loadWASM(onigasmWasm);
}

// 初始化
async function editorInit() {
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
    
    volar.editor.activateMarkers(worker, languageId, "vue", getSyncUris, monaco.editor);
    volar.editor.activateAutoInsertion(worker, languageId, getSyncUris, monaco.editor);
    
    // 注册 Vue 组件提示
    await volar.languages.registerProvides(worker, languageId, getSyncUris, monaco.languages);
}

export async function setupMonacoVolar() {
    await loadOnigasm()
    monaco.languages.register({id: "vue", extensions: [".vue"]});
    monaco.languages.onLanguage("vue", editorInit);
    // 注册组件提示
    registerNaiveMonacoCompletionProvider(monaco);
}
