import {
	getPath
} from '@/common/js/utils.js'
import {
	HySQLite
} from '@/common/js/hySQLite'
/* 写入文件 */
export class WriteFile {
	savePath = ''
	hySQLite = null
	tableName_music = 'download_Music'
	tableName_image = 'download_Picture'
	tableName_video = 'download_Video'
	musicCV = {
		id: 'TEXT', // 歌曲Id
		albumId: 'TEXT', // 图片Id
		name: 'TEXT', // 歌曲名
		singer: 'TEXT', // 歌手
		size: 'TEXT', // 文件大小
		duration: 'TEXT', // 时长
		path: 'TEXT', // 文件地址
		position: 'INTEGER', // 下载的断点位置，已下载的文件则为-1
		isDownLoad: 'INTEGER', // 文件是否已下载 0为false，1为true
	}
	imageCV = {

	}
	videoCV = {

	}
	fileType = ''
	fetchArr = [] // 存储的并发max的promise数组
	IOObjArr = [] // 返回的IO操作对象
	workArr = [] // 存储将要执行的事务
	workArrBackup = [] // 存储将要执行的事务的备份
	worker = 0 // 正在执行的异步事务数量
	recursion = null
	isOver = true
	constructor(type) {
		this.fileType = type
		this.savePath = getPath({type: 'music'}) // 获取外部公共存储空间路径
		this.hySQLite = new HySQLite() // 实例化数据库操作类
		this.createTable(type) // 不存在就创建对应表
	}

	/**
	 * @描述：写入文件
	 * @参数：!info: 文件名，!fileData: 要写入的文件数据
	 * @返回值：String类型，对应路径
	 * */
	// resolveLocalFileSystemURL 通过目录获取目录对象 DirectoryEntry 通过目录对象的 getFile 创建或打开文件
	write(info, fileData, callBack) {
		return new Promise((resolve, reject) => {
			plus.io.resolveLocalFileSystemURL(this.savePath, (directoryEntry) => { // 通过URL参数获取目录对象或文件对象
				let flag = {
					create: true,
				}
				directoryEntry.getDirectory('hyMusic', flag, (subDirectoryEntry) => { // 文件系统中的目录对象，用于管理特定的本地目录
					subDirectoryEntry.getFile(info.name, flag, (fileEntry) => { // 文件系统中的目录对象，用于管理特定的本地目录
						info.path = fileEntry.fullPath
						info.isDownLoad = 0
						info.position = 0
						fileEntry.createWriter(async (fileWriter) => { // 文件系统中的文件对象，用于管理特定的本地文件
							let cvObj = this.getCV(this.fileType, info)
							let fileWriterObj = fileWriter
							callBack(fileWriterObj)
							// 判断数据库是否已经打开，未打开则打开数据库
							if (!this.hySQLite.isOpenDB({})) {
								console.log('判断数据库是否已经打开，未打开则打开数据库IOMAN')
								await this.hySQLite.openDB({})
							}

							// 查询数据库中的未下载完的歌曲的position值
							let selectRes = await this.hySQLite.selectSQL({
								sql: 'select * from ' + cvObj.tableName + ' where id="' + info.id + '"'
							})

							if (selectRes.length === 1) {
								fileWriter.seek(selectRes[0].position)
								// 开始事务
							}

							fileWriter.onprogress = (event) => {
								console.log('写入进度事件', event)
							}
							fileWriter.onwritestart = async (event) => {
								console.log('开始写入事件', event)
								if (!this.hySQLite.isOpenDB({})) {
									await this.hySQLite.openDB({})
								}
							}
							fileWriter.onwrite = async (event) => {
								console.log('写入成功事件', event)
								if (selectRes.length === 0) {
									try {
										await this.hySQLite.transactionDB({
											operation: 'begin'
										})
										await this.hySQLite.executeSql({
											sql: 'INSERT INTO ' + cvObj.tableName + ' ' + cvObj.columns + ' VALUES ' + cvObj.values
										})
										await this.hySQLite.transactionDB({
											operation: 'commit'
										})
									} catch (e) {
										//TODO handle the exception
										if (this.hySQLite.isOpenDB({})) {
											this.hySQLite.closeDB({})
										}
										console.log('写入数据库错误')
									}
								}
							}
							fileWriter.onabort = async (event) => {
								console.log('取消写入事件', event)
								if (this.hySQLite.isOpenDB({})) {
									await this.hySQLite.closeDB({})
								}
							}
							fileWriter.onerror = async (event) => {
								console.log('写入失败事件', event)
								if (this.hySQLite.isOpenDB({})) {
									await this.hySQLite.closeDB({})
								}
							}
							fileWriter.onwriteend = async (event) => {
								console.log('写入完成事件', event)
								console.log('文件当前操作的指针位置', fileWriter.position)
								console.log('文件当前的长度，单位为字节', fileWriter.length)
								try {
									await this.hySQLite.transactionDB({
										operation: 'begin'
									})
									await this.hySQLite.executeSql({
										sql: 'UPDATE ' + cvObj.tableName + ' SET ' + 'position = ' + fileWriter.position + ' ' +
											'where id = ' + info.id
									})

									this.hySQLite.transactionDB({
										operation: 'commit'
									}).then(() => {
										resolve({
											id: info.id,
											obj: fileWriterObj
										})
									})
								} catch (e) {
									//TODO handle the exception
									if (this.hySQLite.isOpenDB({})) {
										this.hySQLite.closeDB({})
									}
									console.log('更新数据错误')
								}
							}
							fileWriter.write(fileData)

						}, (errorCreateWriter) => {
							console.log('创建写文件对象失败', errorCreateWriter)
						})
					}, (errorGetFile) => {
						console.log('创建或打开文件失败', errorGetFile)
					})
				}, (errorGetDirectory) => {
					console.log('创建或打开目录失败', errorGetDirectory)
				})
			}, (errorFileSystemURL) => {
				console.log('获取目录或文件对象失败', errorFileSystemURL)
			})
		})
	}
	/**
	 * @描述：批量下载
	 * @参数：!fileName: 文件名，!fileData: 要写入的文件数据
	 * @返回值：String类型，对应路径
	 * */
	batchDownload_init(max, ObjCallBack, workCallBack, callback) {
		this.recursion = () => {
			if (this.workArr.length === 0) { // 所有的都处理完了， 返回一个resolve
				Promise.all(this.fetchArr).then(() => {
					if (this.hySQLite.isOpenDB({})) {
						this.hySQLite.closeDB({})
					}
					this.isOver = true
					if(typeof callback === 'function') {
						callback()
					}
				})
				return Promise.resolve()
			}
			let tempValue = this.workArr.shift()
			let one = this.write(tempValue.info, tempValue.fileData, (obj) => {
				let temp = {
					id: tempValue.info.id,
					obj,
				}
				this.IOObjArr.push(temp)
				if(typeof ObjCallBack === 'function') {
					ObjCallBack(this.IOObjArr)
				}
			})
			one.then((obj) => {
				if(typeof workCallBack === 'function') {
					workCallBack()
				}
				this.fetchArr.splice(this.fetchArr.indexOf(one), 1) // 从异步数组中删除已执行完的事务
				this.IOObjArr.splice(this.IOObjArr.indexOf(obj), 1) // 从异步数组中删除已执行完的事务的操作对象
			}); // 当promise执行完毕后，从数组删除
			this.isOver = false
			this.fetchArr.push(one)
			console.log('向异步数组中插入事件--待处理事件长度：', this.workArr.length)
			// let p = Promise.resolve()
			if (this.fetchArr.length >= max) {
				// 并发数大于等于max，当异步组中有事件结束才能继续加入其他异步事件
				Promise.race(this.fetchArr).then(() => {
					console.log('并发数大于或等于5个')
					this.recursion()
					return Promise.resolve();
				})
			} else {
				// 并发数小于max，不用等待，直接加入异步组
				console.log('并发数不足5个')
				this.recursion()
				return Promise.resolve();
			}
		}

		return this.recursion().then(() => {
			// Promise.all(this.fetchArr).then((values) => {
			// 	if (this.hySQLite.isOpenDB({})) {
			// 		this.hySQLite.closeDB({})
			// 	}
			// 	this.isOver = true
			// 	callback();
			// })
		})
	}


