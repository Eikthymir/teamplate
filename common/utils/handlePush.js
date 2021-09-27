function handlePush () {
  // #ifdef APP-PLUS
  const handleClick = (message) => {
    let payload = message.payload
    // ios里面是会有两个payload
    if (message.payload.payload) {
      payload = message.payload.payload
    }
    const unescapePayload = unescape(payload)
    const newPlayload = JSON.parse(unescapePayload)
    if (!newPlayload) {
      console.log('非法格式')
      return
    }
    const page = newPlayload.page
    // 如果是消息要设置为已读
    // if (page.indexOf('message') > -1) {
    // 	store.commit('setMessageHit', getUrlParam(page).id);
    // }
    // 如果没有登录
    uni.navigateTo({
      url: page
    })
    //导入ios UIApplication
    const UIApplication = plus.ios.import('UIApplication')
    const app = UIApplication.sharedApplication()
    //获取应用图标的数量
    let oldNum = app.applicationIconBadgeNumber()
    let newNum = oldNum - 1
    //设置应用图标的数量
    plus.runtime.setBadgeNumber(newNum)
    //导入个推原生类
    const GeTuiSdk = plus.ios.importClass('GeTuiSdk')
    GeTuiSdk.setBadge(newNum)
    console.log('角标数量', oldNum)
  }
  plus.push.addEventListener('click', function (message) {
    console.log('push click', message)
    handleClick(message)
  })
  plus.push.addEventListener('receive', function (message) {
    console.log('push receive', message)
    // ios 应用再前台运行不会创建通知 需要自己创建 自己创建也会触发该事件 自己创建少一个type
    if (message.type === 'receive') {
      plus.push.createMessage(message.payload.content, message.payload, {
        title: message.payload.title,
        cover: false
      })
    }
  })
  console.log(plus.push.getClientInfo())
  // console.log(plus.push.getClientInfo())
  // console.log('手机型号', plus.device.getInfo())
  // #endif
}

export default handlePush
