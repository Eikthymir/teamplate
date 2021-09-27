import { toast, getVersion, db } from './index.js'
import commApi from '../api/common/index'

/**
 *检测更新
 */
class checkUpdate {
	constructor() {
		this.isAndroid = uni.getSystemInfoSync().platform === 'android',
		this.android = {}
		this.wgt = { silentUpdate: false }
		this.ios = {}
		this.update_mode = 0 // 0热更新，1整包更新
	}

	/**
	 *请求后台的更新设置 
	 */
	async getSettings(showNotice) {
		if (typeof plus === 'undefined') {
			if (showNotice) {
				toast('已经是最新版本');
			}
			return false
		}
		try {
			const { data: { data: res } } = await commApi.getVersion()
			const { ios, android, wgt, update_mode } = res
			this.ios = ios
			this.android = android
			this.wgt = wgt
			this.update_mode = update_mode
			// 如果是wgt资源热更新
			if (update_mode === 0) {
				return await this.confirmUpdate(showNotice, wgt, 'wgt')
			}
			if (this.isAndroid) {
				return await this.confirmUpdate(showNotice, android, 'android')
			}
			return await this.confirmUpdate(showNotice, ios, 'ios')
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 *热更新安装 
	 */
	wgtUpdate() {
		if (!this.wgt.silentUpdate) {
			uni.showLoading({ title: '开始更新...', mask: false })
		}
		uni.downloadFile({
			url: this.wgt.url,
			success: (res) => {
				if (res.statusCode !== 200) {
					toast('更新失败')
					return
				}
				// 执行安装wgt热更新
				plus.runtime.install(res.tempFilePath, { force: this.wgt.forceUpdate }, () => {
					// 热更新前清除缓存
					// plus.cache.clear()
					// 如果是静默更新
					if (!this.wgt.silentUpdate) {
						toast('更新成功，重启应用')
						setTimeout(() => {
							uni.hideToast()
							plus.runtime.restart()
						}, 1000)
					} else {
						// toast('请重启应用后更新')
						plus.runtime.restart()
					}
				}, (err) => {
					const msg = JSON.stringify(err.message)
					uni.showModal({
						title: '提示',
						confirmText: '确定',
						content: `${msg} ，请点击确定下载最新安装包后再进行更新`,
						success: (res) => {
							if (res.confirm) {
								plus.runtime.openURL(this.isAndroid ? this.android.url : this.ios.url)
							}
						}
					})
				})
			},
			fail: () => {
				toast('更新失败~')
			},
			complete: () => {
				uni.hideLoading()
			}
		})	
	}

	/**
	 *弹出确认更新对话框
	 *@param { Object } plaform 当前平台
	 *@param { Boolean } showNotice 是否显示提示语
	 *@param { Boolean } type 类型
	 */
	async confirmUpdate(showNotice, plaform, type) {
		const currentVersion = await getVersion()
		const userData = db.get('userData') || {}
		const hasTestMobile = this.wgt.testMobile ? this.wgt.testMobile.indexOf(userData.mobile) : -1
		console.log(`当前版本：${currentVersion}，后台设置版本：${plaform.version}`, hasTestMobile)
		const isOnlineVersion = currentVersion > plaform.version
		
		// 如果是wgt强制更新，则忽略版本号, 直接重启，并且版本不相等的情况下
		if (plaform.forceUpdate && (currentVersion !== plaform.version)) {
		  this.wgtUpdate()
		  return isOnlineVersion
		}
		
		// 当前的版本大于后台设置的版本就是最新的
		if (currentVersion >= plaform.version) {
			showNotice && toast('已经是最新版本');
			return isOnlineVersion
		}
		// 如果是测试更新，则需判断所填手机号是否相等
		if (this.wgt.isTest && hasTestMobile < 0 && type === 'wgt') {
			showNotice && toast('已经是最新版本');
			return isOnlineVersion
		}
		// 如果是热更新并且是静默更新
		if (this.wgt.silentUpdate && this.update_mode === 0) {
			this.wgtUpdate()
			return isOnlineVersion
		}
		// 整包更新是否设置了更新提示
		if (!plaform.notice && !showNotice && type !== 'wgt') {
			return isOnlineVersion
		}
		uni.showModal({
		  title: `已有新的内容${plaform.version}`,
			confirmText: '立即更新',
			showCancel: false,
		  content: plaform.releasenote || '暂无更新说明',
		  success: (res) => {
		    if (res.confirm) {
		    	if (type === 'wgt') {
		    		this.wgtUpdate()
		    	} else {
		    		plus.runtime.openURL(plaform.url)
		    	}
		    }
		  }
		})
		return isOnlineVersion
	}

}

export default new checkUpdate()