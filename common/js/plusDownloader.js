import {
	HySQLite
} from '@/common/js/hySQLite'
import {requestPermission, getTime, getNetworkType} from '@/common/js/utils.js'
export class Downloader {
	hySQLite = null
	// 文档地址 http://www.html5plus.org/doc/zh_cn/downloader.html#plus.downloader.DownloadOptions
	downOptions = {
		method: 'GET',
		data: '',
		filename: '',
		priority: 0,
		timeout: 30000,
		retry: 3,
		retryInterval: 10
	}
	clearCacheInterval = 259200000 // 删除缓存的间隔,单位为ms, 如3天为3*24*60*60*1000=259200000
	// clearCacheInterval = 5*60*1000
	// 保存缓存歌曲的数据库字段
	musicCV = {
		id: 'TEXT', // 歌曲Id
		src: 'TEXT', // 歌曲所在本地地址
		avatarSrc: 'TEXT', // 歌曲头像本地地址
		backgroundSrc: 'TEXT', // 歌曲背景图片本地地址
		createdAt: 'TEXT', // 创建时间
	}
	imageCV = {
	
	}
	videoCV = {
	
	}
	// 表名
	tableName_music = 'cache_Music'
	tableName_image = 'cache_image'
	tableName_video = 'cache_Video'
	tableName_downloaderMusic = 'download_Music'
	
