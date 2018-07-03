/**
 * Created by xj on 2018/5/17.
 */
const http = require('axios')
const config = require('../config');
const debug = require('debug')('koa-weapp-demo');
const sha1 = require('../node_modules/wafer-node-sdk/lib/helper/sha1');
const aesDecrypt = require('../node_modules/wafer-node-sdk/lib/helper/aesDecrypt');
const AuthDbService = require('../module/authDbService')
const {ERRORS, LOGIN_STATE} = require('./constants')
const unicode = require('../module/unicode')
const moment = require('moment')
const MD5 = require('../md5')
const crypto = require('crypto')
var md5 = require('crypto-md5');
function a() {
    // var date = new Date().getDate();
    // var mounth = new Date().getDay();
    // var year = new Date().getFullYear();
    // var $lastTime = '' + year + '-' + mounth + '-' + date + ' 23:59:59'
    // var now1 = Date.now();
    // var ddf = moment($lastTime, 'YYYY-MM-DD HH:mm:ss').valueOf();
    //
    // var validataTime = Math.floor( (ddf - now1)/ 1000);
    // console.log(validataTime,ddf);

    var date = new Date().getDate();
    var mouth = new Date().getMonth() + 1;
    var year = new Date().getFullYear();
    var $Time = '' + year + '-' + mouth + '-' + date + ' 23:59:59'
    // var $lastTime = moment($Time, 'YYYY-MM-DD HH:mm:ss').valueOf();
    var $lastTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss.SSS');
    console.log($lastTime, 'df')
    // moment(lastVisitTime, 'YYYY-MM-DD HH:mm:ss').valueOf()
    // $lastTime = Math.floor(($lastTime - Date.now()) / 1000);
    // var now = Math.floor($lastTime / 1000);
    // $lastTime = new Date().getDate()
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = Date.now();
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    console.log(monthC, Date.now() / 1000 / 60 / 60 / 23, 'monthC')
    dayC = JSON.stringify(dayC).split(".")
    var dayD = JSON.parse('0.' + dayC[1] + '') * 24
    hourC = JSON.stringify(dayD).split(".")
    var hourD = JSON.parse('0.' + hourC[1] + '') * 60

    minC = JSON.stringify(hourD).split(".")
    var minD = JSON.parse('0.' + minC[1] + '') * 60
    var secondC = JSON.stringify(minD).split(".")
    var secondD = JSON.parse('0.' + secondC[1] + '') * 1000

    var dayA = sp(Date.now() / day);
    console.log(dayA, 'cc')
    var hourA = pa(dayA[1]) * 24;
    console.log(hourA)
    var hourB = sp(hourA);

    var minA = pa(hourB[1]) * 60;
    console.log(minA)
    var minB = sp(minA);
    console.log(minB);
    var secondA = pa(minB[1]) * 60;
    console.log(secondA, 'secondA')
    var secondB = sp(secondA);
    console.log(secondB, 'secondB')
    var ssA = pa(secondB[1]) * 1000;
    console.log(ssA, 'ssA')
    var ssB = sp(ssA);
    console.log(ssB, 'ssB')

    console.log(dayA, dayA[0], '天', hourB[0], '时', minB[0], '分', secondB[0], '秒', ssB[0])

    var date3 = Date.now();
    var days=Math.floor(date3/(24*3600*1000));
    var leave1=date3%(24*3600*1000)    //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(3600*1000))
    var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60*1000))
    var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3/1000)
    var dda = Date.now()%(1000*3600*24)
    var dd = Math.floor(Date.now()/(1000*3600*24));
    var hha = dda%(1000*3600)
    var hh = Math.floor(dda/(1000*3600))
    var mma = hha%(1000*60)
    var mm = Math.floor(hha/(1000*60))
    var ssa = Math.floor(hha/(1000*60))
    var ss = Math.floor(mma/(1000))
    var af =Math.floor(Date.now()/1000);
    console.log( days, '天', hours, '时', minutes, '分', seconds, '秒')

    console.log( dd, '天', hh , '时', mm, '分1', ss, '秒',af)

    var defaultTimeStamp = options;
    var dayA = defaultTimeStamp%(24*3600)
    var hourA = dayA%(3600)
    var minuteA = hourA%(60)
    var day = Math.floor(defaultTimeStamp/(24*3600));
    var hour = Math.floor(dayA/(3600));
    var minute = Math.floor(hourA/60);
    var second = Math.floor(minuteA);
    console.log( day, '天', hour , '时', minute, '分1', second, '秒')
}

