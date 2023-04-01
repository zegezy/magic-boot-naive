import OSS from "ali-oss";
import common from '@/scripts/common'
import global from '@/scripts/global'

const init = async () => {
    let stsInfo = {}
    await common.$get('/oss/sts/service').then(res => {
        stsInfo = res.data
    })
    const client = new OSS({
        // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
        region: 'oss-cn-beijing',
        // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
        accessKeyId: stsInfo.accessKeyId,
        accessKeySecret: stsInfo.accessKeySecret,
        // 从STS服务获取的安全令牌（SecurityToken）。
        stsToken: stsInfo.stsToken,
        refreshSTSToken: async () => {
            // 向您搭建的STS服务获取临时访问凭证。
            let info = {}
            await common.$get('/oss/sts/service').then(res => {
                info = res.data
            })
            return {
                accessKeyId: info.accessKeyId,
                accessKeySecret: info.accessKeySecret,
                stsToken: info.stsToken
            }
        },
        // 刷新临时访问凭证的时间间隔，单位为毫秒。
        refreshSTSTokenInterval: 30000,
        // 填写Bucket名称。
        bucket: global.config.bucketDomain
    });
    return client
}

export default {
    init
}
