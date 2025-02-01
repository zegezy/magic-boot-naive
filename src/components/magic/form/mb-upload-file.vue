<template>
    <n-upload
        :id="uploadDomId"
        class="upload-demo"
        ref="uploadRef"
        :action="actionUrl"
        :headers="headers"
        :directory-dnd="directoryDnd"
        @preview="onPreview"
        @remove="onRemove"
        :multiple="multiple"
        :limit="limit"
        :show-file-list="showFileList"
        @before-upload="beforeUpload"
        @finish="onFinish"
        @change="onChange"
        @error="onError"
        :file-list="fileList"
        :default-upload="defaultUpload"
    >
        <n-upload-dragger v-if="directoryDnd">
            <div>可拖拽上传</div>
            <n-button type="primary" :loading="uploadLoading" :disabled="!multiple && fileList.length == 1">
                {{
                    label
                }}
            </n-button>
            <div slot="tip" v-if="showTip" class="el-upload__tip">支持上传
                {{
                    getSettingSuffixs().replaceAll(',', '，')
                }}文件，且不超过{{ maxFileSize }}MB
            </div>
        </n-upload-dragger>
        <template v-else>
            <n-button type="primary" :loading="uploadLoading" :disabled="!multiple && fileList.length == 1">
                {{
                    label
                }}
            </n-button>
            <div slot="tip" v-if="showTip" class="el-upload__tip">支持上传
                {{
                    getSettingSuffixs().replaceAll(',', '，')
                }}文件，且不超过{{ maxFileSize }}MB
            </div>
        </template>
    </n-upload>
</template>

<script setup>
// 文件上传组件
import {ref, watch, onMounted} from 'vue'
import {useUserStore} from "@/store/modules/userStore";
import global from '@/scripts/global'

const userStore = useUserStore()
const emit = defineEmits(['change', 'update:modelValue'])
const props = defineProps({
    // 绑定值
    modelValue: {
        required: false
    },
    // 最大上传数量
    multiple: {
        type: Boolean,
        default: false
    },
    // 最大文件大小
    limit: {
        type: Number,
        default: 20
    },
    // 最大文件大小
    maxFileSize: {
        type: Number,
        default: 200
    },
    // 允许的文件类型
    accept: {
        type: String,
        default: ''
    },
    // 外部ID
    externalId: {
        type: String,
        default: ''
    },
    // 外部类型
    externalType: {
        type: String,
        default: ''
    },
    // 文件格式
    formats: {
        type: String,
        default: ''
    },
    // 上传按钮文字
    label: {
        type: String,
        default: '点击上传'
    },
    // 是否显示提示
    showTip: {
        type: Boolean,
        default: () => true
    },
    // 上传地址
    action: {
        type: String,
        default: ''
    },
    // 是否显示文件列表
    showFileList: {
        type: Boolean,
        default: () => true
    },
    // 上传成功回调
    onSuccess: {
        type: Function,
        default: () => {
        }
    },
    // 是否显示删除提示
    deleteTip: {
        type: Boolean,
        default: () => true
    },
    // 是否合并上传
    join: {
        type: Boolean,
        default: true
    },
    // 是否支持拖拽上传
    directoryDnd: {
        type: Boolean,
        default: false
    },
    // 是否自动上传
    defaultUpload: {
        type: Boolean,
        default: true
    }
})

const acceptList = {
    image: 'png,jpg,gif,jpeg',
    wps: 'pdf,pptx,xls,xlsx,csv,docx,doc',
    compress: 'zip,rar,7z',
    video: 'avi,flv,mp4,mpeg,mov'
}

const actionUrl = ref(global.baseApi + '/system/file/upload')
const headers = {
    token: userStore.getToken()
}
const uploadRef = ref()
const urls = ref([])
const uploadDomId = $common.uuid()
const fileList = ref([])
const uploadLoading = ref(false)
const emitUpdate = ref(true)

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
    if (props.externalId) {
        $common.get('/system/file/files', {
            externalId: props.externalId,
            externalType: props.externalType
        }).then(res => {
            const {data} = res
            fileList.value = data
        })
        actionUrl.value = actionUrl.value + `?externalId=${props.externalId}&externalType=${props.externalType}`
    } else {
        renderFile()
    }
    if (props.action) {
        actionUrl.value = global.baseApi + props.action
    }
})

function setFileList() {
    if (urls.value.length > 0) {
        fileList.value = urls.value.map(it => {
            return {
                name: it.substring(it.lastIndexOf('/') + 1),
                fullPath: it
            }
        })
    }
}

