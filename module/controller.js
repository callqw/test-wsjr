/**
 * Created by xj on 2018/6/14.
 */
var mysql = require('./db')
var controller = async function (options) {
    return new Promise((resolve, reject)=> {
        mysql('controller').select('*').where({
            id: 999
        }).then((res)=> {
            if (res[0] != undefined) {
                resolve({
                    code: 1, data: res[0].show
                })
            } else {
                resolve({
                    code: 1, data: 'err show'
                })
            }
            console.log(res, 'controller....')
        }).catch((e)=> {
            resolve({
                code: 1, data: '' + e + ''
            })
        })
    })
}
module.exports = {
    controller: controller
}