export default {
  data() {
    return {

    }
  },
  computed: {
    //设置默认的分享参数
    shareParams() {
      return {
        title: '商品分享',
        path: '/pages/index/index',
        imageUrl: '',
        desc: '',
        content: ''
      }
    }
  },
  onShareAppMessage(res) {
    return {
      title: this.shareParams.title,
      path: this.shareParams.path,
      imageUrl: this.shareParams.imageUrl,
      desc: this.shareParams.desc,
      content: this.shareParams.content,
      success(res) {
        uni.showToast({
          title: '分享成功'
        })
      },
      fail(res) {
        uni.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    }
  }
}
