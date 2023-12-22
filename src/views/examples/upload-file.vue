<template>
    <div style="padding: 50px;">
        <h2>上传文件（单文件）</h2>
        <mb-upload-file v-model="fileUrl" @change="fileChange"/>
        <h2>上传文件（多文件）</h2>
        <mb-upload-file v-model="fileUrls" @change="multipleFileChange" multiple directory-dnd/>
<!--        <h2>上传图片（id）</h2>-->
<!--        <mb-upload-image :external-id="externalId" multiple :external-type="externalType"/>-->
<!--        <h2>上传图片（url、单图）</h2>-->
<!--        <mb-upload-image v-model="imgUrl" @change="imgChange" tip="建议上传尺寸：710*345"/>-->
        <h2>上传图片（url、多图）</h2>
        <mb-upload-image v-model="multipleImgUrl" :width="120" :height="120" multiple :limit="3"
                         @change="multipleImgChange"/>
        <h2>oss分片上传</h2>
        <mb-upload-oss-file v-model="ossUrls" width="300px" height="300px" @change="ossChange" accept="image"/>
    </div>
</template>

<script>

export default {
    name: 'UploadFile',
    data() {
        return {
            externalId: $common.uuid(),
            externalType: '营业执照',
            imgUrl: '',
            multipleImgUrl: '',
            fileUrl: '',
            fileUrls: '',
            ossUrls: ''
        }
    },
    methods: {
        fileChange() {
            console.log(this.fileUrl)
        },
        multipleFileChange() {
            // console.log(this.fileUrls)
        },
        imgChange() {
            console.log(this.imgUrl)
        },
        multipleImgChange() {
            console.log(this.multipleImgUrl)
        },
        ossChange() {
            console.log(this.ossUrls)
        }
    },
    created() {
        setTimeout(() => {
          // this.ossUrls = 'dev/userfiles/2022-11-12/5382dc0f1c4644ad97ff02ae2047b74c/黑加仑.jpg'
            this.multipleImgUrl = 'userfiles/2023-04-23/9813b1d645ba492a8863248b1941984c/图片的副本3.png'
        },1000)
        setTimeout(() => {
            // this.ossUrls = 'dev/userfiles/2022-11-12/5382dc0f1c4644ad97ff02ae2047b74c/黑加仑.jpg'
            this.multipleImgUrl = 'userfiles/2023-04-23/9813b1d645ba492a8863248b1941984c/图片的副本3.png,userfiles/2023-04-23/ef6861a0b5a341e29546e8fba30fc2e9/图片的副本8.png'
        },2000)
    }
}
</script>
