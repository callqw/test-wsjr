/**
 * Created by xj on 2018/6/10.
 */
var mysql = require('./db');
var banner = async function (options) {
    return new Promise((resolve, reject)=> {
        mysql('cSessionInfo').select('*').where({
            skey: options.skey
        }).then((res)=> {
            if (res[0] != undefined) {
                resolve({
                    code: 1,
                    data: res[0].banner
                })
            } else {
                resolve({
                    code: -1,
                    data: '登录错误'
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
var cbn = async function (options, skey) {
    return new Promise((resolve, reject)=> {
        mysql('cSessionInfo').update({
            banner: true
        }).where({
            skey: skey
        }).then((res)=> {
            if (res == 1) {
                resolve({
                    code: 1,
                    data: '提交成功'
                })
            } else {
                resolve({
                    code: -1,
                    data: '登录错误'
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
module.exports = {banner: banner, cbn: cbn}