/**
 * Created by xj on 2018/5/21.
 */
var AddPage = require('../module/addPage');
var util = require('./utils');
var constants = require('./constants');

var addPage = async function (ctx, next) {
    // 通过 Koa 中间件进行登录态校验之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
console.log(ctx.state.$wxInfo)
    if (ctx.state.$wxInfo.loginState === 1) {
        var data = ctx.request.body
        var result = await AddPage.addPage(data);
        ctx.state.code = result.code
        ctx.state.data = result.msg
    } else {
        //中间件验证未通过
        ctx.state.code = ctx.state.$wxInfo.loginState
        ctx.state.data = ctx.state.$wxInfo.msg
    }
}
module.exports = {
    addPage: addPage
}