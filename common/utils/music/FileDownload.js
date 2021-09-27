import {
	HySQLite
} from '@/common/js/hySQLite'
import api from '@/common/api/index.js'
import store from '@/store/index.js'
import {
	requestPermission,
	getTime,
	getNetworkType,
	getPath
} from '@/common/js/utils.js'
export class FileDownload {
	hySQLite = null
	songInfo = {}
	imgInfo = {}
	urlType = 0 // 歌曲下载品质
	fileType = 'music' // 下载文件类型
	isMove = true // 是否移动下载文件
	downPath = '_downloads/temp/'
	temp = '' // 临时存储转移路径
	platform = 'Android' // 平台
	indexData = uni.getStorageSync('indexData_key')
	objKeys = Object.keys(uni.getStorageSync('indexData_key'));
	objValues = Object.values(uni.getStorageSync('indexData_key'));
	sqlName = 'hyMusic'
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
	// 保存歌曲的数据库字段
	musicCV = {
		id: 'TEXT', // 歌曲Id
		name: 'TEXT', // 歌曲名字
		singer_id: '', // 歌手ID
		singer_name: '',
		album_id: '', // 专辑ID
		url: 'TEXT', // 歌曲所在本地地址
		hq_url: 'TEXT', // 高清链接
		sq_url: 'TEXT', // 无损链接
		status: 'TEXT', // 1：其他、2：翻唱、3：原创
		mv: 'TEXT', // MV路径
		lyric: 'TEXT', // 歌词
		hot: 'TEXT', // 是否热门歌曲，1：不是、2：是
		recommend: 'TEXT', // 是否独家，1不是、2：是
		description: 'TEXT', // 歌曲描述
		song_status: 'TEXT', // 1：免费、2：会员免费、3：会员付费
		price: 'TEXT', // 价格
		avatar: 'TEXT', // 歌曲头像本地地址
		background: 'TEXT', // 歌曲背景图片本地地址
		createdAt: 'TEXT', // 创建时间
	}
	// 保存缓存歌曲的数据库字段
	cacheMusicCV = {
		id: 'TEXT', // 歌曲Id
		src: 'TEXT', // 歌曲所在本地地址
		avatarSrc: 'TEXT', // 歌曲头像本地地址
		backgroundSrc: 'TEXT', // 歌曲背景图片本地地址
		createdAt: 'TEXT', // 创建时间
	}
	imageCV = {
		avatar: 'TEXT', // 缓存图片
		created_at: 'TEXT' // 图片的创建时间
	}
	videoCV = {

	}
	// 表名
	tableName_music = 'download_Music'
	tableName_image = 'download_Image'
	tableName_video = 'download_Video'
	tableName_cache_music = 'cache_Music'

	// arg下载类型, isMove是否移动下载文件
	constructor(arg) {
		// #ifdef APP-PLUS
		this.downPath = plus.os.name === 'iOS' ? '_doc/temp/' : '_downloads/temp/'
		this.platform = plus.os.name
		this.hySQLite = new HySQLite() // 实例化数据库操作类
		this.createPath()
		// #endif
	}

	// 初始化建表
	init() {
		this.createTable('music', (res) => {
			if (res) this.createTable('image', (res) => {
				if (res) this.createTable('cache_music')
			})
		})
	}

	// 创建hyMusic下文件目录
	createPath() {
		let MainFileName = plus.os.name === 'iOS' ? this.downPath : getPath({
			type: 'music'
		})
		plus.io.resolveLocalFileSystemURL(MainFileName, (parentEntry) => {
			let FirstFileName = plus.os.name === 'iOS' ? '_doc' : 'download'
			parentEntry.getDirectory(FirstFileName, {
				create: false,
				exclusive: false
			}, (entry) => {
				console.log('已存在文件夹')
			}, (e) => {
				parentEntry.getDirectory(FirstFileName, {
					create: true,
					exclusive: false
				}, (entry1) => {
					// 新建下载歌曲文件夹
					entry1.getDirectory('music', {
						create: true,
						exclusive: false
					}, (entry2) => {
						console.log('创建或打开成功-music')
					}, () => {
						console.log('创建或者打开子目录失败-music')
					})
					// 新建下载图片文件夹
					entry1.getDirectory('image', {
						create: true,
						exclusive: false
					}, (entry3) => {
						console.log('创建或打开成功-image')
					}, () => {
						console.log('创建或者打开子目录失败-image')
					})
					// 新建下载视频文件夹
					entry1.getDirectory('video', {
						create: true,
						exclusive: false
					}, (entry4) => {
						console.log('创建或打开成功-video')
					}, () => {
						console.log('创建或者打开子目录失败-video')
					})
					console.log('创建或打开成功')
				})
			})
		})
	}