	batchDownload_addWork(num, max = 5, ObjCallBack, workCallBack, callback) {
		if(Array.isArray(num)) {
			this.workArr = num
			this.workArrBackup = num
		} else {
			this.workArr.push(num)
			this.workArrBackup.push(num)
		}
		if (this.isOver) {
			this.isOver = false
			this.batchDownload_init(max, ObjCallBack, workCallBack, callback)
		}
	}

	fakeAsyncWork(curItem) {
		return new Promise((resolve, reject) => {
			this.worker++
			let time = parseInt(Math.random() * 8000)
			setTimeout(() => {
				console.log(curItem, '当前并发量:', this.worker--, '时间', time)
				resolve(parseInt(time) + '--' + this.worker);
			}, time)
		})
	}

	getFileInfo() {
		return new Promise((resolve, reject) => {
			console.log(this.savePath + '/test.txt')
			plus.io.resolveLocalFileSystemURL(this.savePath + '/test.txt', (fileEntry) => {
				fileEntry.file((file) => {
					console.log(fileEntry.fullPath, file)
					let reader = new plus.io.FileReader()
					reader.onloadend = () => {
						resolve(reader.result)
					}
					reader.readAsText(file)
				})
			})
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
				if (info[index] === undefined || info[index] === null) {
					tempV += 'NULL, '
				} else {
					if (typeof info[index] === 'string') {
						tempV += '"' + info[index] + '", '
					} else {
						tempV += info[index] + ', '
					}

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
		this.hySQLite.createTable({
			tableName: tempTableName,
			contentValues: tempCVObj,
		})
	}
}