// a();
function sp(options) {
    return JSON.stringify(options).split(".")
}
function pa(options) {
    if(options ==undefined){
        return '0.0';
    }else {
        return JSON.parse('0.' + options + '')
    }

}
var mysql = require('../module/db')
//向数据库注入数据
var insert = async function () {
    var pv = 0;
    const create_time = moment().format('YYYY-MM-DD HH:mm:ss');
    const nickName = 'ERTUn';
    const QRcode = 'https://upload.8bnl.com/img/1527397853759';
    const avatarUrl = 'https://wx.qlogo.cn/mmopen/vi_32/Q7OVYSB3Cd4aT3oagnPQ4ZytwgFx34jicaNiaQdFbBlPOiazb159ib0h5eDeVMGpwVmyJicAqcwmIgVDibSURbRV0hKQ/132';
    const lastVisite_time = moment().format('YYYY-MM-DD HH:mm:ss');
    const validataTime = moment().format('YYYY-MM-DD HH:mm:ss');
   var options = {
        WXid: '13', nickName, QRcode, avatarUrl, create_time, bindMainId: '13', lastVisite_time, validataTime, pv
    }
    for (var i = 0; i < 24; i++) {
        var res = await insertTo(options)
        console.log(res, 'success,46')
    }

}
var insertTo = function (options) {

    return new Promise((resolve, reject)=> {
        mysql('vip').insert({
            // WXid: options.WXid,
            // nickName: options.nickName,
            // QRcode: options.QRcode,
            // avatarUrl: options.avatarUrl,
            // create_time: options.create_time,
            // bindMainId: options.bindMainId,
            // lastVisite_time: options.lastVisite_time,
            // validataTime: options.validataTime,
            // pv: options.pv

            userInfo:'{"nickName":"\\\\u968f\\\\u9047\\\\u800c\\\\u5b89\\\\u3002","gender":2,"language":"zh_CN","city":"Chengdu","province":"Sichuan","country":"China","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/PEA7BNocmPicQrmRFpYnbBcElJiavvcSwVqVt47CpUP3TK3uKuZTEJD1Q5miagFOA3Cp47NfJm6sgVYxicACIc68QA/132","openId":"oZDbi5JHnSzIYXahkmor44fSptjM"}',
            bindMainId:options.bindMainId,
            createTime:'1528612086',
            lastVisiteTime:'1528612086',
            nowType:1,
            paymentTime:'1528698486',
            WXid:options.WXid,
            QRcode:options.QRcode,
            pv:options.pv,
            validataTime:'46706',
        }).then((res)=> {
            console.log(res, '62')
            if (res) {
                resolve(res, 'success')
            } else {
                console.log(reject)
            }

        })
    })
}
insert();

var auth = '123456'