	// 下载保存首页图片优化用户体验
	downloadIndexImage(index) {
		this.isMove = false;
		let _this = this;
		uni.getNetworkType({
			success(res) {
				if (res !== 'none' && store.getters.isStartIndexCache) {
					_this.indexDataSave(_this.objValues[index], _this.objKeys[index], 0, (res) => {
						if (res) setTimeout(function() {
							_this.downloadIndexImage(index + 1);
						}, 2000);
					})
				}
			}
		})
	}

	// 首页图片保存
	async indexDataSave(dataList, type, index, callback) {
		// 如果数据为空则不做任何处理
		if (type ==='movie') console.log('--------', dataList)
		if (dataList === undefined || dataList.length === 0 || !dataList || dataList === null) return true;
		if (type ==='movie') console.log('--------', dataList)
		// 处理各种数据格式嵌套的数组,统一转为[{ avatar: '' }]
		if (index === 0) {
			let tempList = dataList;
			if (type === 'ranking') {
				dataList = [];
				tempList.song.forEach((value, index, array) => {
					dataList.push(value.Result);
				})
			} else if (type === 'recommend') {
				await this.indexDataSave(dataList.album, 'recommend_album', 0, (res) => {
					if (res) this.indexDataSave(dataList.mix, 'recommend_mix', 0, (res) => {
						if (res) this.indexDataSave(dataList.singer, 'recommend_singer', 0, (res) => {
							if (res) this.indexDataSave(dataList.song, 'recommend_song', 0, (res) => {
								if (res && typeof callback === 'function') {
									callback(true);
									return true;
								}
							})
						})
					})
				})
			} else if (dataList[0].Result !== undefined) {
				dataList = [];
				tempList.forEach((value, index, array) => {
					dataList.push(value.Result);
				})
			} else if (dataList[0].User !== undefined) {
				dataList = [];
				tempList.forEach((value, index, array) => {
					dataList.push(value.User);
				})
			} else if (dataList[0].image !== undefined) {
				dataList.forEach((value, index, array) => {
					dataList[index].avatar = dataList[index].image;
				})
			} else if (dataList[0].MovieCover !== undefined) {
				dataList.forEach((value, index, array) => {
					dataList[index].avatar = dataList[index].MovieCover;
					dataList[index].created_at = dataList[index].CreatedAt;
				})
			}
		} else {
			// 结束递归
			if (index === dataList.length) {
				console.log('--------------结束递归', type)
				let values = uni.getStorageSync('indexData_key');
				switch (type) {
					// 轮播图
					case 'swiper':
						values.swiper.forEach((value, index, array) => {
							value.image = dataList[index].avatar
						})
						break;
						// 推荐
					case 'recommend_album':
						values.recommend.album = dataList;
						break;
					case 'recommend_mix':
						values.recommend.mix = dataList;
						break;
					case 'recommend_singer':
						values.recommend.singer = dataList;
						break;
					case 'recommend_song':
						values.recommend.song.forEach((value, index, array) => {
							value.Result.avatar = dataList[index].avatar
						})
						break;
						// 榜单
					case 'ranking':
						values.ranking.song.forEach((value, index, array) => {
							value.Result.avatar = dataList[index].avatar
						})
						break;
						// 分类
					case 'songType':
						values.songType = dataList;
						break;
						// 热门歌单
					case 'hot':
						values.hot = dataList;
						break;
						// 新歌首发
					case 'newSong':
						values.newSong.forEach((value, index, array) => {
							value.Result.avatar = dataList[index].avatar
						})
						break;
						// 新碟上架
					case 'newAlbum':
						values.newAlbum = dataList;
						break;
						// 新碟上架
					case 'newMix':
						values.newMix = dataList;
						break;
						// 推荐音乐人
					case 'musician':
						values.musician.forEach((value, index, array) => {
							value.User.avatar = dataList[index].avatar
						})
						break;
						// 热门视频
					case 'movie':
						values.movie.forEach((value, index, array) => {
							value.MovieCover = dataList[index].avatar
							value.CreatedAt = dataList[index].created_at
						})
						break;
					case 'choiceAlbum':
						values.choiceAlbum = dataList;
					default:
						break;
				}
				uni.setStorageSync('indexData_key', values);
				if (type === 'swiper') {
					console.log('-------------不再重复下载')
					let obj = uni.getStorageSync('redownload_key')
					uni.setStorageSync('redownload_key', {
						time: obj.time,
						count: 0
					});
					if (typeof callback === 'function') {
						callback(false);
						return false;
					}
				}
				if (typeof callback === 'function') {
					callback(true);
					return true;
				}
			}
		}
		// 检查是否缓存
		this.checkCache(dataList[index].created_at, 'image', (res) => {
			// 如果数据库和本地不存在此图片
			if (res.code === 0) {
				this.createImageDownloader(dataList[index], false, (res) => {
					if (res.code === 1) {
						dataList[index].avatar = 'file://' + res.data.avatar;
						this.indexDataSave(dataList, type, index + 1, callback);
					}
				});
			}
			// 存在此图片
			else {
				dataList[index].avatar = 'file://' + res.data.avatar;
				this.indexDataSave(dataList, type, index + 1, callback);
			}
		});
	}

