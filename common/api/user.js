/**
 * @description: request方法基于自带api进行封装，utils/request.js
 * 参考axios文档http://www.axios-js.com/zh-cn/docs/
 * @param {object | undefined} data - 传递给后端的参数为对象类型/空
 * @example login({name: z, password: z})
 * @return {function request(config)}
 */
import request from '@/common/utils/request.js'

export function login(data) {
  return request({
    url: '',
    method: 'POST',
    data
  })
}

export function getInfo(data) {
  return request({
    url: '',
    method: 'GET',
    data
  })
}

export function logout() {
  return request({
    url: '',
    method: 'POST'
  })
}
