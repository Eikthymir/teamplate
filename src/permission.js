import router from './router'
import { getToken } from '@/utils/auth'

const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async(to, from, next) => {
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      next()
    }
  } else if (!to.meta.requireAuth) {
    next()
  } else {
    // 没有登录过
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})
