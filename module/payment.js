/**
 * Created by xj on 2018/6/3.
 */
const http = require('axios')
const config = require('../config');
const debug = require('debug')('koa-weapp-demo');
const unicode = require('../module/unicode')
const moment = require('moment')
var md5 = require('crypto-md5');
const mysql = require('./db')

var toPayment = function (options) {
    return new Promise(async(resolve, reject)=> {
        http({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            method: 'GET',
            params: {
                appid: config.appId,
                secret: config.appSecret,
                js_code: options.code,
                grant_type: 'authorization_code'
            }
        }).then(async(res) => {
            res = res.data
            if (res.errcode || !res.openid || !res.session_key) {
                debug('%s: %O', ERRORS.ERR_GET_SESSION_KEY, res.errmsg)
                throw new Error(`${ERRORS.ERR_GET_SESSION_KEY}\n${JSON.stringify(res)}`)
            } else {
                debug('openid: %s, session_key: %s', res.openid, res.session_key)

                console.log(res)
                mysql('cSessionInfo').count('open_id as has').where({
                    open_id: res.openid
                }).then(async(data)=> {
                    if (data[0].has === 1) {
                        let result = await validataPayData(res, options)
                        resolve({code: result.code, data: result.data});
                    } else {
                        resolve({code: -1, data: '信息验证失败,请联系管理员'});
                    }
                }).catch((e)=> {
                    resolve({code: -1, data: '查询信息失败,请联系管理员'});
                })
            }
        })
    })
}
var payment = async function (options) {
    return new Promise(async(resolve, reject)=> {
        mysql('fellow').count('bindMainId as has').where({
            bindMainId: options.bindMainId
        }).then(async(n)=> {

            if (n[0].has) {
                var res = await toPayment(options);
                resolve(res);
            } else {
                mysql('vip').count('bindMainId as has').where({
                    bindMainId: options.bindMainId
                }).then(async(n)=> {
                    if (n[0].has) {
                        var res = await toPayment(options);
                        resolve(res);
                    } else {
                        resolve({code: -1, data: '请先发布信息再充值'});
                    }
                })

            }
        }).catch((e)=> {
            console.log(e, 'err')
        })


    })
}
function validataPayData(res, options) {

    return new Promise(async(resolve, reject)=> {
        let appid = config.appId;
        var random = await randomNum();
        //统一支付签名
        // var appid = appid;//appid
        console.log(options.total_fee, 'num')
        var body = '成都亿兴创想科技有限公司';//商户名
        var mch_id = '1502938211';//商户号
        var nonce_str = random;//随机字符串，不长于32位。
        var notify_url = '成都高新区中和后街19号1';//通知地址
        var spbill_create_ip = '192.168.1.1';//ip
        // var total_fee = parseInt(that.data.wxPayMoney) * 100;

        var total_fee = options.total_fee;
        var trade_type = "JSAPI";
        var key = 'f4t56rt98ykn1564fdsa123qdfghy18u';
        var unifiedPayment = 'appid=' + appid + '&body=' + body + '&mch_id=' + mch_id + '&nonce_str=' + nonce_str + '&notify_url=' + notify_url + '&openid=' + res.openid + '&out_trade_no=' + random + '&spbill_create_ip=' + spbill_create_ip + '&total_fee=' + total_fee + '&trade_type=' + trade_type + '&key=' + key
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

        http({
            url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
            method: 'POST',
            head: 'application/x-www-form-urlencoded',
            data: formData, // 设置请求的 header
        }).then(async(data)=> {

            var timeStamp = Math.floor(Date.now() / 1000);
            var prepay_id = getXMLNodeValue('prepay_id', data.data.toString("utf-8"))
            var tmp = prepay_id.split('[')
            var tmp1 = tmp[2].split(']')
            var stringSignTemp = "appId=" + appid + "&nonceStr=" + random + "&package=prepay_id=" + tmp1[0] + "&signType=MD5&timeStamp=" + timeStamp + "&key=f4t56rt98ykn1564fdsa123qdfghy18u"
            var sign = md5(stringSignTemp, 'hex').toUpperCase()
            var param = {
                "timeStamp": timeStamp,
                "package": 'prepay_id=' + tmp1[0],
                "paySign": sign,
                "signType": "MD5",
                "nonceStr": random
            }
            let paymentValidata = md5(random, 'hex').toUpperCase()
            mysql('cSessionInfo').select('orderNum').where({
                open_id: res.openid
            }).then(async(n)=> {
                var database = ["" + nonce_str + ""];
                // database[n[0].orderNum+1] = ""+nonce_str+""
                // database =await unicode.escapein(database);

                console.log(database, '137');
                mysql('cSessionInfo').update({
                    paymentValidata: paymentValidata,
                    orderNum: database
                }).where({
                    open_id: res.openid
                }).then((data)=> {

                    param.paymentValidata = random;
                    param.type = random;
                    resolve({code: 1, data: param});
                })
                // }else {
                //     resolve({code: -1, data: 'errpmt150'});
                // }
            }).catch((e)=> {
                resolve({code: -1, data: '' + e + ''});
            })


        }).catch((e)=> {
            console.log(e)
            resolve({code: -1, data: 'errunifiedorder'});
        })
    })
}
function getXMLNodeValue(node_name, xml) {
    var tmp = xml.split("<" + node_name + ">")
    var _tmp = tmp[1].split("</" + node_name + ">")
    return _tmp[0]
}
function randomNum() {
    return new Promise((resolve, reject)=> {
        var random = "";
        var data = ["6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "0", "1", "2", "m", "n", "o", "p", "q", "r", "s", "t", "3", "4", "5", "u", "v", "w", "x", "y", "z"];
        for (var i = 0; i < 32; i++) {
            random += data[Math.floor(Math.random() * 36)]
        }
        resolve(random);
    })
}
var paymentValidata = async function (options) {
    var random = await randomNum()
    return new Promise((resolve, reject)=> {
        mysql('cSessionInfo').select('*').where({
            skey: options.skey
        }).then((res)=> {
            if (res[0] != undefined) {
                var validata = md5(options.paymentValidata, 'hex').toUpperCase()
                if (res[0].paymentValidata === validata) {
                    var pt = parseInt(res[0].paymentTime - Math.floor(Date.now() / 1000));
                    if (pt > 0) {
                        pt = pt
                    } else {
                        pt = 0
                    }
                    var $lastTime = Math.floor(Date.now() / 1000) + parseInt(86400 * Math.floor(options.total_fee)) + pt;
                    console.log($lastTime, '191 payment')
                    mysql('cSessionInfo').update({
                        paymentTime: $lastTime,
                        paymentValidata: md5(random, 'hex'),
                        nowType: 1
                    }).where({
                        paymentValidata: validata,
                        skey: options.skey
                    }).then((data)=> {
                        if (data) {
                            mysql('vip').count('bindMainId as has').where({
                                bindMainId: res[0].id
                            }).then((x)=> {
                                if (x[0].has) {
                                    //更新
                                    console.log(x, '更新')
                                    mysql('fellow').select('*').where({
                                        bindMainId: res[0].id
                                    }).then((a)=> {
                                        mysql('vip').update({
                                            lastVisiteTime: Math.floor(Date.now() / 1000),
                                            paymentTime: $lastTime,
                                        }).then((result)=> {
                                            console.log(result, 'result')
                                            if (result) {
                                                mysql('fellow').del().where({
                                                    bindMainId: res[0].id
                                                }).then((c)=> {
                                                    console.log(c, 159);
                                                    if (c) {
                                                        resolve({code: 1, data: '充值会员成功'});
                                                    } else {
                                                        resolve({code: -1, data: '' + c + ''});
                                                    }

                                                }).catch((e)=> {
                                                    resolve({code: -1, data: '' + e + ''});
                                                })
                                            } else {
                                                resolve({code: -1, data: result});
                                            }


                                        }).catch((e)=> {
                                            console.log('错误', e)
                                        })
                                    }).catch((e)=> {
                                        console.log('错误', e)
                                    })
                                } else {
                                    console.log(x, '插入')
                                    //插入
                                    mysql('fellow').select('*').where({
                                        bindMainId: res[0].id
                                    }).then((a)=> {
                                        console.log(a, 'aaaaaaaaaa')
                                        mysql('vip').insert({
                                            userInfo: res[0].user_info,
                                            bindMainId: res[0].id,
                                            createTime: Math.floor(Date.now() / 1000),
                                            lastVisiteTime: Math.floor(Date.now() / 1000),
                                            nowType: res[0].nowType,
                                            paymentTime: $lastTime,
                                            WXid: a[0].WXid,
                                            QRcode: a[0].QRcode,
                                            validataTime: a[0].validataTime,
                                            pv: a[0].pv
                                        }).then((result)=> {
                                            console.log(result, 'result')
                                            if (result) {
                                                mysql('fellow').del().where({
                                                    bindMainId: res[0].id
                                                }).then((c)=> {
                                                    console.log(c, 159);
                                                    if (c) {
                                                        resolve({code: 1, data: '充值会员成功'});
                                                    } else {
                                                        resolve({code: -1, data: c});
                                                    }

                                                }).catch((e)=> {
                                                    resolve({code: -1, data: '' + e + ''});
                                                })
                                            } else {
                                                resolve({code: -1, data: result});
                                            }
                                        }).catch((e)=> {
                                            resolve({code: -1, data: '' + e + ''});
                                        })
                                    }).catch((e)=> {
                                        resolve({code: -1, data: '' + e + ''});
                                    })

                                }
                            })
                        } else {
                            resolve({code: -1, data: data});
                        }
                    }).catch((e)=> {
                        resolve({code: -1, data: '' + e + ''});
                    })
                } else {
                    resolve({code: -1, data: '请通过正确方式充值'});
                }
            } else {
                resolve({code: -1, data: '请登录后再试'});
            }
        }).catch((e)=> {
            resolve({code: -1, data: '' + e + ''});
        })
    })
}

var vipSelect = async function (options) {
    console.log(options.userInfo.id, '301')
    return new Promise((resolve, reject)=> {
        mysql('vip').select('*').where({
            bindMainId: options.userInfo.id
        }).then(async(res)=> {
            console.log(res, 'res')
            if (res[0]) {
                var pT = await dateFormat(parseInt(res[0].paymentTime) - Math.floor(Date.now() / 1000));
                console.log(pT, 'pt')
                resolve({code: 1, data: pT});
            } else {
                resolve({code: -1, data: 'err in selectvipinfo'});
            }
        }).catch((e)=> {
            resolve({code: -1, data: '' + e + ''});
        })
    })

}
var dateFormat = function (options) {  //日期格式化
    return new Promise((resolve,reject)=>{
        var defaultTimeStamp = options;
        var dayA = defaultTimeStamp % (24 * 3600)
        var hourA = dayA % (3600)
        var minuteA = hourA % (60)
        var day = Math.floor(defaultTimeStamp / (24 * 3600));
        var hour = Math.floor(dayA / (3600));
        var minute = Math.floor(hourA / 60);
        var second = Math.floor(minuteA);
        resolve({
            dd:day,hh:hour,mm:minute,ss:second
        })
        console.log(day, '天', hour, '时', minute, '分', second, '秒')
    })

}
module.exports = {
    payment: payment,
    paymentValidata: paymentValidata,
    vipSelect: vipSelect
}