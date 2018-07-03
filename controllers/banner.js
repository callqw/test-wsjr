/**
 * Created by xj on 2018/6/10.
 */
const Banner = require('../module/banner');
var banner = async function (ctx, next) {
    console.log(ctx.state.$wxInfo, 'banner')
    var data = ctx.request.body;
    if (ctx.state.$wxInfo.loginState == 1) {
console.log(data ,'data')
        if(data[0] !=undefined){
            var res = await Banner.cbn(data,ctx.state.$wxInfo.skey);
            ctx.state.code = res.code;
            ctx.state.data = res.data;
        }else {
            var res = await Banner.banner(ctx.state.$wxInfo);
            ctx.state.code = res.code;
            ctx.state.data = res.data;
        }

    } else {
        ctx.state.code = -1;
        ctx.state.data = '开场动画错误';
    }


}
module.exports = {banner: banner}