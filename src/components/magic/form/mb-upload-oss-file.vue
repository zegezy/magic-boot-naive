<style scoped>
ul {
    list-style: none;
    font-size: 14px;
    width: 100%;
    overflow: auto;
}

:deep(.el-progress__text) {
    min-width: 20px;
}

li {
    padding: 10px;
    border-radius: 5px;
    min-height: 40px;
}

li:hover {
    background: #F5F7FA;
}

.progress {
    display: inline-block;
    width: calc(100% - 15px);
}

.delete {
    display: inline-block;
    vertical-align: middle;
    margin-top: 3px;
    cursor: pointer;
}

.file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>

<template>
    <div>
        <div v-if="!readonly">
            <n-button @click="btnClick">点击上传</n-button>
            <div slot="tip" class="el-upload__tip">支持上传{{ getSettingSuffixs().replaceAll(',', '，') }}文件</div>
        </div>
        <div style="font-size: 16px; font-weight: bold" v-if="readonly && (!fileList || fileList.length == 0)">
            没有文件
        </div>
        <input ref="fileInput" type="file" multiple @change="fileChange" :accept="accept" style="display: none"/>
        <ul :style="{ width, height }">
            <li v-for="file in fileList" :title="file.name">
                <div class="file-name">
                    {{ file.name }}
                </div>
                <div class="progress">
                    <n-progress :percentage="file.progress" :status="file.progress == 100 ? 'success' : ''"/>
                </div>
                <div class="delete" v-if="file.progress == 100 && !readonly">
                    <n-icon color="red" @click="deleteFile(file.key)">
                        <Trash/>
                    </n-icon>
                </div>
                <div v-if="file.progress == 100">
                    <a style="color: blue;cursor: pointer" @click="preview(file.key)" target="_blank">点击查看</a>
                </div>
            </li>
        </ul>
        <mb-modal ref="videoDialog" title="预览视频" :show-footer="false">
            <mb-video :url="currentUrl"/>
        </mb-modal>
        <mb-modal ref="imageDialog" title="预览图片" :show-footer="false">
            <n-image style="margin: 0 auto;display: table" :src="currentUrl"/>
        </mb-modal>
    </div>
</template>

<script setup>
// OSS文件上传组件
import ossutil from '@/scripts/ossutil'
import global from '@/scripts/global'
import {Trash, Crop, Add} from "@vicons/ionicons5";
import {ref, onMounted, watch, nextTick} from 'vue'

const emit = defineEmits(['update:modelValue', 'change'])
const props = defineProps({
    // 绑定值
    modelValue: String,
    // 组件宽度
    width: String,
    // 组件高度
    height: String,
    // 允许上传的文件类型
    accept: {
        type: String,
        default: ''
    },
    // 允许上传的文件格式
    formats: {
        type: String,
        default: ''
    },
    // 是否只读模式
    readonly: {
        type: Boolean,
        default: false
    }
})
const videoDialog = ref()
const imageDialog = ref()
const currentUrl = ref()
const emitUpdate = ref(true)

watch(() => props.modelValue, (value) => {
    if (emitUpdate.value) {
        emitUpdate.value = false
        if (fileList.value.length == 0) {
            fileList.value = renderFileList(value)
        }
    } else {
        fileList.value = renderFileList(value)
    }
})

function preview(key) {
    key = key.substring(0, key.lastIndexOf('/') + 1) + encodeURIComponent(key.substring(key.lastIndexOf('/') + 1))
    let fileUrl = global.filePrefix + key
    currentUrl.value = fileUrl
    let suffix = key.substring(key.lastIndexOf('\.') + 1)
    suffix = suffix.toLocaleLowerCase()
    if (suffix == 'mp4') {
        videoDialog.value.hide()
        nextTick(() => {
            videoDialog.value.show()
        })
    } else if (acceptList.value['image'].indexOf(suffix) != -1) {
        imageDialog.value.hide()
        nextTick(() => {
            imageDialog.value.show()
        })
    } else {
        window.open(fileUrl)
    }
}

