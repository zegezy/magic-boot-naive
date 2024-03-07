<template>
  <div
    ref="container"
    class="monaco-editor"
    :style="'height: ' + height + 'px'"
  ></div>
</template>

<script setup>
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  defineProps,
  reactive,
  ref,
  defineEmits,
  watch,
    nextTick,
    onBeforeUnmount,
    onMounted
} from "vue";

const props = defineProps({
  language: {
    type: String,
    default: "html",
  },
  oldValue: {
      type: String,
      default: `<template>
    1
</template>
<script setup>
import {ref} from 'vue'
<\/script>`
  },
  value: {
      type: String,
      default: `<template>
    2
</template>
<script setup>
import {ref} from 'vue'
3
<\/script>`
  },
  visible: Boolean,
  height: {
    type: Number,
    default: 380,
  },
});

watch(
  () => props.oldValue,
  (newValue) => {
    originalModel = monaco.editor.createModel(newValue, props.language);
    monacoDiffInstance.setModel({
      original: originalModel,
      modified: modifiedModel,
    });
  },
  { deep: true }
);
watch(
  () => props.value,
  (newValue) => {
    modifiedModel = monaco.editor.createModel(newValue, props.language);
    monacoDiffInstance.setModel({
      original: originalModel,
      modified: modifiedModel,
    });
  },
  { deep: true }
);
watch(
  () => props.visible,
  (newValue) => {
    newValue && nextTick(()=>{init()})
  },
  {
    immediate: true,
  }
);
const defaultOpts = reactive({
  value: "",
  theme: "IDLE", // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
  roundedSelection: false, // 右侧不显示编辑器预览框
  autoIndent: true, // 自动缩进
  readOnly: true, // 是否只读
  diffWordWrap:true,
  wordWrap:'on',
  automaticLayout:true,
  scrollBeyondLastLine:false,
  scrollbar:{
    verticalScrollbarSize: 0
  },
});
let originalModel;
let modifiedModel;
let monacoDiffInstance;
const container = ref(null);
function init() {
  monaco.editor.setTheme('IDLE')
  // 初始化编辑器实例
  monacoDiffInstance = monaco.editor.createDiffEditor(
    container.value,
    defaultOpts
  );
  originalModel = monaco.editor.createModel(
      props.oldValue,
    props.language
  );
  modifiedModel = monaco.editor.createModel(
      props.value,
    props.language
  );
  monacoDiffInstance.setModel({
    original: originalModel,
    modified: modifiedModel,
  });
}
onMounted(() => {
    init()
})
onBeforeUnmount(()=>{
    monacoDiffInstance.dispose()
})
</script>

<style lang="less">
.the-code-diff-editor-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  .monaco-editor .scroll-decoration {
    box-shadow: none;
  }
}
</style>
