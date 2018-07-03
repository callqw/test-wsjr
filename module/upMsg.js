/**
 * Created by xj on 2018/5/16.
 */

const {ERRORS, LOGIN_STATE} = require('../controllers/constants')
const debug = require('debug')('koa-weapp-demo');
const uuidGenerator = require('uuid/v4')
const moment = require('moment')
const mysql = require('./db')
const unicode = require('./unicode')
const config = require('../config');
var date = new Date().getDate();
var month = new Date().getMonth() + 1;
var year = new Date().getFullYear();
var $Time = '' + year + '-' + month + '-' + date + ' 23:59:59'
var $lastTime = moment($Time, 'YYYY-MM-DD HH:mm:ss').valueOf()
$lastTime = Math.floor(($lastTime - Date.now()) / 1000);
var insertMsg = async function insertMsg(options) {
    var nickName = options.userinfo.nickName;
    nickName = await unicode.toUnicode.ToUnicode(nickName);
    var avatarUrl = options.userinfo.avatarUrl;
    avatarUrl = await unicode.escapein(avatarUrl);
    var WXid = options.WXid;
    var QRcode = options.QRcode;
    QRcode[0] = await unicode.escapein(QRcode[0]);
    const create_time = moment().format('YYYY-MM-DD HH:mm:ss');
    var lastVisite_time = create_time;
    var $_nowType = options.nowType;
    var bindMainId = options.bindMainId;
    var skey = options.skey;
    // if ($_nowType == 1) {
    //nowtype =1 表示普通用户 并已经发表个人二维码


    // } else {
    //查询是否有内容
    return mysql('fellow').count('bindMainId as hasUser').where({
        bindMainId
    }).then(async(res)=> {
        if (res[0].hasUser) {
            //更新
            var content = await selectFromFellow(bindMainId)
            var nowTime = Math.floor(Date.now() / 1000);
            let validataTime = content[0].validataTime;
            var lastVisiteTime = moment(content[0].lastVisite_time, 'YYYY-MM-DD HH:mm:ss').valueOf();
            lastVisiteTime = Math.floor(lastVisiteTime / 1000);
            if (nowTime - lastVisiteTime > validataTime) {
                //最后一次访问时间大于验证时间
                validataTime = $lastTime
                mysql('fellow').update({
                    WXid, nickName, QRcode, avatarUrl, create_time, bindMainId, lastVisite_time, validataTime
                }).where({
                    bindMainId
                }).then((res)=> {
                    if (res) {
                        return {
                            loginState: LOGIN_STATE.SUCCESS,
                            msg: '上传成功'
                        }
                    } else {
                        return {
                            loginState: LOGIN_STATE.NULL,
                            msg: 'error--0065'
                        }
                    }

                }).catch((e)=> {
                    return {
                        loginState: LOGIN_STATE.FAILED,
                        msg: e
                    }
                })
            } else {
                //小于最后一次访问时间
                return {
                    loginState: LOGIN_STATE.ONCE,
                    msg: '一天只能上传一次'
                }
            }

        } else {
            console.log('77')
            //增加新二维码
            var pv = 0;
            var nowType = 1;
            var validataTime = $lastTime;
            //修改主表类型
            return mysql('cSessionInfo').update({
                nowType
            }).where({
                skey
            }).then((res)=> {
                //类型增加成功，插入连接表新内容
                if (res === 1) {
                    return mysql('fellow').insert({
                        WXid, nickName, QRcode, avatarUrl, create_time, bindMainId, lastVisite_time, validataTime, pv
                    }).then((res)=> {
                        if (res) {
                            return {
                                loginState: LOGIN_STATE.SUCCESS,
                                msg: '上传完成'
                            }
                        } else {
                            return {
                                loginState: LOGIN_STATE.FAILED,
                                msg: '上传失败'
                            }
                        }
                    })
                } else {
                    return {
                        loginState: LOGIN_STATE.FAILED,
                        msg: '上传失败 错误代码--00110'
                    }
                }
            }).catch((e)=> {
                return {
                    loginState: LOGIN_STATE.FAILED,
                    msg: e
                }
            })

        }

    })
    // }

    // console.log(options);
    // return mysql('fellow').insert({
    //       WXid,nickName, QRcode,avatarUrl,
    // })
}
function selectFromFellow(bindMainId) {
    return mysql('fellow').select('*').where({
        bindMainId
    })
}
var upToAgree = function (options) {
    return new Promise((resolve, reject)=> {
        console.log(options.id, 'options.id')
        mysql('addPage').select('resP').where({
            id: options.id
        }).then((res)=> {
            console.log(res, 'idididid')
            if (res[0] != undefined || res[0].resP == 0) {
                mysql('addPage').update({
                    resP: true
                }).where({
                    id: options.id
                }).then((res)=> {
                    if (res) {
                        resolve({
                            loginState: LOGIN_STATE.SUCCESS,
                            msg: '添加成功'
                        })
                    } else {
                        resolve({
                            loginState: LOGIN_STATE.FAILED,
                            msg: '添加失败'
                        })
                    }

                })
            } else {
                resolve({
                    loginState: LOGIN_STATE.FAILED,
                    msg: '不能重复添加'
                })

            }
        }).catch((e)=> {
            resolve({
                loginState: LOGIN_STATE.FAILED,
                msg: e
            })
        })
    })
}
module.exports = {
    upMsg: insertMsg,
    upToAgree: upToAgree
}