function renderFileList(urls) {
    let fileList = []
    if (urls) {
        let urlArray = urls.split(',')
        for (let i = 0; i < urlArray.length; i++) {
            fileList.push({
                key: urlArray[i],
                name: urlArray[i].substring(urlArray[i].lastIndexOf('/') + 1),
                progress: 100
            })
        }
    }
    return fileList
}

function updateModelValue() {
    let urls = fileList.value.filter(it => it.progress == 100).map(it => it.key).join(',')
    emit('update:modelValue', urls)
    emitUpdate.value = true
    emit('change', urls)
}

const progress = ref()
const fileList = ref(renderFileList(props.modelValue))
const fileInput = ref()

let ossClient = {}
onMounted(async () => {
    ossClient = await ossutil.init()
})

function btnClick() {
    fileInput.value.click();
}

// 删除文件
function deleteFile(url) {
    fileList.value.forEach((it, i) => {
        if (it.key == url) {
            fileList.value.splice(i, 1)
        }
    })
    updateModelValue()
    ossClient.delete(url);
}

//上传属性
const options = {
    // 获取分片上传进度、断点和返回值。
    progress: (p, cpt, res) => {
        if (p && p == 1) {// 小文件 上传很快的情况
            updateModelValue()
        }
        if (cpt) {
            fileList.value.forEach(file => {
                if (file.key == cpt.name) {
                    file.progress = (Math.round(p * 10000) / 100)
                    if (file.progress == 100) {
                        updateModelValue()
                    }
                }
            })
        }
    },
    // 设置并发上传的分片数量。
    parallel: 1,
    // 设置分片大小。默认值为1 MB，最小值为100 KB。
    partSize: 1024 * 100
}


// 文件上传
function fileChange() {
    const files = fileInput.value.files;
    let valid = true
    files.forEach(file => {
        let fileName = file.name
        let accepts = props.accept.split(',')
        if (accepts) {
            for (let i = 0; i < accepts.length; i++) {
                if (!validAccept(fileName, accepts[i]) && valid) {
                    alert('上传文件格式只能为：' + getSettingSuffixs().replaceAll(',', '，'))
                    valid = false
                }
            }
        } else {
            if (!validAccept(fileName, 'null') && valid) {
                alert('上传文件格式只能为：' + getAllSuffixs().replaceAll(',', '，'))
                valid = false
            }
        }
    })
    if (!valid) {
        return
    }
    let uploadDirs = []
    $common.get('/system/file/getFileUploadDirectory', {length: files.length}).then(dirRes => {
        uploadDirs = dirRes.data
        let _fileList = []
        uploadDirs.forEach((uploadDir, i) => {
            let fileUrl = uploadDir + files[i].name;
            _fileList.push({key: fileUrl, name: files[i].name, progress: 100, file: files[i]})
        })
        fileList.value.push(..._fileList)
        _fileList.forEach(file => {
            ossClient.multipartUpload(file.key, file.file, {
                ...options,
            });
        })
        fileInput.value.value = ''
    })
}

const acceptList = ref({
    image: 'png,jpg,gif,jpeg',
    wps: 'pdf,pptx,xls,xlsx,csv,docx,doc',
    compress: 'zip,rar,7z',
    video: 'avi,flv,mp4,mpeg'
})

function getSettingSuffixs() {
    if (props.formats) {
        return props.formats
    }
    let suffixs = acceptList.value[props.accept]
    if (!suffixs) {
        suffixs = getAllSuffixs()
    }
    return suffixs
}

function getAllSuffixs() {
    let suffixs = ''
    for (const key in acceptList.value) {
        suffixs += acceptList.value[key] + ','
    }
    suffixs = suffixs.substring(0, suffixs.length - 1)
    return suffixs
}

function validAccept(fileName, accept) {
    if (props.formats) {
        return validEndsWith(fileName, props.formats)
    }
    if (accept && acceptList.value[accept]) {
        return validEndsWith(fileName, acceptList.value[accept])
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


</script>
