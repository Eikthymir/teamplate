/**
 * @description: request方法基于axios进行封装，utils/request.js
 * @param {object | undefined} data - 传递给后端的参数为对象类型/空
 * @example login({name: z, password: z})
 * @returns {function request(config)} 参考axios文档http://www.axios-js.com/zh-cn/docs/
 */
import request from '@/utils/request'

export function login(data) {
  return request({
    url: '',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '',
    method: 'post'
  })
}