	// 检查数据库中是否存在该音乐的缓存/图片缓存 data:查询的数据, type类型, 歌曲music({ id, urlType }),图片image(created_at)
	async checkCache(data, type, callback) {
		this.isMove = false
		this.checkFileMapDatabase(data, type, (res) => {
			callback(res)
		})
	}

	// 检查文件与数据库中的数据与路径是否一一对应,若数据缺失则删除所有相关数据
	async checkFileMapDatabase(data, type, callback) {
		
		
		if (!this.hySQLite.isOpenDB({})) {
			await this.hySQLite.openDB({})
		}
		await this.hySQLite.transactionDB({
			operation: 'begin'
		})
		
		
		let songInfo = []
		let imageInfo = []
		if (type === 'music') {
			songInfo = await this.hySQLite.selectSQL({ // 查询数据
				sql: 'select * from ' + this.tableName_music + ' where id="' + data.id + '"'
			})
			// songInfo = await this.hySQLite.selectDB({
			// 	whereString: 'select * from ' + this.tableName_music + ' where id="' + data.id + '"'
			// }) // 数据库查询出来的数据
			// callback 0:不存在 1:存在 2:不存在歌曲资源
			let call = [{
				code: 0,
				data: {}
			}, {
				code: 1,
				data: songInfo[0]
			}, {
				code: 2,
				data: songInfo[0]
			}]
			if (songInfo && songInfo.length > 0) {
				let avatar = await this.isFile(songInfo[0].avatar)
				let background = await this.isFile(songInfo[0].background)
				if (avatar && background) {
					switch (data.urlType) {
						case 0:
							if (await this.isFile(songInfo[0].url)) {
								store.dispatch('splicDownloadList', data) // 清除已存在的歌曲
								callback(call[1])
							} else callback(call[2])
							break;
						case 1:
							if (await this.isFile(songInfo[0].hq_url)) {
								store.dispatch('splicDownloadList', data) // 清除已存在的歌曲
								callback(call[1])
							} else callback(call[2])
							break;
						case 2:
							if (await this.isFile(songInfo[0].sq_url)) {
								store.dispatch('splicDownloadList', data) // 清除已存在的歌曲
								callback(call[1])
							} else callback(call[2])
							break;
						default:
							break;
					}
				} else {
					this.deleteFile(songInfo[0].avatar)
					this.deleteFile(songInfo[0].background)
					switch (data.urlType) {
						case 0:
							this.deleteFile(songInfo[0].url)
							break;
						case 1:
							this.deleteFile(songInfo[0].hq_url)
							break;
						case 2:
							this.deleteFile(songInfo[0].sq_url)
							break;
						default:
							break;
					}
					let sqlString = 'DELETE FROM ' + this.tableName_music + ' ' + 'where id="' + songInfo[0].id + '"'
					await this.hySQLite.executeSql({
						sql: sqlString
					}).then(res => {
						console.log('数据删除成功', res)
					})
					// await this.hySQLite.deleteDB({
					// 	tableName: this.tableName_music,
					// 	whereString: 'where id="' + songInfo[0].id + '"'
					// })
					if (typeof callback === 'function') callback(call[0])
				}
			} else {
				if (typeof callback === 'function') callback(call[0])
			}
		} else if (type === 'image') {
			imageInfo = await this.hySQLite.selectSQL({ // 查询数据
				sql: 'select * from ' + this.tableName_image + ' where created_at="' + parseInt(data) + '"'
			})
			// imageInfo = await this.hySQLite.selectDB({
			// 	whereString: 'select * from ' + this.tableName_image + ' where created_at="' + parseInt(data) + '"'
			// })
			if (imageInfo && imageInfo.length > 0) {
				let avatar = await this.isFile(imageInfo[0].avatar)
				if (avatar) {
					if (typeof callback === 'function') {
						callback({
							data: imageInfo[0],
							code: 1
						})
					}
				} else {
					this.deleteFile(imageInfo[0].avatar)
					
					let sqlString = 'DELETE FROM ' + this.tableName_image + ' ' + 'where created_at="' + imageInfo[0].created_at + '"'
					await this.hySQLite.executeSql({
						sql: sqlString
					}).then(res => {
						console.log('数据删除成功', res)
					})
					
					// await this.hySQLite.deleteDB({
					// 	tableName: this.tableName_image,
					// 	whereString: 'where created_at="' + imageInfo[0].created_at + '"'
					// })
					if (typeof callback === 'function') {
						callback({
							data: {},
							code: 0
						})
					}
				}
			} else {
				if (typeof callback === 'function') {
					callback({
						data: {},
						code: 0
					})
				}
			}
		}
		
		await this.hySQLite.transactionDB({
			operation: 'commit'
		})
		
		// 判断数据库是否打开，并打开数据库
		if (this.hySQLite.isOpenDB({})) {
			await this.hySQLite.closeDB({})
		}
	}

