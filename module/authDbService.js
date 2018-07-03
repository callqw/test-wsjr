const debug = require('debug')('koa-weapp-demo');
const uuidGenerator = require('uuid/v4')
const moment = require('moment')
const ERRORS = require('../controllers/constants').ERRORS
const mysql = require('./db')
const unicode = require('./unicode')
/**
 * 储存用户信息
 * @param {object} userInfo
 * @param {string} sessionKey
 * @return {Promise}
 */
var saveUserInfo = async function (userInfo, skey, session_key) {
    userInfo.nickName = await unicode.toUnicode.ToUnicode(userInfo.nickName)
    const uuid = uuidGenerator()
    const create_time = moment().format('YYYY-MM-DD HH:mm:ss')
    const last_visit_time = create_time
    const open_id = userInfo.openId;
    const user_info = JSON.stringify(userInfo)
    // 查重并决定是插入还是更新数据
    return new Promise((resolve, reject)=> {
        mysql('cSessionInfo').count('open_id as hasUser').where({
            open_id
        }).then((res)=> {
            if (res[0].hasUser) {
                //如果有就更新
                mysql('cSessionInfo').update({
                    uuid, skey, last_visit_time, session_key, user_info
                }).where({open_id}).then((res)=> {
                    mysql('cSessionInfo').select('*').where({skey}).then(async(res)=> {
                        if (res) {
                            userInfo = JSON.parse(res[0].user_info);
                            userInfo.id = res[0].id;
                            userInfo.nickName = await unicode.toUnicode.ToGB2312(userInfo.nickName)
                            resolve({
                                skey: skey,
                                userInfo: userInfo,
                            })
                        } else {
                            reject(res)
                        }
                    })
                })
            } else {
                //没有加插入
                mysql('cSessionInfo').insert({
                    uuid, skey, create_time, last_visit_time, open_id, session_key, user_info,paymentTime:1,banner:false
                }).then((res)=> {
                    if (res) {
                        mysql('cSessionInfo').select('*').where({skey}).then(async(res)=> {
                            if (res) {
                                userInfo = JSON.parse(res[0].user_info);
                                userInfo.id = res[0].id;
                                userInfo.nickName = await unicode.toUnicode.ToGB2312(userInfo.nickName)
                                resolve({
                                    skey: skey,
                                    userInfo: userInfo,
                                })
                            }
                        })
                    } else {
                        reject(res)
                    }
                })
            }
        }).catch(e => {
            debug('%s: %O', ERRORS.DBERR.ERR_WHEN_INSERT_TO_DB, e)
            throw new Error(`${ERRORS.DBERR.ERR_WHEN_INSERT_TO_DB}\n${e}`)
        })
    })
}

/**
 * 通过 skey 获取用户信息
 * @param {string} skey 登录时颁发的 skey 为登录态标识
 */
function getUserInfoBySKey(skey) {
    if (!skey) throw new Error(ERRORS.DBERR.ERR_NO_SKEY_ON_CALL_GETUSERINFOFUNCTION)
    return mysql('cSessionInfo').select('*').where({
        skey
    })
}

module.exports = {
    saveUserInfo,
    getUserInfoBySKey
}
