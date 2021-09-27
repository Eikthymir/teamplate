import store from '@/store'
import BASE_API from '@/apiconfig.js'
import {
  getToken
} from '@/common/utils/auth.js'

/**
 * @description : 基于uni.request api进行请求方法封装
 * @param {String} url 请求地址 
 * @param {String} method 请求方法
 * @param {Object} data 请求参数
 * @param {Object} header 请求头  
 * @example export function login(data) {
	 return request({
		 url: '',
		 method: 'POST', // method必须大写
		 data,
		 header: {
			 'content-type': 'application/x-www-form-urlencoded'
		 }
	 })
 }
 * @return {Promise}
 */
const request = ({
  url,
  method = 'POST',
  data = {},
  header = {
    'content-type': 'application/json',
    'token': getToken()
  }
}) => new Promise((resolve, reject) => {
  uni.request({
    url: BASE_API + url,
    data: data,
    method: method,
    header: header,
    success: function(res) {
      if (res.code !== 200) {
        console.log(res.message)
      } else {
        resolve(res.data)
      }
    },
    fail: function(err) {
      reject(err)
    }
  })
})


/**
 * @description : 基于uni.request api进行请求类封装
 * @param {String} url 请求地址 
 * @param {String} method 请求方法
 * @param {Object} data 请求参数
 * @param {Object} header 请求头  
 * @example 
    import ajax from '@/common/utils/request.js'
    class user extends ajax {
      constructor() {
        super()
      }
      
      login(params) {
        return this.get(url, params)
      }
      
      export default new user()
    }
 * @return {Promise}
 */
class ajax {
  constructor() {
    this.get = (url, data) => this.request('GET', url, data)
    this.post = (url, data) => this.request('POST', url, data)
    this.put = (url, data) => this.request('PUT', url, data)
    this.delete = (url, data) => this.request('DELETE', url, data)
  }

  async request(method, url, data) {
    return new Promise((resolve, reject) => {
      uni.request({
        method,
        url: BASE_API + url,
        data: data,
        timeout: 30000,
        header: {
          'Content-Type': 'application/json;charset=UTF-8',
          Accept: 'application/json, text/plain, */*',
          Authorization: getToken()
        },
        success: function({
          data: res
        }) {
          if (res.code === 0) {
            resolve(res)
          } else if (res.code === 401) {
            reject(res)
          } else {
            reject(res)
          }
        },
        fail: function(err) {
          reject(err)
        }
      })
    })
  }
}

export default request
