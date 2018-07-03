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
var data = [];
var $data = [];
var $data_pv = [];
var times = [];
var pageSelect = function (options) {
    return new Promise((resolve, reject)=> {


        var from = (options.page - 1) * 10, num = 100;

        mysql('fellow').select('*').orderByRaw('id DESC LIMIT ' + from + ', ' + num + '').then(async(res)=> {
            var res = await lastTime(res);
            for (var j = 0; j < res.length; j++) {
                var updata = await updataTime(res[j]);
            }
            if (updata) {
                mysql('fellow').select('*').orderByRaw('id DESC LIMIT ' + from + ', ' + num + '').then((res)=> {
                    for (var i = 0; i < res.length; i++) {
                        if (res[i].pv_tody > 20) {
                            $data_pv.push(res[i])
                        } else {
                            $data.push(res[i])
                        }
                    }
                    resolve({
                        $data_pv: $data_pv, $data: $data
                    })

                })

            }


        })
    })
}
var lastTime = function (options) {
    return new Promise((resolve, reject)=> {
        for (var j = 0; j < options.length; j++) {
            var lastVisiteTime = moment(options[j].lastVisite_time, 'YYYY-MM-DD HH:mm:ss').valueOf();
            lastVisiteTime = Math.floor(lastVisiteTime / 1000);
            if (Math.floor(Date.now() / 1000) - lastVisiteTime > 10) {
                data.push(options[j]);
            }
        }
        resolve(data);
    })

}
var updataTime = function (options) {
    return new Promise((resolve, reject)=> {
        var id = options.id;
        var lastVisite_time = create_time;
        var pv_tody = 1;
        mysql('fellow').update({
            lastVisite_time, pv_tody
        }).where({
            id
        }).then((res)=> {
            if (res) {
                resolve(res)
            }

        })

    })
}


module.exports = {
    pageSelect: pageSelect
}