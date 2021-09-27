import ajax from './request.js'
import {
  toast
} from './index.js'
import store from '@/store'

/**
 * js_code微信登录
 */
const wxLogin = (user = {}) => {
  return new Promise((resolve, reject) => {
    // 获取code
    try {
      uni.login({
        provider: 'weixin',
        success: (res) => {
          getUserInfoFromAPI({
            url: 'wxa/login_by_jscode',
            js_code: res.code,
            user: user
          }).then(() => {
            resolve(res)
          })
        },
        fail: err => {
          reject(err)
          toast('获取code信息失败')
        },
      });
    } catch (e) {
      //TODO handle the exception
    }
  })
}


// 检查微信授权信息是否过期了
const checkSession = () => {
  return new Promise((resolve, reject) => {
    uni.checkSession({
      success() {
        console.log('没过期')
        resolve(true)
      },
      fail() {
        console.log('过期了')
        resolve(false)
      }
    })
  })
}


/**
 * 后台获取用户信息，手机号
 * @params { String } url 接口请求地址
 * @params { String } js_code 微信js_code
 * @params { Object } user 加密微信用户信息
 * @params { Boolean } showToast 是否提示
 * @params { Boolean } loading 是否显示加载
 * @time: 2021-7-29
 */
const getUserInfoFromAPI = async ({
  url = '',
  js_code = '',
  user = {},
  showToast = false,
  loading = false
}) => {
  try {
    if (loading) {
      uni.showLoading({
        title: '授权中'
      })
    }
    const res = await new ajax().post(`${url}`, {
      js_code,
      appid: 'wx444f22aba24857a1',
      ...user
    })
    if (res && loading) uni.hideLoading()
    if (showToast) {
      uni.showToast({
        icon: res.code === 0 ? 'success' : 'error',
        title: res.code === 0 ? "授权成功" : '授权失败',
      })
    }
    if (res.code === 0) {
      store.commit('user/updateUserData', res.data)
      store.commit('user/updateOpenid', res.data.wxaUser.openid)
      store.commit('user/updateToken', res.data.token)
      return res
    }
  } catch (e) {
    uni.showToast({
      icon: 'error',
      title: '授权失败'
    })
    console.log('login Error', e)
    //TODO handle the exception
  }
}

/**
 * @description 获取微信小程序头像等用户信息
 * @param { Object } params 自定义提示 title: 提示文字
 * @return { Promise } resolve: 成功获取，reject： 获取失败
 */
const getUserProfile = ({
  desc = '',
  showToast = false
}) => {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: desc ? desc : '获取手机、头像用于参加拼团',
      lang: 'zh_CN',
      success: (res) => {
        if (showToast) toast('授权成功')
        resolve(res)
      },
      fail: (err) => {
        toast('授权失败')
        reject(err)
      }
    })
  })
}

/**
 * 微信小程序支付
 * @param { Object } data 支付参数
 */
const wxPay = (data) => {
  return new Promise((resolve, reject) => {
    console.log(data)
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: data.timeStamp,
      nonceStr: data.nonceStr,
      package: data.package,
      signType: data.signType,
      paySign: data.paySign,
      success: res => {
        console.log('success:' + JSON.stringify(res));
        // toast('支付成功')
        resolve(1)
      },
      fail: err => {
        toast('支付失败')
        uni.hideLoading()
        reject(0)
      }
    })
  })
}

/**
 * 微信内网页支付
 * @param { Object } params 参数
 * @param { Function } callback 回调函数
 */
const wxWebPay = (params, callback) => {
	// #ifdef H5
	function onBridgeReady() {
		WeixinJSBridge.invoke(
			'getBrandWCPayRequest', params,
			function(res) {
				if (res.err_msg == "get_brand_wcpay_request:ok") {
					callback(res)
					// 使用以上方式判断前端返回,微信团队郑重提示：
					//res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
				}
			});
	}
	if (typeof WeixinJSBridge == "undefined") {
		if (document.addEventListener) {
			document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
		} else if (document.attachEvent) {
			document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
			document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
		}
	} else {
		onBridgeReady();
	}
	// #endif
}

export {
  wxLogin,
  checkSession,
  getUserProfile,
  getUserInfoFromAPI,
  wxPay,
  wxWebPay
}
