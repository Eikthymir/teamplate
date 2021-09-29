import {
  getQueryVariable,
  toast,
  db
} from '../utils/index.js'
import {
  getWebOpenid
} from './miniUtils.js'
import login from '../utils/login.js'

/**
@autoLogin { string } 表示从首页进来需要直接登录
@path { string } 表示授权成功后跳转的页面
*/
export const webAuth = (autoLogin, path, callback) => {
  if (typeof window === 'undefined') {
    return false
  }
  if (db.get('openid')) {
    return false
  }
  try {
    // wx3b5bde703e22e781
    const appid = 'wx0b7e2706b2fa1c0b'
    const authUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize'
    const urls = `https://web.meiyechuancheng.com/#${path || '/pages/login'}`
    const redirect_uri = encodeURIComponent(urls)
    const code = getQueryVariable('code')
    console.log('code', path)
    if (!code) {
      if (autoLogin) {
        return
      }
      window.location.href =
        `${authUrl}?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&#wechat_redirect`
    } else {
      getWebOpenid(code, (res) => {
        console.log('getWebOpenid', res)
        if (res && res.code === 0) {
          // toast('授权成功')
          const model = {
            login_type: 1
          }
          const result = res.data
          const wxObj = {
            openid: result.openid,
            unionid: result.unionid,
            wxUserInfo: result.extend,
            access_token: result.access_token
          }
          // console.log('@@@@@@@@@@@@@@@', path)
          if (!path || path === '/pages/open/open_vip') {
            login(model, 'weixin', wxObj, () => {
              if (callback) {
                callback()
              }
            })
          }
        } else {
          // toast('授权失败，请重新授权')
          setTimeout(() => {
            window.close()
          }, 1500)
        }
      })
    }
  } catch (e) {
    toast('授权失败，请重新授权')
    setTimeout(() => {
      window.close()
    }, 1000)
    console.log(e)
    //
  }
}
