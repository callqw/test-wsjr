/**
 * Created by xj on 2018/5/1.
 */
const http = require('axios')
const config = require('../../config');
const moment = require('moment')
const debug = require('debug')('koa-weapp-demo');
const sha1 = require('../../node_modules/wafer-node-sdk/lib/helper/sha1');
const aesDecrypt = require('../../node_modules/wafer-node-sdk/lib/helper/aesDecrypt');
const AuthDbService = require('../../module/authDbService')
const {ERRORS, LOGIN_STATE} = require('./../constants')
const unicode = require('../../module/unicode')
/**
 * Koa 授权中间件
 * 基于 authorization 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Promise}
 */
function authorizationMiddleware(ctx, next) {
    return authorization(ctx.req, ctx.request.body.userInfo).then(result => {
        ctx.state.$wxInfo = result;
        return next()
    })
}

async function login(ctx, next) {
    //登录授权中间件
    var result = await authorization(ctx.req).then(res=> {
        ctx.state.$wxInfo = res
        return next()
    });
}
function authorization(req, userInfo) {
    const {
        'x-wx-code': code,
        'x-wx-encrypted-data': encryptedData,
        'x-wx-iv': iv
    } = req.headers;
    // 检查 headers
    if ([code, encryptedData, iv].some(v =>!v)) {
        debug(ERRORS.ERR_HEADER_MISSED)
        throw new Error(ERRORS.ERR_HEADER_MISSED)
    }

    debug('Auth: code: %s, encryptedData: %s, iv: %s', code, encryptedData, iv);
    // 获取 session key
    return getSessionKey(code)
        .then(async pkg => {
            const {openid, session_key} = pkg
            // 生成 3rd_session
            const skey = sha1(session_key)
            //解密有出现乱码的情况，选择直接传用户信息注册
            // 解密数据
            // let decryptedData
            // try {
            //     decryptedData = aesDecrypt(session_key, iv, encryptedData)
            //     console.log(decryptedData, 'thiss');
            //     decryptedData = JSON.parse(decryptedData)
            // } catch (e) {
            //     debug('Auth: %s: %o', ERRORS.ERR_IN_DECRYPT_DATA, e)
            //     throw new Error(`${ERRORS.ERR_IN_DECRYPT_DATA}\n${e}`)
            //
            // }

            // 存储到数据库中
            userInfo.openId = openid
            var res = await AuthDbService.saveUserInfo(userInfo, skey, session_key);
            return {
                loginState: LOGIN_STATE.SUCCESS,
                userInfo: res
            };
        })
}
function getSessionKey(code) {

    const appid = config.appId
    const appsecret = config.appSecret

    return http({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        method: 'GET',
        params: {
            appid: appid,
            secret: appsecret,
            js_code: code,
            grant_type: 'authorization_code'
        }
    }).then(res => {
        res = res.data
        if (res.errcode || !res.openid || !res.session_key) {
            debug('%s: %O', ERRORS.ERR_GET_SESSION_KEY, res.errmsg)
            throw new Error(`${ERRORS.ERR_GET_SESSION_KEY}\n${JSON.stringify(res)}`)
        } else {
            debug('openid: %s, session_key: %s', res.openid, res.session_key)
            return res
        }
    })
}

/**
 * Koa 鉴权中间件
 * 基于 validation 重新封装
 * @param {koa context} ctx koa 请求上下文
 * @return {Promise}
 */
function validationMiddleware(ctx, next) {
    return validation(ctx.req).then(result => {
        ctx.state.$wxInfo = result
        return next()
    })
}

/**
 * 鉴权模块
 * @param {express request} req
 * @return {Promise}
 * @example 基于 Express
 * validation(this.req).then(loginState => { // ...some code })
 */
function validation(req) {
    const {'x-wx-skey': skey} = req.headers
    if (!skey) throw new Error(ERRORS.ERR_SKEY_INVALID)

    debug('Valid: skey: %s', skey)

    return AuthDbService.getUserInfoBySKey(skey)
        .then(result => {
            if (result.length === 0) throw new Error(ERRORS.ERR_SKEY_INVALID)
            else result = result[0]
            // 效验登录态是否过期
            const {last_visit_time: lastVisitTime, user_info: userInfo} = result
            const expires = config.wxLoginExpires && !isNaN(parseInt(config.wxLoginExpires)) ? parseInt(config.wxLoginExpires) * 1000 : 7200 * 1000
            if (moment(lastVisitTime, 'YYYY-MM-DD HH:mm:ss').valueOf() + expires < Date.now()) {
                debug('Valid: skey expired, middleware failed.')
                return {
                    loginState: LOGIN_STATE.FAILED,
                    userinfo: {},
                    msg: '校验过期,请重新登录'
                }
            } else {
                debug('Valid: middleware success.');
                var parse_userInfo = JSON.parse(userInfo);
                parse_userInfo.nickName = unicode.toUnicode.ToGB2312(parse_userInfo.nickName);
                return {
                    loginState: LOGIN_STATE.SUCCESS,
                    userinfo: parse_userInfo,
                    nowType: result.nowType,
                    bindMainId: result.id,
                    skey: result.skey,
                    banner: result.banner
                }
            }
        })
}


module.exports = {
    login: login,
    authorizationMiddleware: authorizationMiddleware,
    validation: validation,
    validationMiddleware: validationMiddleware
}