	// 判断是否是一个文件
	async isFile(path, fileType, filename) {
		let handlePath = ''
		if (path.includes('file://')) handlePath = path.substring(7)
		else handlePath = path
		return new Promise((resolve, reject) => {
			// 获取当前歌曲所在路径
			plus.io.resolveLocalFileSystemURL(
				handlePath,
				(fileEntry) => {
					if (fileEntry.isFile) {
						if (this.isMove && this.platform === 'Android') this.moveFile(fileType, fileEntry, filename)
						resolve(true)
					} else {
						resolve(false)
					}
				},
				(e) => {
					// console.log(e.message);
					resolve(false)
				}
			);
		})
	}

	// 移动下载文件
	moveFile(fileType, fileEntry, filename) {
		let createDirectory = ''
		if (fileType === 'music') createDirectory = 'download/music/'
		else createDirectory = 'download/image/'
		this.temp = ''
		this.temp = getPath({
			type: 'music'
		}) + createDirectory
		// 获取移动的目标路径 
		plus.io.resolveLocalFileSystemURL(this.temp, (dstEntry) => {
			// 移动下载文件到指定路径
			fileEntry.moveTo(dstEntry);
		})
		this.temp = this.temp + filename
	}

	// 创建音乐下载任务,保存头像,歌曲,背景图片, songId防止链接过期,type判断下载的是什么品质歌曲(1普通, 2高品质, 3无损), checkres: 数据库资源检查结果 0:不存在 1:存在 2:不存在歌曲资源 
	createMusicDownlaoder(obj, checkres, callback) {
		this.isMove = true
		api.querySongDetails({
			id: obj.id
		}).then((res) => {
			this.songInfo = res.data
			let songInfo = res.data
			let downloadUrl = ''
			this.urlType = obj.urlType
			if (obj.urlType === 0) downloadUrl = songInfo.url
			else if (obj.urlType === 1) downloadUrl = songInfo.hq_url
			else if (obj.urlType === 2) downloadUrl = songInfo.sq_url
			let onlyWifi = uni.getStorageSync('onlyWIFI') === undefined ? false : uni.getStorageSync('onlyWIFI') // 是否仅WiFi播放
			let allowDownlaod = false
			if (onlyWifi) {
				getNetworkType((res) => {
					if (res === 'wifi') allowDownlaod = true
					else allowDownlaod = false
				})
			} else allowDownlaod = true
			if (!allowDownlaod) return false
			this.clearAll()
			if (downloadUrl !== '') {
				this.checkAllowDownload(obj.id, songInfo.song_status, (res) => {
					console.log(songInfo.name, res)
					if(res) {
						this.createDownloader(downloadUrl, 'music', songInfo, 'url', (res) => {
							// checkres: 0:不存在  2:歌曲资源丢失
							if (res.code === 1 && checkres.code === 0) {
								if (songInfo.avatar) {
									this.createDownloader(songInfo.avatar, 'image', songInfo, 'avatar', (res) => {
										if (res.code === 1 && songInfo.background) {
											this.createDownloader(songInfo.background, 'image', songInfo, 'background', (res) => {
												store.dispatch('splicDownloadList', obj) // 清除下载完成的歌曲
											})
										} else store.dispatch('splicDownloadList', obj)
									})
								} else {
									if (songInfo.background) {
										this.createDownloader(songInfo.background, 'image', songInfo, 'background', (res) => {
											store.dispatch('splicDownloadList', obj)
										})
									}
								}
							} else store.dispatch('splicDownloadList', obj)
						})
					}
				})
			}
		})
	}

