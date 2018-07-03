/**
 * Created by xj on 2018/5/1.
 */
var unicode = require('../module/unicode')
var login = function login(ctx, next) {
    if (ctx.state.$wxInfo.loginState) {
        ctx.state.$wxInfo.userInfo.openId = null;
        ctx.state.$wxInfo.userInfo.watermark = null;
        ctx.state.code = ctx.state.$wxInfo.loginState
        ctx.state.data = ctx.state.$wxInfo.userInfo
        ctx.state.data['time'] = Math.floor(Date.now() / 1000);
    }else {
        ctx.state.code = -1
        ctx.state.data = ctx.state.$wxInfo.userInfo
    }
};
module.exports = {
    login: login,
};