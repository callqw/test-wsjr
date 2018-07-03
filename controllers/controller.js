/**
 * Created by xj on 2018/6/14.
 */
var Controller = require('../module/controller')
var controller = async function (ctx, next) {
    // 通过 Koa 中间件进行登录态校验之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    if (ctx.state.$wxInfo.loginState === 1) {

        // loginState 为 1，登录态校验成功
        var res = await Controller.controller()
        ctx.state.code = res.code;
        ctx.state.data = res.data;
    } else {
        ctx.state.code = ctx.state.$wxInfo.loginState,
            ctx.state.data = ctx.state.$wxInfo.msg
    }
}
module.exports = {
    controller: controller
}