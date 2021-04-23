import store from '@/store'

import BASE_API from '@/apiconfig.js'

import { getToken } from '@/common/utils/auth.js'

/**
 * @description : 基于uni.request api进行封装
 * @param {object}
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

export default request;
