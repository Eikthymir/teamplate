import {getNetworkType} from '@/common/js/utils.js'
import store from '@/store'
export const appUrl = 'https://app.huayingmusic.com/api/v1' // 线上地址
// export const appUrl = 'https://dzdgl.goho.co/api/v1' // 线下测试地址
// export const appUrl = 'http://192.168.0.50:8000/api/v1' // 线下测试地址
// export const appUrl = 'http://192.168.0.111:8000/api/v1' // 线下测试地址
// export const xfUrl = 'http://192.168.0.50:8082/api/v1' // 宣发线下测试地址
export const xfUrl = 'https://xfapp.huayingmusic.com/api/v1' // 宣发线上地址
export const webappUrl = 'https://musich5.huayingmusic.com/#' // 分享地址
let timeOut = null
let isExpired = true
//网络请求   request('/api/login',{a:1,b:2}) request('/api/login',{a:1,b:2},'GET') request('/api/login','GET')  request('/api/login',{a:1,b:2},'GET',{'content-type':'application/x-www-form-urlencoded'})
const request = ({
	url,
	method = 'POST',
	data = {},
	header = {
		'content-type': 'application/json'
	},
	loadingVisible = false
}) => new Promise((resolve, reject) => {
	
	if(!store.state.isLinkNet) {
		getNetworkType(res => {
			if(res === 'none') {
				if(isExpired) {
					isExpired = false
					uni.showToast({
						title: '当前网络不可用,请检查网络连接',
						icon: 'none'
					})
					timeOut = setTimeout(() => {
						isExpired = true
					}, 3000)
				}
				return false
			} else store.commit('changeIsLinkNet', true)
		})
	}
	
	if (!uni.getStorageSync('url')) uni.setStorageSync('url', appUrl);
	let headers = {
		...header,
		'token': (uni.getStorageSync('url') === appUrl) ? uni.getStorageSync('token') : uni.getStorageSync('xf-token')
	}
	if (loadingVisible) {
		uni.showLoading({
			title: '加载中'
		})
	}
	uni.request({
		url: uni.getStorageSync('url') + url,
		data: data,
		method: method,
		header: headers, //请求的 header 中 content-type 默认为 application/json   除非特定
		success: function(res) {
			if (res.data.code === 200) resolve(res.data)
			else if (res.data.code === 20005 || res.statusCode === 401 || res.data.code === 20002) {
				// uni.redirectTo({
				// 	url: '/pages/login/login',
				// 	fail() {
				// 		uni.reLaunch({
				// 			url: '/pages/login/login'
				// 		})
				// 	}
				// })

				if (uni.getStorageSync('url') === appUrl) {
					store.commit("updateIsShowLogin", true)
					uni.setStorageSync('token', '')
					uni.setStorageSync('userInfo', {})
				} else {
					uni.setStorageSync('xf-token', '')
					uni.switchTab({
					    url: '/pages/user/user'
					})
				}
				reject(res.data)
			} else if (res.data.code === 0) {
				resolve({ code: 0, data: null, msg: res.data.msg});
			} else resolve(res.data)
		},
		fail: function(err) {
			if (err.errMsg === 'request:fail') uni.showToast({
				icon: 'none',
				title: '请求数据超时，请稍后重试'
			})
			uni.hideLoading()
			reject(err)
		},
		complete: function(res) {
			if (loadingVisible) {
				uni.hideLoading()
			}
		}
	})
})

export default request;

/************* example *********************/
/*	api接口
	const albumList = (data, header= { 'content-type' :'application/json' }) => {
		return request({
			url: '/api/v1/albumList',
			method: 'GET',
			data,
			header,
		})
	}
	
	module.exports = {
		albumList
	}
	
/*	页面调用
	
	onLoad() {
		this.$api.albumList().then(res => {
			console.log(data)
		})
	}
	  
*/
