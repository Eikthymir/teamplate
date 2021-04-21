import {
	HySQLite
} from '@/common/js/hySQLite.js'
import {
	deleteMediaStoreFile
} from '@/common/js/utils.js'
// ******************************** 本地音乐管理类 ********************************//
export class MusicMana {
	song = {
		id: '', // 歌曲Id
		albumId: '', // 图片Id
		name: '', // 歌曲名
		singer: '', // 歌手
		size: '', // 文件大小
		duration: '', // 时长
		path: '', // 文件地址
	}
	songsList = [] // 歌曲列表
	setSong(song) {
		this.song = song
	}
	getSong() {
		return this.song
	}

	constructor() {
		this.hySQLite = new HySQLite()
	}

	/**
	 * 扫描本地音乐 */
	getLocalMusic() {
		this.songsList = []
		// 各种android类
		let Context = plus.android.importClass("android.content.Context");
		let ContentResolver = plus.android.importClass("android.content.ContentResolver");
		let Cursor = plus.android.importClass("android.database.Cursor");
		let Uri = plus.android.importClass("android.net.Uri");
		let MediaStore = plus.android.importClass("android.provider.MediaStore");
		let Bitmap = plus.android.importClass("android.graphics.Bitmap")
		let main = plus.android.runtimeMainActivity();
		let File = plus.android.importClass("java.io.File")
		let FileOutputStream = plus.android.importClass("java.io.FileOutputStream")
		let Environment = plus.android.importClass("android.os.Environment")
		// 实例化各类
		let environment = new Environment()
		let dir = new File()
		let videoImg = new Bitmap()
		let context = main;
		let subUri = new Uri();
		Uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI; // 查询规则
		let resolver = new ContentResolver();
		resolver = context.getContentResolver();
		let cursor = new Cursor();

		cursor = resolver.query(Uri, null, null, null, MediaStore.Audio.Media.DEFAULT_SORT_ORDER); // 查询数据库
		if (cursor != null) {
			while (cursor.moveToNext()) {
				const tempSong = {}
				tempSong.name = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME));
				tempSong.id = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID));
				tempSong.singer = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST));
				tempSong.path = cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA));
				tempSong.duration = cursor.getInt(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION));
				tempSong.size = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE));
				tempSong.albumId = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID))

				if (tempSong.size > 1000 * 800) {
					if (tempSong.name.indexOf('-') !== -1) {
						tempSong.name = tempSong.name.split('-')[1].trim()
					}
					this.songsList.push(tempSong)
				}

			}
		}
		console.log(JSON.stringify(this.songsList))
		return this.songsList
	}

	/* 数据库相关信息
		tableName: 'music',
		contentValues: {
			id: 'TEXT', // 歌曲Id
			albumId: 'TEXT', // 图片Id
			name: 'TEXT', // 歌曲名
			singer: 'TEXT', // 歌手
			size: 'TEXT', // 文件大小
			duration: 'TEXT', // 时长
			path: 'TEXT', // 文件地址
		}
	*/
	/**
	 * 保存扫描到的音乐到数据库*/
	async saveMusic2DataBase() {
		let isOpenDB = false
		let inter = null
		if (!this.hySQLite.isOpenDB({})) { // 判断是否已经打开数据库
			try {
				console.log('保存扫描到的音乐到数据库')
				isOpenDB = await this.hySQLite.openDB({}) // 打开数据库
			} catch (e) {
				//TODO handle the exception
				console.log('openDB fail', e)
			}
		}
		if (isOpenDB) {
			try {
				await this.hySQLite.transactionDB({ // 开启事务
					operation: 'begin'
				})

				let sql_createTable =
					'create table if not exists music("id" TEXT,"albumId" TEXT,"name" TEXT,"singer" TEXT,"size" TEXT,"duration" TEXT,"path" TEXT)'
				await this.hySQLite.executeSql({ // 如果表格不存在则创建表格
					sql: sql_createTable
				})

				for (let i = 0, len = this.songsList.length; i < len; i++) {
					let res = await this.hySQLite.selectSQL({ // 查询歌曲是否已经保存
						sql: 'select * from music where id=' + this.songsList[i].id + ' AND duration=' + this.songsList[i].duration
					})

					if (res.length === 0) { // 歌曲不存在则添加数据
						let sql_insert = 'INSERT INTO music '
						sql_insert += '(id,albumId,name,singer,size,duration,path)  VALUES '
						sql_insert += '("' + this.songsList[i].id + '","' +
							this.songsList[i].albumId + '","' +
							this.songsList[i].name + '","' +
							this.songsList[i].singer + '","' +
							this.songsList[i].size + '","' +
							this.songsList[i].duration + '","' +
							this.songsList[i].path +
							'")'
						console.log(sql_insert)

						await this.hySQLite.executeSql({ // 添加数据
							sql: sql_insert
						})
					}
				}
				await this.hySQLite.transactionDB({ // 提交事务
					operation: 'commit'
				})
				if(this.hySQLite.isOpenDB({})) {
					await this.hySQLite.closeDB({}) // 关闭数据库
				}
				return {
					status: true,
					msg: '扫描歌曲成功'
				}
			} catch (e) {
				//TODO handle the exception
				console.log(e, '保存扫描到的音乐到数据库失败')
				return {
					status: false,
					msg: '保存扫描到的音乐到数据库失败'
				}
			}
		}
	}
	/**
	 * @Description 查询数据库中的音乐， 模糊查询
	 * @param  *type：（string） 查询类型可取值为or/and/all，or即多对列值对满足一个及返回结果，and全部满足，all即查询music表中的所有歌曲，
	 *			*columnsValues：（Object）列值对，即查询的列已经要查询的值，如{name: '因为爱情'}
	 * @return Promise
	 */
	getMusicFromDB({
		type = 'or',
		columnsValues = {}
	}) {
		return new Promise((resolve, reject) => {
			let sql = 'select * from music'
			let length = Object.keys(columnsValues).length
			if(length !== 0) {
				switch (type) {
					case 'or':
						sql += ' where '
						for(let index in columnsValues) {
							sql += index + ' LIKE ' + '"%' + columnsValues[index] + '%"' + ' or '
						}
						sql = sql.substring(0, sql.length - 4)
						break;
					case 'and':
						sql += ' where '
						for(let index in columnsValues) {
							sql += index + ' LIKE ' + '\'%' + columnsValues[index] + '%\'' + ' and '
						}
						sql = sql.substring(0, sql.length - 4)
						break;
					case 'all':
						break;
					default:
						break;
				}
			}
			console.log(sql)
			this.hySQLite.selectDB({
				whereString: sql
			}).then((res) => {
				resolve(res)
			}).catch(() => {
				reject()
			})
		})
	}
	
	/**
	 * @Description 查询数据库中的音乐， 模糊查询
	 * @param  *type：（string）删除文件的类别可选值为fake/real，fake即删除数据库中的文件不删除源文件，real即同时删除数据库与源文件，
	 *			*id：（string）要删除的文件的id
	 * 			#path：（string）要删除的文件的路径 type为real时必须传值
	 * @return Promise 
	 * 		res = {
				status: false, // 是否执行成功
				msg: '删除音乐失败' // 消息提升
			}
	 */
	deleteMusic({
		type = 'fake',
		id,
		path,
	}) {
		return new Promise((resolve, reject) => {
			let res = {
				status: false,
				msg: '删除音乐失败'
			}
			let fakeDelete = false // 是否删除了数据库中的数据
			let realDelete = type === 'real' ? false : true // 是否删除了本地音乐文件,当type为fake时默认为true否则为false
			if(id) {
				this.hySQLite.deleteDB({
					tableName: 'music',
					whereString: 'where id=' + id
				}).then(() => {
					res.status = true
					res.msg = '音乐已删除'
					fakeDelete = true
					
					if(type === 'real') {
						if (plus.os.name === 'Android') {
							// 各种android类
							let File = plus.android.importClass("java.io.File")
							let file = new File(path)
							console.log(file.exists(), file.isFile(), 'getAbsolutePath', path, file.getAbsolutePath())
							// 如果文件路径所对应的文件存在，并且是一个文件，则直接删除
							if(file.exists() && file.isFile()) {
								res = deleteMediaStoreFile({
									path: file.getAbsolutePath()
								})
								if(res.status) {
									realDelete = true
								}
							}
						}
					}
					
					if(realDelete && fakeDelete) {
						resolve(res)
					} else {
						reject(res)
					}
				}).catch(() => {
					
				})
			} else {
				reject(res)
			}
			
		})
	}
}
