import commonApi from '../api/common'
import {
  toast
} from './index.js'

class aliyunUpload {
  constructor() {}

  /**
   *获取凭证
   *@param { String } file 文件
   *@param { String } dir 文件夹
   */
  async start(file, dir) {
    uni.showLoading({
      title: '加载中...'
    })
    try {
      const {
        data: {
          data: result
        }
      } = await commonApi.OSSPolicy(dir)
      const fileName = new Date().getTime()
      const fileUrl = `${result.dir}/${fileName}.jpg`
      const formData = {
        OSSAccessKeyId: result.OSSAccessKeyId,
        policy: result.policy,
        signature: result.signature,
        success_action_status: 200,
        key: fileUrl,
      }
      await this.uniUpload(result.host, formData, file)
      return result.host + '/' + fileUrl
    } catch (error) {
      console.log(error)
      toast('上传失败~')
    }
    return null
  }

  /**
   *调用uniapp的uni.upload不然不支持formdata
   *@param { formData } formData formData
   *@param { String } url 请求地址
   *@param { String } filePath 文件路径
   *@param { String } token token
   */
  uniUpload(url, formData, filePath) {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url,
        filePath,
        formData,
        name: 'file',
        header: {
          Authorization: uni.getStorageSync('token')
        },
        success: (res) => {
          resolve(res)
          uni.hideLoading()
        },
        fail: (err) => {
          reject(err)
          toast('上传失败')
        }
      })
    })
  }
}

export default new aliyunUpload()
