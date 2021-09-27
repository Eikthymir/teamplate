/**
 * 判断应用升级模块，从url地址下载升级描述文件到本地local路径
 * yanyilin@dcloud.io
 * 
 * 升级文件为JSON格式数据，如下：
{
	"appid":"HelloH5",
    "iOS":{
    	"version":"iOS新版本号，如：1.0.0",
    	"note":"iOS新版本描述信息，多行使用\n分割",
    	"url":"Appstore路径，如：itms-apps://itunes.apple.com/cn/app/hello-h5+/id682211190?l=zh&mt=8",
		
    },
    "Android":{
    	"version":"Android新版本号，如：1.0.1",
    	"note":"Android新版本描述信息，多行使用\n分割",
    	"url":"apk文件下载地址，如：http://www.dcloud.io/helloh5p/HelloH5.apk"
    }
}
 *
 */
import {
	updateApp
} from '@/common/api/index.js'
export class UPDate {
	// server = 'http://www.dcloud.io/helloh5/update.json' //获取升级描述文件服务器地址
	localDir = 'update' // 本地保存升级描述目录
	localFile = 'update.json' // 本地保存升级文件名
	/* 更新信息键名，结构如下：
		{
			completed: false,
			filePath: '../path/..',
			updateAbort: '', //  忽略版本
			updateCheck: '', // 保存用户取消时的时间， 当前时间-用户取消时的时间>升级检查间隔,则取消更新
		}
	 */
	updateInfoKey = 'updateInfo'
	updateInfo = null
	checkInterval = 259200000 // 升级检查间隔,单位为ms, 如3天为3*24*60*60*1000=259200000, 如果每次启动需要检查设置值为0
	// checkInterval = 0
	dir = null
	isForce = false // 是否强制更新
	isSilentInstall =  true// 是否静默安装
	needUpdate = false // 是否需要更新
	serverUpdateInfo = '' // 从服务器获取的更新信息
	
