/**
 * Created by xj on 2018/6/3.
 */
var Payment = require('../module/payment');
var util = require('./utils');
var constants = require('./constants');

var payment = async function (ctx, next) {
    // 通过 Koa 中间件进行登录态校验之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    console.log(ctx.state.$wxInfo)
    if (ctx.state.$wxInfo.loginState === 1) {
        var data = ctx.request.body
        console.log(data, 'ttttttttttttt')
        data.skey = ctx.state.$wxInfo.skey;
        if (data.paymentValidata) {
            if (data.total_fee === 1) {
                data.total_fee = 1;
                console.log(data, '20')
                let result = await Payment.paymentValidata(data);
                ctx.state.code = result.code;
                ctx.state.data = result.data;
            } else if (data.total_fee === 2) {
                data.total_fee = 7;
                console.log(data, '25')
                let result = await Payment.paymentValidata(data);
                ctx.state.code = result.code;
                ctx.state.data = result.data;
            } else {
                ctx.state.code = -1;
                ctx.state.data = '支付模块错误';
            }

        } else {
            if (data.total_fee === 1) {
                data.total_fee = 600
                // data.total_fee = 1
                data.bindMainId = ctx.state.$wxInfo.bindMainId
                let result = await Payment.payment(data);
                ctx.state.code = result.code;
                ctx.state.data = result.data;
            } else if (data.total_fee === 2) {
                data.total_fee = 4000
                // data.total_fee = 1
                data.bindMainId = ctx.state.$wxInfo.bindMainId
                let result = await Payment.payment(data);
                ctx.state.code = result.code;
                ctx.state.data = result.data;
            } else {
                ctx.state.code = -1;
                ctx.state.data = '支付模块错误';
            }
        }

        console.log(data, 'payment')
    } else {
        //中间件验证未通过
        ctx.state.code = ctx.state.$wxInfo.loginState
        ctx.state.data = ctx.state.$wxInfo.msg
    }
}
var vipSelect = async function (ctx, next) {
    var data = ctx.request.body;
    console.log(data,'selectPayment')
    if (ctx.state.$wxInfo.loginState === 1) {

        console.log(data,'selectPayment')
        if(data.vipSelect ==='vip'){
            console.log(data,'true')
            let result = await Payment.vipSelect(data);
            ctx.state.code = result.code;
            ctx.state.data = result.data;
        }else {
            ctx.state.code = -1;
            ctx.state.data = '参数错误'
        }

    } else {
        //中间件验证未通过
        ctx.state.code = ctx.state.$wxInfo.loginState
        ctx.state.data = ctx.state.$wxInfo.msg
    }
}
module.exports = {
    payment: payment,
    vipSelect: vipSelect
}