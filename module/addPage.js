/**
 * Created by xj on 2018/5/21.
 */
const {ERRORS, LOGIN_STATE} = require('../controllers/constants')
const debug = require('debug')('koa-weapp-demo');
const uuidGenerator = require('uuid/v4')
const moment = require('moment')
const mysql = require('./db')
const unicode = require('./unicode')
const config = require('../config');
const create_time = moment().format('YYYY-MM-DD HH:mm:ss')
var addPage = async function (options) {
    console.log(options,'13131313')
    var addA = options.addA;
    var addB = options.addB;
    var resP = options.resP;
    var pv = options.pv + 1;
    var bindMainId = options.addB
    var nickName = options.nickName
    var $_nickName = options.$_nickName
    nickName = await unicode.toUnicode.ToUnicode(nickName)
    $_nickName = await unicode.toUnicode.ToUnicode($_nickName)
    var avatarUrl = options.avatarUrl
    var $_avatarUrl = options.$_avatarUrl
    var val_A = false;
    var val_B = false;
    if (addA != addB) {
        return mysql('addPage').select('*').where({
            addA: addA, addB: addB
        }).then((res)=> {
            console.log(res,'2777')
            if (res[0] == undefined) {
                val_A = false
            } else {
                val_A = true;
            }
            return mysql('addPage').select('*').where({
                addA: addB, addB: addA
            }).then((res)=> {
                if (res[0] == undefined) {
                    val_B = false
                } else {
                    val_B = true;
                }
                console.log(val_A,val_B,'2777')
                if (val_A == true || val_B == true) {
                    return {
                        loginState: LOGIN_STATE.FAILED,
                        msg: '不能重复发送'
                    }
                } else {
                    return mysql('addPage').insert({
                        addA, addB, create_time, resP, bindMainId, nickName, avatarUrl,$_nickName,$_avatarUrl
                    }).then((res)=> {
                        if (res) {
                           return mysql('vip').count('bindMainId as has').where({
                                bindMainId: addA
                            }).then((res)=>{
                                if(res[0].has){
                                    return mysql('vip').update({
                                        pv
                                    }).where({
                                        bindMainId: addA
                                    }).then((res)=> {
                                        console.log(res, '47')
                                        if (res) {
                                            return {
                                                loginState: LOGIN_STATE.SUCCESS,
                                                msg: '发送成功'
                                            }
                                        } else {
                                            return {
                                                loginState: LOGIN_STATE.FAILED,
                                                msg: '发送失败1'
                                            }
                                        }
                                    })
                                }else {
                                    return mysql('fellow').update({
                                        pv
                                    }).where({
                                        bindMainId: addA
                                    }).then((res)=> {
                                        console.log(res, '47')
                                        if (res) {
                                            return {
                                                loginState: LOGIN_STATE.SUCCESS,
                                                msg: '发送成功'
                                            }
                                        } else {
                                            return {
                                                loginState: LOGIN_STATE.FAILED,
                                                msg: '发送失败1'
                                            }
                                        }
                                    })
                                }
                            })



                        } else {
                            return {
                                loginState: LOGIN_STATE.FAILED,
                                msg: '发送失败2'
                            }
                        }
                    })
                }
            })
        })
    } else {
        return {
            loginState: LOGIN_STATE.FAILED,
            msg: '未知错误——00053'
        }
    }


}
module.exports = {
    addPage: addPage
}