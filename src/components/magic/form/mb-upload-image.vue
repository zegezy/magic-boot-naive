<template>
    <div>
        <n-image-group>
            <draggable
                v-model="urls"
                class="vue-draggable"
                tag="div"
                draggable=".draggable-item"
                @end="onDragEnd"
                item-key="id"
            >
                <template #item="{ element }">
                    <div class="draggable-item" :style="{ width: width + 'px', height: height + 'px' }">
                        <n-image :src="$global.baseApi + element"/>
                        <div class="tools">
                            <div class="shadow" @click="handleDelete(element)">
                                <n-icon size="20">
                                    <Trash/>
                                </n-icon>
                            </div>
                            <div class="shadow" @click="beforeCropper(element)">
                                <n-icon size="20">
                                    <Crop/>
                                </n-icon>
                            </div>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <n-upload
                        v-if="(!multiple && urls.length == 0) || (multiple && urls.length < limit)"
                        class="uploadBox"
                        :style="{ width: width + 'px', height: height + 'px' }"
                        :action="action"
                        :headers="headers"
                        accept=".jpg,.jpeg,.png,.gif"
                        directory-dnd
                        :show-file-list="false"
                        :multiple="multiple"
                        :max="limit"
                        @change="onChange"
                        @finish="onFinish"
                        @error="onError"
                        @before-upload="beforeUpload"
                        :file-list="fileList"
                        :disabled="disabled"
                    >
                        <n-upload-dragger>
                            <n-icon size="30" class="uploadIcon">
                                <span class="draggable-text">可拖拽上传</span>
                                <Add/>
                                <span v-show="isUploading" class="uploading">正在上传...</span>
                                <span v-if="!isUploading && limit && limit!==99 && multiple"
                                      class="limitTxt">最多{{ limit }}张</span>
                            </n-icon>
                        </n-upload-dragger>
                    </n-upload>
                </template>
            </draggable>
        </n-image-group>
        <div v-if="tip" :style="{ color: tipColor }">{{ tip }}</div>
        <mb-modal ref="cropperDialog" @confirm="cropper">
            <div class="cropper-content">
                <div class="cropper" style="text-align:center">
                    <vueCropper
                        ref="cropperRef"
                        v-bind="cropperOption"
                        :outputSize="cropperOption.outputSize === undefined ? 0.8 : cropperOption.outputSize"
                        :outputType="cropperOption.outputType === undefined ? 'jpeg' : cropperOption.outputType"
                        :canMove="cropperOption.canMove === undefined ? true : cropperOption.canMove"
                        :canMoveBox="cropperOption.canMoveBox === undefined ? true : cropperOption.canMoveBox"
                        :autoCrop="cropperOption.autoCrop === undefined ? true : cropperOption.autoCrop"
                        :centerBox="cropperOption.centerBox === undefined ? true : cropperOption.centerBox"
                    />
                </div>
            </div>
        </mb-modal>
    </div>
</template>

<script setup>
import 'vue-cropper/dist/index.css'
import {ref, watch, onMounted} from 'vue'
import {VueCropper} from 'vue-cropper'
import draggable from 'vuedraggable'
import {Trash, Crop, Add} from "@vicons/ionicons5";
import {useUserStore} from "@/store/modules/userStore";
import global from '@/scripts/global'
import request from '@/scripts/request'

const emit = defineEmits(['update:modelValue', 'change'])
const props = defineProps({
    modelValue: {
        required: false
    },
    externalId: {
        type: String,
        default: ''
    },
    externalType: {
        type: String,
        default: ''
    },
    multiple: {
        type: Boolean,
        default: false
    },
    limit: {
        type: Number,
        default: 2
    },
    cropperConfig: {
        type: Object,
        default: () => {
        }
    },
    width: {
        type: Number,
        default: 100
    },
    height: {
        type: Number,
        default: 100
    },
    tip: {
        type: String,
        default: ''
    },
    tipColor: {
        type: String,
        default: ''
    },
    deleteTip: {
        type: Boolean,
        default: () => true
    },
    join: {
        type: Boolean,
        default: true
    }
})

const userStore = useUserStore()
const action = ref(global.baseApi + '/system/file/upload')
const headers = {token: userStore.getToken()}
const disabled = ref(false)
const isUploading = ref(false)
const cropperOption = ref({})
const urls = ref([])
const fileList = ref([])
const emitUpdate = ref(true)
const cropperDialog = ref()
const cropperRef = ref()

watch(() => props.modelValue, () => {
    if (emitUpdate.value) {
        emitUpdate.value = false
        if (fileList.value.length == 0) {
            renderFile()
        }
    } else {
        renderFile()
    }
})

onMounted(() => {
    cropperOption.value = props.cropperConfig || {}
    cropperOption.value.img = ''
    if (props.externalId) {
        $common.get('/system/file/files', {
            externalId: props.externalId,
            externalType: props.externalType
        }).then(res => {
            urls.value = res.data
        })
        action.value = action.value + `?externalId=${props.externalId}&externalType=${props.externalType}`
    } else {
        renderFile()
    }
})

