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
var pageSelect = function (options) {
    return new Promise((resolve, reject)=> {
        var from = (options.page - 1) * 35, num = 35;
        mysql('fellow').select('*').orderByRaw('id DESC LIMIT ' + from + ', ' + num + '').then(async(res)=> {
            if (res) {
                for (var i = 0; i < res.length; i++) {
                    res[i].nickName = await unicode.toUnicode.ToGB2312(res[i].nickName)
                }
                resolve({code: 1, data: res});
            } else {
                resolve({code: -1, data: ERRORS.DBERR.ERR_NO_SKEY_ON_CALL_GETUSERINFOFUNCTION});
            }
        }).catch((e)=> {
                resolve({code: -1, data: e});
            }
        )
    })
}
var vipSelect = function (options) {
    return new Promise((resolve, reject)=> {
        mysql('vip').select('*').orderByRaw('id DESC').then(async(res)=> {
            if (res) {
                for (var i = 0; i < res.length; i++) {
                    var result = res[i].paymentTime - Math.floor(Date.now() / 1000);
                    if (result > 0) {
                        res[i].userInfo = JSON.parse(res[i].userInfo)
                        res[i].userInfo.nickName = await unicode.toUnicode.ToGB2312(res[i].userInfo.nickName)
                    } else {
                        var res = await del(res[i]);
                        if (res.code == 1) {
                            del[i].splice(i, 1);
                        } else {
                            resolve({
                                code: -1,
                                data: 'err in selectvip'
                            })
                        }
                    }
                }
                resolve({code: 1, data: res});
            } else {
                resolve({code: -1, data: ERRORS.DBERR.ERR_NO_SKEY_ON_CALL_GETUSERINFOFUNCTION});
            }
        }).catch((e)=> {
                resolve({
                    code: -1,
                    data: '' + e + ''
                })
            }
        )
    })
}
var del = function (options) {
    return new Promise((resolve, reject)=> {
        options.userInfo = JSON.parse(options.userInfo)
        mysql('fellow').insert({
            WXid: options.WXid,
            nickName: options.userInfo.nickName,
            QRcode: options.QRcode,
            avatarUrl: options.userInfo.avatarUrl,
            create_time: options.createTime,
            bindMainId: options.bindMainId,
            lastVisite_time: options.lastVisiteTime,
            validataTime: options.validataTime,
            pv: options.pv
        }).then((res)=> {
            if (res) {
                mysql('vip').del().where({
                    id: options.id
                }).then((res)=> {
                    if (res) {
                        mysql('cSessionInfo').update({
                            paymentTime: 0,
                            nowType: 0
                        }).where({
                            id: options.bindMainId
                        }).then((a)=> {
                            if (a) {
                                resolve({
                                    code: 1,
                                    data: 'success'
                                })
                            } else {
                                resolve({
                                    code: -1,
                                    data: 'err in del1'
                                })
                            }
                        }).catch((e)=> {
                            resolve({
                                code: -1,
                                data: '' + e + ''
                            })
                        })
                    } else {
                        resolve({
                            code: -1,
                            data: 'err in del'
                        })
                    }
                })
            } else {
                resolve({
                    code: -1,
                    data: 'err insert'
                })
            }
        }).catch((e)=> {
            resolve({
                code: -1,
                data: '' + e + ''
            })
        })
    })
}
var addPageSelect = function (options) {
    return new Promise((resolve, reject)=> {
        var from = (options.page - 1) * 100, num = 100;

        mysql('addPage').select('*').where({
            addB: options.id
        }).orderByRaw('id DESC LIMIT ' + from + ', ' + num + '').then(async(res)=> {
            if (res) {
                for (var i = 0; i < res.length; i++) {
                    res[i].nickName = await unicode.toUnicode.ToGB2312(res[i].nickName)
                    res[i].$_nickName = await unicode.toUnicode.ToGB2312(res[i].$_nickName)
                    if (res[i].resP === 1) {
                        res[i].resP = true;
                    } else if (res[i].resP === 0) {
                        res[i].resP = false;
                    }
                }
                resolve({code: 1, data: res});
            } else {
                resolve({code: -1, data: ERRORS.DBERR.ERR_NO_SKEY_ON_CALL_GETUSERINFOFUNCTION});
            }
        }).catch((e)=> {
                resolve({code: -1, data: e});
            }
        )
    })
}
var countMeSelect = function (options) {
    return new Promise((resolve, reject)=> {
        var from = (options.page - 1) * 100, num = 100;
        mysql('addPage').select('*').where({
            addA: options.id
        }).orderByRaw('id DESC LIMIT ' + from + ', ' + num + '').then(async(res)=> {
            if (res) {
                for (var i = 0; i < res.length; i++) {
                    res[i].nickName = await unicode.toUnicode.ToGB2312(res[i].nickName)
                    res[i].$_nickName = await unicode.toUnicode.ToGB2312(res[i].$_nickName)
                    if (res[i].resP === 1) {
                        res[i].resP = true;
                    } else if (res[i].resP === 0) {
                        res[i].resP = false;
                    }
                }
                resolve({code: 1, data: res});
            } else {
                resolve({code: -1, data: ERRORS.DBERR.ERR_NO_SKEY_ON_CALL_GETUSERINFOFUNCTION});
            }
        }).catch((e)=> {
                resolve({code: -1, data: e});
            }
        )
    })
}

module.exports = {
    vipSelect: vipSelect,
    pageSelect: pageSelect,
    addPageSelect: addPageSelect,
    countMeSelect: countMeSelect
}