import router from './router'
import { getToken } from '@/utils/auth' // 从cookie中取token

const whiteList = ['/login', '/auth-redirect'] // 设置白名单

router.beforeEach(async(to, from, next) => {
  const hasToken = getToken()
  // 登录过有token
  if (hasToken) {
    // 登录过就不能访问登录界面，需要中断这一次路由守卫，执行下一次路由守卫，并且下一次守卫的to是主页'
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      next()
    }
  } else if (!to.meta.requireAuth) {
    // 网站类一般使用requireAuth要求登录
    // 后台管理类一般使用权限身份校验动态生成路由
    // https://github.com/PanJiaChen/vue-element-admin/blob/i18n/src/store/modules/permission.js
    next()
  } else {
    // 没有登录过
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果要进入的页面属于上面配置的白名单则允许进入
      next()
    } else {
      // 没登录过且要进入的页面不属于白名单则重定向至登录页面
      next(`/login?redirect=${to.path}`)
    }
  }
})