function renderFile() {
    if (props.multiple && props.join && props.modelValue) {
        urls.value = props.modelValue.split(',')
    } else {
        if (props.modelValue instanceof Array && props.modelValue.length > 0) {
            urls.value = props.modelValue
        } else {
            if (props.modelValue) {
                urls.value = [props.modelValue]
            }
        }
    }
    setFileList()
}

function onChange(data) {
    if (data.file.status != "removed") {
        fileList.value = data.fileList
    }
}

function onError() {
    uploadLoading.value = false
}

function updateValue(value) {
    emit('update:modelValue', value)
    emitUpdate.value = true
    emit('change', value)
}

function onRemove({file}) {
    let deleteFile = () => {
        let url = file.fullPath
        urls.value.splice(urls.value.indexOf(url), 1)
        fileList.value.forEach((it, i) => {
            if (it && url == it.fullPath) {
                fileList.value.splice(i, 1)
            }
        })
        if (props.multiple) {
            if (props.join) {
                updateValue(urls.value.join(','))
            } else {
                updateValue(urls.value)
            }
        } else {
            document.getElementById(uploadDomId).getElementsByClassName('n-upload-file-input')[0].removeAttribute('disabled')
            updateValue('')
        }
        $common.delete('/system/file/delete', {url: encodeURI(url)})
    }
    return new Promise((resolve, reject) => {
        if (!props.deleteTip) {
            deleteFile()
            resolve()
        } else {
            $dialog.warning({
                title: '提示',
                content: '确定要删除此文件吗?',
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: () => {
                    deleteFile()
                    resolve()
                },
                onClose: () => {
                    reject()
                }
            })
        }
    })
}

function onPreview(file) {
    window.open(global.baseApi + file.fullPath)
}

function onFinish({file, event}) {
    let res = JSON.parse((event?.target).response)
    file.fullPath = res.data.url
    uploadLoading.value = false
    if (res.data) {
        urls.value.push(res.data.url)
        if (props.multiple) {
            if (props.join) {
                updateValue(urls.value.join(','))
            } else {
                updateValue(urls.value)
            }
        } else {
            document.getElementById(uploadDomId).getElementsByClassName('n-upload-file-input')[0].setAttribute('disabled', '')
            updateValue(res.data.url)
        }
    }
    if (props.onSuccess) {
        props.onSuccess({file, event})
    }
    if (props.action) {
        urls.value = []
        fileList.value = []
        updateValue(urls.value.join(','))
    }
    return file
}

function getSettingSuffixs() {
    if (props.formats) {
        return props.formats
    }
    let suffixs = acceptList[props.accept]
    if (!suffixs) {
        suffixs = getAllSuffixs()
    }
    return suffixs
}

function beforeUpload({file}) {
    let fileName = file.name
    let accepts = props.accept.split(',')
    if (accepts) {
        for (let i = 0; i < accepts.length; i++) {
            if (!validAccept(fileName, accepts[i])) {
                $message.error('上传文件格式只能为：' + getSettingSuffixs().replaceAll(',', '，'))
                return false
            }
        }
    } else {
        if (!validAccept(fileName, 'null')) {
            $message.error('上传文件格式只能为：' + getAllSuffixs().replaceAll(',', '，'))
            return false
        }
    }

    const isLt2M = file.file.size / 1024 / 1024 < props.maxFileSize
    if (!isLt2M) {
        $message.error(`上传文件大小不能超过 ${props.maxFileSize}MB！`)
        return isLt2M
    }
    if (props.defaultUpload) {
        uploadLoading.value = true
    }
}

function getAllSuffixs() {
    let suffixs = ''
    for (const key in acceptList) {
        suffixs += acceptList[key] + ','
    }
    suffixs = suffixs.substring(0, suffixs.length - 1)
    return suffixs
}

function validAccept(fileName, accept) {
    if (props.formats) {
        return validEndsWith(fileName, props.formats)
    }
    if (accept && acceptList[accept]) {
        return validEndsWith(fileName, acceptList[accept])
    } else {
        return validEndsWith(fileName, getAllSuffixs())
    }
}

function validEndsWith(fileName, suffixs) {
    suffixs = suffixs.split(',')
    for (let i = 0; i < suffixs.length; i++) {
        const suffix = suffixs[i]
        if (fileName.toLowerCase().endsWith('.' + suffix)) {
            return true
        }
    }
    return false
}

function getFileList() {
    return fileList.value
}

defineExpose({getFileList})

</script>

<style scoped>
:deep(.n-upload) {
    display: block;
}
</style>
