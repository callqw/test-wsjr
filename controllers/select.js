/**
 * Created by xj on 2018/5/21.
 */
var PageSelect = require('../module/select');
var util = require('./utils');
var constants = require('./constants');
var pageSelect = async function (ctx, next) {
    var data = ctx.request.body;
    var res = await PageSelect.pageSelect(data);
    ctx.state.code = res.code;
    ctx.state.data = res.data;
}
var addPageSelect = async function (ctx, next) {
    if (ctx.state.$wxInfo.loginState === 1) {
        var query = ctx.query;
        var data = ctx.request.body;
        console.log(query.select, 15);
        if (query.select == 'a') {
            var res = await PageSelect.countMeSelect(data);
            ctx.state.code = res.code;
            ctx.state.data = res.data;
        } else {
            var res = await PageSelect.addPageSelect(data);
            ctx.state.code = res.code;
            ctx.state.data = res.data;
        }
    } else {
        console.log(ctx.state.$wxInfo)
        //中间件验证未通过
        ctx.state.code = ctx.state.$wxInfo.loginState
        ctx.state.data = ctx.state.$wxInfo.msg
    }


}
var vipSelect = async function (ctx, next) {
    var data = ctx.request.body;

    var res = await PageSelect.vipSelect(data);
    ctx.state.code = res.code;
    ctx.state.data = res.data;
}
module.exports = {
    vipSelect: vipSelect,
    pageSelect: pageSelect,
    addPageSelect: addPageSelect
}