	constructor(arg) {
		this.downloader = {}
		this.fileType = ''
		// #ifdef APP-PLUS
		this.downPath = plus.os.name === 'iOS' ? '_doc/cache/' : '_downloads/cache/'
		this.platform = plus.os.name
		this.hySQLite = new HySQLite() // 实例化数据库操作类
		this.createPath()
		if (this.platform === 'Android') {
			requestPermission()
		}
		// setTimeout(() => {
		// 	this.createTable('music')
		// }, 1000)
		// #endif
	}
	// 创建文件目录
	createPath() {
		plus.io.resolveLocalFileSystemURL(this.downPath, (parentEntry) => {
			if(parentEntry.isDirectory) {
				console.log('文件夹已经存在')
			} else {
				let FirstFileName = plus.os.name === 'iOS' ? '_doc' : '_downloads'
				plus.io.resolveLocalFileSystemURL(
				    FirstFileName,
				    (entry) => {
				    	entry.getDirectory('cache', {create:true,exclusive:false},(entry1) => {
							// 新建缓存歌曲文件夹
							entry1.getDirectory('music', {create:true,exclusive:false}, (entry2) => {
								  console.log('创建或打开成功-music')
							}, () => {
								console.log('创建或者打开子目录失败-music')
							})
							// 新建缓存图片文件夹
							entry1.getDirectory('image', {create:true,exclusive:false}, (entry3) => {
								  console.log('创建或打开成功-image')
							}, () => {
								console.log('创建或者打开子目录失败-image')
							})
							// 新建缓存视频文件夹
							entry1.getDirectory('video', {create:true,exclusive:false}, (entry4) => {
								  console.log('创建或打开成功-video')
							}, () => {
								console.log('创建或者打开子目录失败-video')
							})
				            console.log('创建或打开成功-cache')
						},() => {
							console.log('创建或者打开子目录失败-cache')
						})
				    },
				    (e) => {
						console.log('获取io操作对象失败', e)
				})
			}
		})
	}
	// 创建音乐下载任务,保存头像,歌曲,背景图片
	createMusicCacheDownlaoder(songInfo) {
		let onlyWifi = uni.getStorageSync('onlyWIFI') === undefined ? false : uni.getStorageSync('onlyWIFI') // 是否仅WiFi播放
		let allowDownlaod = false
		if(onlyWifi) {
			getNetworkType((res) => {
				if(res === 'wifi') {
					allowDownlaod = true
				} else {
					allowDownlaod = false
				}
			})
		} else {
			allowDownlaod = true
		}
		if(!allowDownlaod) {
			return false
		}
		let info = {
			id: songInfo.id, // 歌曲Id
			src: songInfo.src, // 歌曲所在本地地址
			avatarSrc: songInfo.avatar, // 歌曲头像本地地址
			// backgroundSrc: songInfo.background, // 歌曲背景图片本地地址
		}
		this.clearAll()
		console.log(info)
		if(info.src) {
			this.createDownloader(info.src, 'music', info, 'src', (res) => {
				if(res){
					if(info.avatarSrc) {
						this.createDownloader(info.avatarSrc, 'image', info, 'avatarSrc', () => {
							// if(info.backgroundSrc) {
							// 	this.createDownloader(info.backgroundSrc, 'image', info, 'backgroundSrc')
							// }
						})
					} else {
						// if(info.backgroundSrc) {
						// 	this.createDownloader(info.backgroundSrc, 'image', info, 'backgroundSrc')
						// }
					}
				}
			})
		}
	}
	// 创建下载 url 下载地址, filetype 文件类型, info 数据信息, type 数据库存储字段
	createDownloader(url, fileType, info, type, callback) {
		this.downOptions.filename = this.downPath + fileType + '/' + (new Date()).getTime() + this.getFileType(url, fileType)
		console.log('文件路径' + this.downOptions.filename)
		try{
			let downloader = plus.downloader.createDownload(url, this.downOptions, async (download, status) => {
				if(status === 200 && download.state === 4) {
					let isFile = await this.isFile(download.filename)
					if(isFile) {
						console.log('下载完成,当前下载的信息', info)
						
						// 判断数据库是否已经打开，未打开则打开数据库
						if (!this.hySQLite.isOpenDB({})) {
							await this.hySQLite.openDB({})
						}
						// 查询数据库中是否有保存有这首歌
						let selectRes = await this.hySQLite.selectSQL({
							sql: 'select * from ' + this.tableName_music + ' where id="' + info.id + '"'
						})
						let values = {
							id: info.id, // 歌曲Id
							src: type === 'src' ? this.platform === 'iOS' ? download.filename : plus.io.convertLocalFileSystemURL(download.filename) : '', // 歌曲所在本地地址
							avatarSrc: type === 'avatarSrc' ? this.platform === 'iOS' ? download.filename : plus.io.convertLocalFileSystemURL(download.filename) : '', // 歌曲头像本地地址
							// backgroundSrc: type === 'backgroundSrc' ? this.platform === 'iOS' ? download.filename : plus.io.convertLocalFileSystemURL(download.filename) : '', // 歌曲背景图片本地地址
							createdAt: (new Date()).getTime(), // 缓存文件创建时间
						}
						if (selectRes.length > 0) {
							// 开始事务
							try {
								await this.hySQLite.transactionDB({
									operation: 'begin'
								})
								await this.hySQLite.executeSql({
									sql: 'UPDATE ' + this.tableName_music + ' SET ' + type + '= "' + values[type] + '" ' +
										'where id = "' + info.id + '"'
								})
								
								await this.hySQLite.transactionDB({
									operation: 'commit'
								})
								if(typeof callback === 'function') {
									callback(true)
								}
							} catch (e) {
								//TODO handle the exception
								if (this.hySQLite.isOpenDB({})) {
									this.hySQLite.closeDB({})
								}
								console.log('更新数据错误')
								if(typeof callback === 'function') {
									callback(false)
								}
							}
						} else {
							try {
								let cvObj = this.getCV('music', values)
								await this.hySQLite.transactionDB({
									operation: 'begin'
								})
								await this.hySQLite.executeSql({
									sql: 'INSERT INTO ' + this.tableName_music + ' ' + cvObj.columns + ' VALUES ' + cvObj.values
								})
								await this.hySQLite.transactionDB({
									operation: 'commit'
								})
								if(typeof callback === 'function') {
									callback(true)
								}
							} catch (e) {
								//TODO handle the exception
								if (this.hySQLite.isOpenDB({})) {
									this.hySQLite.closeDB({})
								}
								if(typeof callback === 'function') {
									callback(false)
								}
							}
						}
					}
				}
			})
			downloader.start()
			downloader.addEventListener('statechanged', this.downloadEventChange)
		}catch(e){
			//TODO handle the exception
			console.log('创建下载报错' + e)
			if(typeof callback === 'function') {
				callback(false)
			}
		}
	}
	// 清除所有未完成的任务
	clearAll() {
		plus.downloader.clear()
	}
	// 下载状态改变触发事件
	downloadEventChange(download, status) {
		if(status === 400 && download.state === 4) {
			console.log('下载完成,当前下载的信息')
		}
	}
	// 获取文件名
	getFileType(url, fileType) {
		switch(fileType) {
			case 'music':
				return url.slice(url.lastIndexOf('.'), url.lastIndexOf('?'))
				break;
			case 'image':
				return url.slice(url.lastIndexOf('.'), url.lastIndexOf('?'))
				break;
			case 'video':
				return url.slice(url.lastIndexOf('.'), url.lastIndexOf('?'))
				break;
			default:
				return url.slice(url.lastIndexOf('.'), url.lastIndexOf('?'))
		}
	}
	// 判断是否是一个文件
	async isFile(path) {
		return new Promise((resolve, reject) => {
			plus.io.resolveLocalFileSystemURL(
			    path,
			    (entry) => {
					if(entry.isFile){
						resolve(true)
					}else{
						resolve(false)
					}
			    },
			    (e) => {
					console.log(e.message);
					resolve(false)
			    }
			);
		})
	}
	/**
	 * @描述：创建数据库表格
	 * @参数：!type: 数据库表的类型名, 可选值为music/音乐 image/图片 video/视频
	 * @返回值：void
	 * */
	createTable(type) {
		let tempTableName = ''
		let tempCVObj = ''
		switch (type) {
			case 'music':
				tempTableName = this.tableName_music
				tempCVObj = this.musicCV
				break
			case 'image':
				tempTableName = this.tableName_image
				tempCVObj = this.imageCV
				break
			case 'video':
				tempTableName = this.tableName_video
				tempCVObj = this.videoCV
				break
			default:
				break
		}
		console.log('tempCVObj', tempCVObj)
		this.hySQLite.createTable({
			tableName: tempTableName,
			contentValues: tempCVObj,
		})
	}
	/**
	 * @描述：获取要插入数据的cv对和数据对应表名
	 * @参数：!type: 数据库表的类型名, 可选值为music/音乐 image/图片 video/视频，!info: 要写入的文件数据
	 * @返回值：Objest类型，如{
		 columns: tempC, // 存入的值
		 values: tempV, // 存入的字段名
		 tableName: tempTableName, // 表名
	 }
	 * */
	getCV(type, info) {
		let tempCVObj = {}
		let tempTableName = ''
		let tempC = '('
		let tempV = '('
		switch (type) {
			case 'music':
				tempTableName = this.tableName_music
				tempCVObj = this.musicCV
				break
			case 'image':
				tempTableName = this.tableName_image
				tempCVObj = this.imageCV
				break
			case 'video':
				tempTableName = this.tableName_video
				tempCVObj = this.videoCV
				break
			default:
				break
		}
		for (let index in tempCVObj) {
			if (tempCVObj.hasOwnProperty(index)) {
				tempC += index + ','
				if (info[index] === undefined || info[index] === null || info[index] === '') {
					tempV += 'NULL, '
				} else {
					tempV += '"' + info[index] + '", '
				}
	
			}
		}
		tempC = tempC.substring(0, tempC.length - 1) + ')'
		tempV = tempV.substring(0, tempV.length - 2) + ')'
		return {
			columns: tempC,
			values: tempV,
			tableName: tempTableName,
		}
	}
	// 查询所有数据
	selectAll() {
		// 判断数据库是否已经打开，未打开则打开数据库
		if (!this.hySQLite.isOpenDB({})) {
			console.log('selectAll')
			this.hySQLite.openDB({})
		}
		
		this.hySQLite.selectSQL({
			sql: 'select * from ' + this.tableName_music
		}).then(res => {
			console.log('123456', res)
		})
	}
	// 删除所有数据
	deleteInfo() {
		this.hySQLite.dropTable({
			tableName: this.tableName_music,
		})
	}
	// 检查数据库中是否存在该音乐的缓存 songInfo 歌曲信息
	async checkSongCache(songInfo, callback) {
		this.checkFileMapDatabase(songInfo.id, (res) => {
			if(res.code === 1) {
				if(typeof callback === 'function') {
					callback({
						data: res.data,
						code: 1
					})
				}
			} else {
				if(typeof callback === 'function') {
					callback({
						data: {},
						code: 0
					})
				}
			}
		})
	}
	// 删除文件
	deleteFile(filePath) {
		plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
			console.log('进入目录')
			if(entry.isFile) {
				entry.remove((res) => {
					console.log('删除文件成功', res)
				}, (err) => {
					console.log('删除文件失败', err)
				})
			} else {
				console.log('当前url不是一个文件', filePath)
			}
		}, (e) => {
			console.log('通过URL参数获取目录对象或文件对象读取文件失败', e)
		})
	}
	// 清除大于三天的缓存
	async clearCache() {
		let allList = [] // 查询出来的所有数据
		let nowTime = (new Date()).getTime()
		allList = await this.hySQLite.selectDB({
			whereString: 'select * from ' + this.tableName_music
		})
		for(let i = 0, len = allList.length; i < len; i++) {
			if(nowTime - Number(allList[i].createdAt) > this.clearCacheInterval) {
				this.deleteFile(allList[i].src)
				this.deleteFile(allList[i].avatarSrc)
				// this.deleteFile(allList[i].backgroundSrc)
				
				await this.hySQLite.deleteDB({
					tableName: this.tableName_music,
					whereString: 'where id="' + allList[i].id + '"'
				})
			}
		}
	}
	// 检查文件与数据库中的数据与路径是否一一对应,若数据缺失则删除所有相关数据
	async checkFileMapDatabase(songId, callback) {
		let songInfo = []
		let tempData = {
			src: '',
			avatarSrc: '',
			// backgroundSrc: ''
		}
		let tempSongInfo = await this.hySQLite.selectDB({
			whereString: 'select * from ' + this.tableName_downloaderMusic + ' where id="' + songId + '"'
		}) // 数据库查询出来的数据
		if (tempSongInfo.length > 0) {
			tempData.avatarSrc = tempSongInfo[0].avatar
			// tempData.backgroundSrc = tempSongInfo[0].background
			if (tempSongInfo[0].sq_url && tempSongInfo[0].sq_url.indexOf('https:') === -1) {
				tempData.src = tempSongInfo[0].sq_url
			} else {
				if (tempSongInfo[0].hq_url && tempSongInfo[0].hq_url.indexOf('https:') === -1) {
					tempData.src = tempSongInfo[0].hq_url
				} else {
					if (tempSongInfo[0].url && tempSongInfo[0].url.indexOf('https:') === -1) {
						tempData.src = tempSongInfo[0].url
					}
				}
			}
			songInfo.push(tempData)
		}
		
		if(songInfo.length < 1) {
			songInfo = await this.hySQLite.selectDB({
				whereString: 'select * from ' + this.tableName_music + ' where id="' + songId + '"'
			}) // 数据库查询出来的数据
		}
		
		if(songInfo && songInfo.length > 0) {
			let src = await this.isFile(songInfo[0].src)
			let avatarSrc = await this.isFile(songInfo[0].avatarSrc)
			// let backgroundSrc = await this.isFile(songInfo[0].backgroundSrc)
			// if(src && avatarSrc && backgroundSrc) {
			if(src && avatarSrc) {
				if(typeof callback === 'function') {
					callback({
						data: songInfo[0],
						code: 1
					})
				}
			} else {
				if(typeof callback === 'function') {
					callback({
						data: {},
						code: 0
					})
				}
				this.deleteFile(songInfo[0].src)
				this.deleteFile(songInfo[0].avatarSrc)
				// this.deleteFile(songInfo[0].backgroundSrc)
				
				await this.hySQLite.deleteDB({
					tableName: this.tableName_music,
					whereString: 'where id="' + songInfo[0].id + '"'
				})
			}
		} else {
			if(typeof callback === 'function') {
				callback({
					data: {},
					code: 0
				})
			}
		}
	}
}