	readData = '' // 从文件中读取的数据
	downloadTask = null
	constructor() {
		
	}
	setCheckInterval (time) {
		this.checkInterval = time
	}
	getServerUpdateInfo() {
		return this.serverUpdateInfo
	}
	/**
	 * 准备升级操作
	 * 创建升级文件保存目录
	 */
	initUpdate(callBack) {
		// // 在流应用模式下不需要检测升级操作
		// if (navigator.userAgent.indexOf('streamApp') >= 0) {
		// 	return;
		// }
		// 打开doc根目录
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
			fs.root.getDirectory(this.localDir, {
				create: true
			}, (entry) => {
				this.dir = entry
				this.getUpdateData(() => {
					this.checkUpdate(callBack)
				})
			}, (e) => {
				this.needUpdate = false
				console.log('打开update目录失败：' + e.message)
			})
		}, (e) => {
			this.needUpdate = false
			console.log('打开doc目录失败' + e.message)
		})
		return this.needUpdate
	}
	/**
	 * 检测程序升级
	 */
	checkUpdate(callBack) {
		// 判断升级检测是否过期
		this.updateInfo = plus.storage.getItem(this.updateInfoKey);
		uni.getStorage({
		    key: this.updateInfoKey,
		    success: (res) => {
		        this.updateInfo = res.data
		    }
		});
		if (this.updateInfo !== null && this.updateInfo.updateCheck) {
			var dc = parseInt(this.updateInfo.updateCheck);
			var dn = (new Date()).getTime();
			if (dn - dc < this.checkInterval) { // 未超过上次升级检测间隔，不需要进行升级检查
				return;
			}
			// 取消已过期，置空取消标记
			this.updateInfo.updateCheck = ''
		}
		// 读取本地升级文件
		this.dir.getFile(this.localFile, {
			create: true
		}, (fentry) => {
			fentry.file((file) => {
				var reader = new plus.io.FileReader();
				reader.onloadend = (e) => {
					fentry.remove();
					var data = null;
					try {
						data = JSON.parse(e.target.result);
					} catch (e) {
						console.log("读取本地升级文件，数据格式错误！", e);
						this.getUpdateData();
						return;
					}
					this.checkUpdateData(data, callBack);
				}
				try{
					reader.readAsText(file);
				} catch(e) {
					console.log('读取本地升级文件，数据格式错误', e)
				}
				
			}, (e) => {
				console.log("读取本地升级文件，获取文件对象失败：" + e.message);
				fentry.remove();
				this.getUpdateData();
			});
		}, (e) => {
			// 失败表示文件不存在，从服务器获取升级数据
			this.getUpdateData();
		});
	}

	/**
	 * 检查升级数据
	 */
	checkUpdateData(j, callBack) {
		var curVer = plus.runtime.version, // 获取当前版本号
			inf = j[plus.os.name];
			this.readData = inf
		if (inf) {
			var srvVer = inf.version;
			// 判断是否存在忽略版本号
			if(!srvVer) {
				this.needUpdate = false
				if(typeof callBack === 'function') {
					callBack(this.needUpdate)
				}
				return
			}
			if (this.updateInfo !== null && this.updateInfo.updateAbort && srvVer == this.updateInfo.updateAbort) {
				// 忽略此版本
				this.needUpdate = false
				if(typeof callBack === 'function') {
					callBack(this.needUpdate)
				}
				return;
			}
			// 判断是否需要升级
			if (this.compareVersion(curVer, srvVer)) {
				this.needUpdate = true
			} else {
				this.needUpdate = false
			}
			if(typeof callBack === 'function') {
				callBack(this.needUpdate)
			}
		}
	}
	/**
	 * 从服务器获取升级数据
	 */
	getUpdateData(callBack) {
		let platform = plus.os.name === 'Android' ? 1 : 2
		updateApp({
			platform
		}).then((res) => {
			this.serverUpdateInfo = res.data[plus.os.name]
			// 保存到本地文件中
			this.dir.getFile(this.localFile, {
				create: true
			}, (fentry) => {
				fentry.createWriter((writer) => {
					writer.onerror = () => {
						console.log("获取升级数据，保存文件失败！");
					}
					writer.onwrite = () => {
						if(typeof callBack === 'function') {
							callBack()
						}
					}
					try {
						writer.write(JSON.stringify(res.data));
					} catch(e) {
						//TODO handle the exception
						console.log('写入文件出错:', e)
					}
				}, (e) => {
					console.log("获取升级数据，创建写文件对象失败：" + e.message);
				});
			}, (e) => {
				console.log("获取升级数据，打开保存文件失败：" + e.message);
			})
		}).catch((err) => {
			console.log('获取更新数据失败' + err)
		})
	}

	/**
	 * 比较版本大小，如果新版本nv大于旧版本ov则返回true，否则返回false，就是把版本号的那几个点拿掉，比数字大小
	 * @param {String} ov
	 * @param {String} nv
	 * @return {Boolean} 
	 */
	compareVersion(ov, nv) {
		if (!ov || !nv || ov == "" || nv == "") {
			return false;
		}
		var b = false,
			ova = ov.split(".", 4),
			nva = nv.split(".", 4);
		for (var i = 0; i < ova.length && i < nva.length; i++) {
			var so = ova[i],
				no = parseInt(so),
				sn = nva[i],
				nn = parseInt(sn);
			if (nn > no || sn.length > so.length) {
				return true;
			} else if (nn < no) {
				return false;
			}
		}
		if (nva.length > ova.length && 0 == nv.indexOf(ov)) {
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * 下载更新包并更新 */
	 downloadAndInstallPackage(callBack, callBackInstall) {
		// this.readData.url = 'https://music-app-pic.oss-cn-shenzhen.aliyuncs.com/M19/10/31/__UNI__A90C1AC.wgt'
		// this.readData.url = 'https://music-app-pic.oss-cn-shenzhen.aliyuncs.com/appResource/Android/__UNI__A90C1AC_1101110541.apk'
		this.downloadTask = uni.downloadFile({ // 下载更新包
		 	url: this.readData.url, //更新资源
		 	success: (res) => {
		 		if (res.statusCode === 200) {
		 			uni.saveFile({ // 保存更新包
		 				tempFilePath: res.tempFilePath,
		 				success: (res) => {
		 					if(this.updateInfo === null) {
		 						this.updateInfo = {}
		 					}
		 					this.updateInfo.filePath = res.savedFilePath
		 					this.updateInfo.completed = false
		 					uni.setStorage({
		 					    key: this.updateInfoKey,
		 					    data: this.updateInfo
		 					})
		 					this.installPackage(true)
							if(typeof callBackInstall === 'function') {
								callBackInstall()
							}
		 				}
		 			});
		 			console.log('下载成功');
		 		}
				this.downloadTask.offProgressUpdate()
				this.downloadTask = null
		 	},
		 	fail: (err) => {
		 		console.log('下载失败', err);
		 	}
		 })
		 
		 this.downloadTask.onProgressUpdate((res) => {
		 	if(typeof callBack === 'function') {
				callBack(res)
			}
		 })
	 }
	/**
	 * 安装升级包
	 */
	installPackage(userChoose) {
		if(userChoose) {
			plus.screen.lockOrientation('portrait-primary') //竖屏正方向锁定
			if (this.updateInfo.completed === true) { // 如果上次刚更新过
				// 删除安装包及安装记录
				uni.removeSavedFile({
					filePath: this.updateInfo.filePath,
					success: (res) => {
						console.log('更新文件删除成功')
					}
				})
				this.updateInfo.completed = ''
				uni.setStorage({
				    key: this.updateInfoKey,
				    data: this.updateInfo
				})
			} else if (this.updateInfo.completed === false) {
				// 需添加是否强制更新
				plus.runtime.install(this.updateInfo.filePath, {
					force: this.isForce
				}, () => {
					this.updateInfo.completed = true
					uni.setStorage({
					    key: this.updateInfoKey,
					    data: this.updateInfo
					})
					let fileType = this.readData.url.substring(this.readData.url.lastIndexOf('.') + 1, this.readData.url.length)
					console.log('this.updateInfoKey', fileType)
					if(fileType === 'wgt') {
						uni.showModal({
							title: '提示',
							content: '应用将重启以完成更新',
							showCancel: false,
							complete: () => {
								plus.runtime.restart()
							}
						})
					}
				}, (e) => {
					console.log('app更新失败:', e)
				})
			} else {
				// initUpdate()
			}
		} else {
			this.updateInfo = {}
			this.updateInfo.updateCheck = (new Date()).getTime().toString()
			uni.setStorage({
			    key: this.updateInfoKey,
			    data: this.updateInfo
			})
			plus.storage.setItem(this.updateInfoKey, this.updateInfo)
		}
	}
}
