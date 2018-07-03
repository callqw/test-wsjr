/**
 * Created by xj on 2018/5/5.
 */
var user = function (ctx, next) {
    // 通过 Koa 中间件进行登录态校验之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        ctx.state.$wxInfo.userinfo.openId = null;
        ctx.state.$wxInfo.userinfo.watermark = null;
        ctx.state.$wxInfo.userinfo.id = ctx.state.$wxInfo.bindMainId;

        ctx.state.code = ctx.state.$wxInfo.loginState,
        ctx.state.data = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = ctx.state.$wxInfo.loginState,
            ctx.state.data = ctx.state.$wxInfo.msg
    }
}
module.exports = {
    user: user
}