/**
 * Created by xj on 2018/5/16.
 */
var UpMsg = require('../module/upMsg');
var util = require('./utils');
var constants = require('./constants');

var upMsg = async function (ctx, next) {
    // 通过 Koa 中间件进行登录态校验之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    console.log(ctx.state.$wxInfo.loginState,'ddff')
    if (ctx.state.$wxInfo.loginState === 1) {

        // 中间件验证通过 loginState 为 1，登录态校验成功
        if (ctx.request.body.WXid === null || ctx.request.body.QRcode === null) {
            //内容为空，上传失败
            ctx.state.code = constants.LOGIN_STATE.NULL;
            ctx.state.data = '内容不能为空';
        } else {
            //校验成功后存入数据在$wxinfo中，提供查询依据bindMainId，bindMainId绑定主表的id
            var msg = util.extend({}, ctx.state.$wxInfo, ctx.request.body);
            var res = await UpMsg.upMsg(msg);
            if (res.loginState === 1) {
                //二维码上传成功
                ctx.state.code = res.loginState;
                ctx.state.data = res.msg;
            } else if (res.loginState === 0) {
                //二维码上传失败
                ctx.state.code = res.loginState;
                ctx.state.data = res.msg;
            } else if (res.loginState === -2) {

                ctx.state.code = res.loginState;
                ctx.state.data = res.msg;
            }
        }

    } else {
        //中间件验证未通过
        ctx.state.code = ctx.state.$wxInfo.loginState
        ctx.state.data = ctx.state.$wxInfo.msg
    }
}
var upToAgree = async function (ctx, next) {
    // 通过 Koa 中间件进行登录态校验之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    if (ctx.state.$wxInfo.loginState === 1) {

        // 中间件验证通过 loginState 为 1，登录态校验成功
        console.log(ctx.request.body,'cccccccc')
        if(ctx.request.body.id !=undefined){
            var res = await UpMsg.upToAgree(ctx.request.body);
            ctx.state.code = res.loginState
            ctx.state.data = res.msg
        }else {
            ctx.state.code = constants.LOGIN_STATE.FAILED
            ctx.state.data = '添加错误----0057'
        }
    } else {
        //中间件验证未通过
        ctx.state.code =  ctx.state.$wxInfo.loginState
        ctx.state.data = ctx.state.$wxInfo.msg
    }
}
module.exports = {
    upMsg: upMsg,
    upToAgree: upToAgree
}