	// 创建图片下载任务
	createImageDownloader(obj, isMove, callback) {
		this.imgInfo.avatar = obj.avatar
		this.imgInfo.created_at = obj.created_at
		this.isMove = isMove
		if (this.imgInfo.avatar) this.createDownloader(this.imgInfo.avatar, 'image', this.imgInfo, 'avatar', (res) => {
			callback(res)
		})
	}

	// 创建下载 url 下载地址, filetype 文件类型, info 数据信息, type 数据库存储字段
	createDownloader(url, fileType, info, type, callback) {
		let filename = (new Date()).getTime() // 默认当前事件命名
		// if (fileType === 'music') filename = info.name // 歌曲名命名
		if (fileType === 'music' && plus.os.name === 'Android') {
			filename = info.name
		} // 歌曲名命名
		else if (fileType === 'image') filename = info.created_at // 图片的创建时间作为文件名
		this.downOptions.filename = this.downPath + fileType + '/' + filename + this.getFileType(url, fileType)
		try {
			let downloader = plus.downloader.createDownload(url, this.downOptions, async (download, status) => {
				if (status === 200 && download.state === 4) {
					let isFile = await this.isFile(download.filename, fileType, filename + this.getFileType(url, fileType))
					if (isFile) {
						let selectRes = [] // 查询数据库是否存在此条插入数据
						let values = {} // 下载保存后的本地路径
						// 判断数据库是否已经打开，未打开则打开数据库
						if (!this.hySQLite.isOpenDB({})) {
							await this.hySQLite.openDB({})
						}
						// 下载音乐
						if (fileType === 'music' || (fileType === 'image' && this.isMove)) {
							// 查询数据库中是否有保存有这首歌
							selectRes = await this.hySQLite.selectSQL({
								sql: 'select * from ' + this.tableName_music + ' where id="' + info.id + '"'
							})
							if (selectRes.length !== 0) Object.assign(info, selectRes[0])
							values = {
								url: (type === 'url' && this.urlType === 0) ? this.platform === 'iOS' ? download.filename : plus.io.convertLocalFileSystemURL(
									this.temp) : info.url, // 歌曲所在本地地址
								hq_url: (type === 'url' && this.urlType === 1) ? this.platform === 'iOS' ? download.filename : plus.io.convertLocalFileSystemURL(
									this.temp) : info.hq_url,
								sq_url: (type === 'url' && this.urlType === 2) ? this.platform === 'iOS' ? download.filename : plus.io.convertLocalFileSystemURL(
									this.temp) : info.sq_url,
								avatar: type === 'avatar' ? this.platform === 'iOS' ? download.filename : plus.io.convertLocalFileSystemURL(
									this.temp) : info.avatar, // 歌曲头像本地地址
								background: type === 'background' ? this.platform === 'iOS' ? download.filename : plus.io.convertLocalFileSystemURL(
									this.temp) : info.background, // 歌曲背景图片本地地址
							}
						}
						// 下载首页图片
						else if (fileType === 'image' && !this.isMove) {
							// 查询数据库中是否有保存有这张图
							selectRes = await this.hySQLite.selectSQL({
								sql: 'select * from ' + this.tableName_image + ' where created_at="' + info.created_at + '"'
							})
							values = {
								avatar: this.platform === 'iOS' ? download.filename : plus.io.convertLocalFileSystemURL(download.filename),
								created_at: info.created_at
							}
						}
						Object.assign(info, values)
						if (selectRes.length > 0) {
							// 开始事务
							try {
								await this.hySQLite.transactionDB({
									operation: 'begin'
								})
								let sqlStatement = ''
								let col = type
								if (type === 'url') {
									switch (this.urlType) {
										case 0:
											col = 'url'
											break;
										case 1:
											col = 'hq_url'
											break;
										case 2:
											col = 'sq_url'
											break;
										default:
											break;
									}
								}
								if (fileType === 'music' || (fileType === 'image' && this.isMove)) sqlStatement = 'UPDATE ' + this.tableName_music +
									' SET ' + col + '= "' + info[col] + '" ' +
									'where id = "' + info.id + '"'
								else if (fileType === 'image' && !this.isMove) sqlStatement = 'UPDATE ' + this.tableName_image +
									' SET ' + type + '= "' + values[type] + '" ' +
									'where created_at = "' + info.created_at + '"'
								await this.hySQLite.executeSql({
									sql: sqlStatement
								})

								await this.hySQLite.transactionDB({
									operation: 'commit'
								})
								if (typeof callback === 'function') {
									callback({
										code: 1,
										data: info
									})
								}
							} catch (e) {
								//TODO handle the exception
								if (this.hySQLite.isOpenDB({})) {
									this.hySQLite.closeDB({})
								}
								console.log('更新数据错误')
								if (typeof callback === 'function') {
									callback(false)
								}
							}
						} else {
							try {
								let cvObj = {}
								let tableName = ''
								if (fileType === 'music' || (fileType === 'image' && this.isMove)) {
									cvObj = this.getCV('music', info)
									tableName = this.tableName_music
								} else if (fileType === 'image' && !this.isMove) {
									cvObj = this.getCV('image', info)
									tableName = this.tableName_image
								}
								await this.hySQLite.transactionDB({
									operation: 'begin'
								})
								await this.hySQLite.executeSql({
									sql: 'INSERT INTO ' + tableName + ' ' + cvObj.columns + ' VALUES ' + cvObj.values
								})
								await this.hySQLite.transactionDB({
									operation: 'commit'
								})
								if (typeof callback === 'function') {
									callback({
										code: 1,
										data: info
									})
								}
							} catch (e) {
								//TODO handle the exception
								if (this.hySQLite.isOpenDB({})) {
									this.hySQLite.closeDB({})
								}
								if (typeof callback === 'function') {
									callback(false)
								}
							}
						}
					}
				}
			})
			downloader.start()
			downloader.addEventListener('statechanged', this.downloadEventChange)
		} catch (e) {
			//TODO handle the exception
			console.log('创建下载报错' + e)
			if (typeof callback === 'function') {
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
		if (status === 400 && download.state === 4) {
			console.log('下载完成,当前下载的信息')
		}
	}

	// 获取文件类型
	getFileType(url, fileType) {
		switch (fileType) {
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
	/**
	 * @描述：创建数据库表格
	 * @参数：!type: 数据库表的类型名, 可选值为music/音乐 image/图片 video/视频
	 * @返回值：void
	 * */
	createTable(type, callback) {
		let tempTableName = ''
		let tempCVObj = ''
		switch (type) {
			case 'music':
				tempTableName = this.tableName_music
				tempCVObj = this.musicCV
				break
			case 'cache_music':
				tempTableName = this.tableName_cache_music
				tempCVObj = this.cacheMusicCV
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
		this.hySQLite.createTable({
			tableName: tempTableName,
			contentValues: tempCVObj,
		}, (res) => {
			if (typeof callback === 'function') {
				callback(res)
			}
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
			case 'cache_music':
				tempTableName = this.tableName_cache_music
				tempCVObj = this.cacheMusicCV
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
	selectAll(callback) {
		// 判断数据库是否已经打开，未打开则打开数据库
		if (!this.hySQLite.isOpenDB({})) {
			this.hySQLite.openDB({})
		}

		this.hySQLite.selectSQL({
			sql: 'select * from ' + this.tableName_music
		}).then(res => {
			let dataList = []
			res.forEach((item, index, array) => {
				let obj = {}
				if (item.url !== '') {
					obj = {
							id: item.id,
							urlType: 0
						},
						this.checkCache(obj, 'music', (res) => {
							if (res.code !== 0) dataList.push(item)
						})
				}
				if (item.url !== '') {
					obj = {
							id: item.id,
							urlType: 0
						},
						this.checkCache(obj, 'music', (res) => {
							if (res.code !== 0) dataList.push(item)
						})
				}
			})
			callback(res)
		})
	}
	update() {
		this.hySQLite.updateDB({
			tableName: this.tableName_music,
			updateString: 'avatar = "/storage/emulated/0/Android/data/uni.A90C1AC/downloads/cache/image/test.jpg"',
			whereString: 'where id = "8"',
		})
	}
	// 删除所有数据
	deleteInfo() {
		this.hySQLite.dropTable({
			tableName: this.tableName_music,
		})
	}
	// 删除文件
	deleteFile(filePath) {
		plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
			console.log('进入目录')
			if (entry.isFile) {
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
	// 检查是否允许下载歌曲
	checkAllowDownload(id, songStatus, callback) {
		const userLevel = uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo').vip_level : ''
		// 用户为高级会员且歌曲为非付费歌曲时允许下载
		if (userLevel === 2 && (songStatus === 2 || songStatus === 1)) {
			if(typeof callback === 'function') {
				callback(true)
			}
		} else if(songStatus === 3 || (songStatus === 2 && userLevel !== 2)) {
			this.checkMusic(id, (isPass) => {
				if(typeof callback === 'function') {
					callback(isPass)
				}
			})
		} else {
			if(typeof callback === 'function') {
				callback(false)
			}
		}
	}
	/**
	 * 检查用户是否有买这首歌 */
	 checkMusic(songId, callBack) {
		api.songListeningPermission({
			id: songId
		}).then(res => {
			if(res.code === 200) {
				if(typeof callBack === 'function') {
					callBack(res.data)
			 	}
			} else {
			 	if(typeof callBack === 'function') {
			 		callBack(false)
			 	}
			}
		}).catch(err => {
			console.log(err)
	        callBack(false)
		})
	 }
}
