<template>
    <lay-layer v-model="$global.modal.modalMap[modalId].value" v-bind="layerOptions">
        <div style="padding: 20px">
            <slot />
        </div>
    </lay-layer>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { layer } from '@layui/layer-vue';
const modalId = $common.uuid()
$global.modal.create(modalId);
const emit = defineEmits(['confirm'])
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    width: {
        type: String,
        default: 'auto'
    },
    height: {
        type: String,
        default: 'auto'
    },
    shadeClose: {
        type: Boolean,
        default: false
    },
    shade: {
        type: Boolean,
        default: true
    },
    resize: {
        type: Boolean,
        default: true
    },
    maxmin: {
        type: Boolean,
        default: true
    },
    shadeOpacity: {
        type: String,
        default: '.4'
    },
    showFooter: {
        type: Boolean,
        default: true
    },
    buttons: {
        type: Array,
        default: undefined
    }
})
const layerOptions = reactive({
    title: props.title,
    zIndex: $global.modal.getIndex(modalId),
    shade: props.shade,
    resize: props.resize,
    maxmin: props.maxmin,
    shadeOpacity: props.shadeOpacity,
    shadeClose: props.shadeClose,
    area: [props.width, props.height],
    btn: !props.showFooter ? [] : props.buttons !== undefined ? props.buttons : [
        {
            text: "确定",
            callback: () => {
                confirm()
            }
        },
        {
            text: "取消",
            callback: () => {
                hide()
            }
        }
    ]
})
watch(() => props.title, (value) => {
    layerOptions.title = value
})

const confirmLoading = ref(false)

function show() {
    $global.modal.show(modalId)
}

function hide() {
    $global.modal.hide(modalId)
}

function loading() {
    confirmLoading.value = layer.load(1)
}

function hideLoading() {
    layer.close(confirmLoading.value)
}

function confirm() {
    emit('confirm', {
        loading,
        hideLoading,
        hide,
        title: props.title
    })
}


defineExpose({show, hide, loading, hideLoading})
</script>

<style>
.layui-layer-title{
    font-size: 16px;
}
.layui-layer-btn .layui-layer-btn0 {
    background-color: #2D8CF0FF;
    border-color: #2D8CF0FF;
}
.layui-layer-setwin i:hover {
    color: #2D8CF0FF
}
.layui-layer{
    max-height: 100%;
    max-width: 100%;
}
</style>