var extend = function (target) {
    var sources = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < sources.length; i += 1) {
        var source = sources[i];
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }
    console.log(target)
    return target;
}
// extend({},auth);
const appid = config.appId
const appsecret = config.appSecret
var random = "";
var data = ["6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "0", "1", "2", "m", "n", "o", "p", "q", "r", "s", "t", "3", "4", "5", "u", "v", "w", "x", "y", "z"];
for (var i = 0; i < 32; i++) {
    random += data[Math.floor(Math.random() * 36)]
}
var test = async function (ctx, next) {
    console.log(ctx.request.body, 'in')


    // var header = ctx.request.header
    return http({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        method: 'GET',
        params: {
            appid: appid,
            secret: appsecret,
            js_code: ctx.request.body.code,
            grant_type: 'authorization_code'
        }
    }).then(async(res) => {

        res = res.data
        console.log(res, 'thiss')

        //统一支付签名
        // var appid = appid;//appid
        var body = '成都亿兴创想科技有限公司';//商户名
        var mch_id = '1502938211';//商户号
        var nonce_str = random;//随机字符串，不长于32位。
        var notify_url = '成都高新区中和后街19号1';//通知地址
        var spbill_create_ip = '192.138.0.1';//ip
        // var total_fee = parseInt(that.data.wxPayMoney) * 100;
        var total_fee = 100;
        var trade_type = "JSAPI";
        var key = 'f4t56rt98ykn1564fdsa123qdfghy18u';
        var unifiedPayment = 'appid=' + appid + '&body=' + body + '&mch_id=' + mch_id + '&nonce_str=' + nonce_str + '&notify_url=' + notify_url + '&openid=' + res.openid + '&out_trade_no=' + random + '&spbill_create_ip=' + spbill_create_ip + '&total_fee=' + total_fee + '&trade_type=' + trade_type + '&key=' + key
        console.log(unifiedPayment, 'jiami')
        // var sign = MD5.hex_md5(unifiedPayment).toUpperCase()
        var sign = md5(unifiedPayment, 'hex')

        var formData = "<xml>"
        formData += "<appid>" + appid + "</appid>"
        formData += "<body>" + body + "</body>"
        formData += "<mch_id>" + mch_id + "</mch_id>"
        formData += "<nonce_str>" + nonce_str + "</nonce_str>"
        formData += "<notify_url>" + notify_url + "</notify_url>"
        formData += "<openid>" + res.openid + "</openid>"
        formData += "<out_trade_no>" + random + "</out_trade_no>"
        formData += "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>"
        formData += "<total_fee>" + total_fee + "</total_fee>"
        formData += "<trade_type>" + trade_type + "</trade_type>"
        formData += "<sign>" + sign + "</sign>"
        formData += "</xml>"


        var res = await FormData(formData);

        ctx.body = res;
    }).catch((e)=> {
        console.log(e, 'catch')
    })

}
var FormData = function (formData) {
    return new Promise((resolve, reject)=> {
        http({
            url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
            method: 'POST',
            head: 'application/x-www-form-urlencoded',
            data: formData, // 设置请求的 header
        }).then((res)=> {
            console.log(res.data, 'aaa')
            var timeStamp = Math.floor(Date.now() / 1000);
            var prepay_id = getXMLNodeValue('prepay_id', res.data.toString("utf-8"))
            var tmp = prepay_id.split('[')
            var tmp1 = tmp[2].split(']')
            var stringSignTemp = "appId=" + appid + "&nonceStr=" + random + "&package=prepay_id=" + tmp1[0] + "&signType=MD5&timeStamp=" + timeStamp + "&key=f4t56rt98ykn1564fdsa123qdfghy18u"
            // md5(unifiedPayment, 'hex')
            var sign = md5(stringSignTemp, 'hex').toUpperCase()

            var param = {
                "timeStamp": timeStamp,
                "package": 'prepay_id=' + tmp1[0],
                "paySign": sign,
                "signType": "MD5",
                "nonceStr": random
            }
            resolve(param)
        }).catch((e)=> {
            console.log(e, 'eee')
        })
    })
}
function getXMLNodeValue(node_name, xml) {
    var tmp = xml.split("<" + node_name + ">")
    var _tmp = tmp[1].split("</" + node_name + ">")
    return _tmp[0]
}
function getSessionKey(code) {

    const appid = config.appId
    const appsecret = config.appSecret
    return new Promise((resolve, reject)=> {
        http({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            method: 'GET',
            params: {
                appid: appid,
                secret: appsecret,
                js_code: code,
                grant_type: 'authorization_code'
            }
        })
            .then((res)=> {
                resolve(res.data);
            })
    })
}

module.exports = {test: test}