function renderFile() {
    if (props.multiple && props.join && props.modelValue) {
        urls.value = props.modelValue.split(',')
    } else {
        if (props.modelValue instanceof Array) {
            urls.value = props.modelValue
            fileList.value = urls.value.map(it => {
                return {fullPath: it}
            })
        } else {
            if (props.modelValue) {
                urls.value.push(props.modelValue)
            }
        }
    }
}

function updateValue(value) {
    emit('update:modelValue', value)
    emitUpdate.value = true
    emit('change', value)
}

function handleDelete(url) {
    let deleteFile = () => {
        urls.value = urls.value.filter(it => it != url)
        fileList.value = fileList.value.filter(it => it.fullPath != url)
        $common.delete('/system/file/delete', {url: encodeURI(url)})
        if (props.multiple) {
            if (props.join) {
                updateValue(urls.value.join(','))
            } else {
                updateValue(urls.value)
            }
        } else {
            updateValue('')
        }
    }
    if (!props.deleteTip) {
        deleteFile()
    } else {
        $dialog.warning({
            title: '提示',
            content: '确定要删除此图片吗?',
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: () => {
                deleteFile()
            }
        })
    }
}

function onChange(data) {
    fileList.value = data.fileList
}

function beforeUpload() {
    isUploading.value = true
}

function onError() {
    isUploading.value = false
}

function onFinish({file, event}) {
    let res = JSON.parse((event?.target).response)
    file.fullPath = res.data.url
    urls.value.push(res.data.url)
    if (props.multiple) {
        if (props.join) {
            updateValue(urls.value.join(','))
        } else {
            updateValue(urls.value)
        }
    } else {
        updateValue(res.data.url)
    }
    onDragEnd()
    isUploading.value = false
    return file
}

function onDragEnd() {
    $common.get('/system/file/resort', {urls: urls.value.map(url => encodeURI(url)).join(',')})
}

function beforeCropper(url) {
    cropperOption.value.img = global.baseApi + url
    cropperOption.value.relativeImg = url
    cropperDialog.value.show()
}

function cropper() {
    let relativeImg = cropperOption.value.relativeImg
    cropperRef.value.getCropBlob((data) => {
        let dataFile = new File([data], relativeImg.substring(relativeImg.lastIndexOf('/') + 1), {
            type: data.type,
            lastModified: Date.now()
        })
        let formData = new FormData()
        formData.append('file', dataFile)
        formData.append('url', encodeURI(relativeImg))
        request({
            url: '/system/file/cropper',
            method: 'post',
            data: formData
        }).then(res => {
            fileList.value[fileList.value.map(fl => fl.fullPath).indexOf(relativeImg)].fullPath = res.data.url
            urls.value[urls.value.indexOf(relativeImg)] = res.data.url
            cropperDialog.value.hide()
        })
    })
}

</script>

<style lang="less" scoped>
.uploadIcon {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fbfdff;
    border-radius: 6px;
    font-size: 20px;
    color: #999;

    .limitTxt,
    .uploading {
        position: absolute;
        bottom: 10%;
        left: 0;
        width: 100%;
        font-size: 14px;
        text-align: center;
    }

    .draggable-text {
        position: absolute;
        top: 10%;
        left: 0;
        width: 100%;
        font-size: 14px;
        text-align: center;
    }
}

.vue-draggable {
    display: flex;
    flex-wrap: wrap;

    .draggable-item {
        margin-right: 5px;
        margin-bottom: 5px;
        box-sizing: border-box;
        border: 1px solid #ddd;
        border-radius: 6px;
        position: relative;
        overflow: hidden;

        :deep(.n-image), :deep(.n-image img) {
            width: 100%;
            height: 100%;
        }

        :deep(.n-upload) {
            width: 100%;
            height: 100%;
            display: block;
        }

        .tools {
            position: absolute;
            top: 0px;
            width: 100%;
            height: 20px;
        }

        .shadow {
            display: inline-block;
            background-color: rgba(0, 0, 0, .5);
            opacity: 0;
            transition: opacity .3s;
            color: #fff;
            font-size: 20px;
            line-height: 20px;
            padding: 2px;
            cursor: pointer;
        }

        &:hover {
            .shadow {
                opacity: 1;
            }
        }
    }

    &.hideShadow {
        .shadow {
            display: none;
        }
    }

    &.single {
        overflow: hidden;
        position: relative;

        .draggable-item {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1;
        }
    }

    &.maxHidden {
        .uploadBox {
            display: none;
        }
    }
}

.cropper-content {
    .cropper {
        width: auto;
        height: 300px;
    }
}

:deep(.n-upload-trigger) {
    width: 100%;
    height: 100%;
}

:deep(.n-upload-dragger) {
    height: 100%;
    padding: 0px;
}
</style>
