/**
 * ajax 服务路由集合
 */
var constants = require('../controllers/constants');
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')
const {authorizationMiddleware, validationMiddleware} = require('../controllers/middleware/authMiddleware')
// --- 登录与授权 Demo --- //
// 登录接口
router.post('/banner', validationMiddleware,controllers.banner.banner)
router.post('/login', authorizationMiddleware, controllers.login.login)
router.get('/user', validationMiddleware, controllers.user.user)
router.post('/controller', validationMiddleware, controllers.controller.controller)
router.get('/policy', validationMiddleware, controllers.policy.policy);
router.post('/upload/upMsg', validationMiddleware, controllers.upload.upMsg)
router.post('/upload/upToAgree', validationMiddleware, controllers.upload.upToAgree)
router.post('/upload/addPage', validationMiddleware, controllers.addPage.addPage)
router.post('/select/page', controllers.select.pageSelect)
router.post('/select/vip', controllers.select.vipSelect)
router.post('/select/addPage', validationMiddleware, controllers.select.addPageSelect)
router.post('/payment', validationMiddleware, controllers.payment.payment)
router.post('/payment/select', validationMiddleware, controllers.payment.vipSelect)

router.post('/select/test', controllers.test.test)
module.exports = router
