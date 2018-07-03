/**
 * Created by xj on 2017/12/28.
 */
const crypto = require('crypto')
var oss = {
    OSSAccessKeyId: 'LTAILVSr6BkEHzTM',
    secret: 'bPaJY3lFaZiPjqdxNClsluyUhne33M',
    host: 'https://upload.8bnl.com' // 填你自己阿里云OSS的外网域名
}
const policy = async function (ctx, next) {
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        const dirPath = 'img/' // 上传后例子：http://cqq.oss-cn-shenzhen.aliyuncs.com/testOSS/1489388301901，若为空，上传的文件则放到object的根目录
        const {OSSAccessKeyId, host, secret} = oss;
        let end = new Date().getTime() + 360000
        let expiration = new Date(end).toISOString()
        let policyString = {
            expiration,
            conditions: [
                ['content-length-range', 0, 1048576000],
                ['starts-with', '$key', dirPath]
            ]
        }
        policyString = JSON.stringify(policyString)
        const policy = new Buffer(policyString).toString('base64')
        const signature = crypto.createHmac('sha1', secret).update(policy).digest('base64')
        ctx.state.code = 1;
        ctx.state.data = {
            OSSAccessKeyId: OSSAccessKeyId,
            host,
            policy,
            signature,
            saveName: end,
            startsWith: dirPath
        };
    } else {
        ctx.state.code = -1
        ctx.state.data = ctx.state.$wxInfo.msg
    }

}


module.exports = {policy: policy}