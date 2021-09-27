import Vue from 'vue'
import store from '@/store'
let utilsVue = new Vue()
/***********************Ironman区-start**************************/
// 时分秒转秒
function time2Sec(time, offset = 0) {
	const tempTime = time.split(':')
	let hour, min, sec, s;
	if(tempTime.length === 2) {
	    min = tempTime[0]
	    sec = tempTime[1]
	    s = (Number(min * 60) + Number(sec)) * 1000 + Math.round(offset / 1000);
	} else {
	    hour = tempTime[0]
	    min = tempTime[1]
	    sec = tempTime[2]
	    s = (Number(hour * 60 * 60) + Number(min * 60) + Number(sec)) * 1000 + Math.round(offset / 1000);
	}
	return parseInt(s)
}

function timesFun(timesData, formatStr = 'Y-M-D') {
	//如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
	// var dateBegin = new Date(timesData.replace(/-/g, "/"));//将-转化为/，使用new Date
	
	const dateBegin = new Date(timesData * 1000)
	const dateEnd = new Date(); //获取当前时间
	const dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
	const dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
	const leave1 = dateDiff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
	const hours = Math.floor(leave1 / (3600 * 1000)) //计算出小时数
	//计算相差分钟数
	const leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
	const minutes = Math.floor(leave2 / (60 * 1000)) //计算相差分钟数
	//计算相差秒数
	const leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
	const seconds = Math.round(leave3 / 1000);
	let timesString = '';
	if(dayDiff < 0){
		timesString = '刚刚';
	} else if (dayDiff != 0 && dayDiff < 7) {
		timesString = dayDiff + '天前';
	} else if (dayDiff == 0 && hours != 0) {
		timesString = hours + '小时前';
	} else if (dayDiff == 0 && hours == 0) {
		timesString = minutes + '分钟前';
	} else if(dayDiff != 0 && dayDiff > 7) {
		timesString = formatTime(timesData, formatStr)
	}
	return timesString
}

/**
 * 播放页使用，并不是传统的格式化时间
 * 格式化时间 传入秒*/
function formatTimeForPlayer(time) {
	// time = Math.ceil(time)
	// const sec = formatNumber(time % 60)
	// const min = formatNumber(parseInt(time / 60) % 60)
	// const hour = formatNumber((parseInt(parseInt(time / 60) % 60)) % 60)

	// return hour === '00' ? min + ':' + sec : hour + ':' + min + ':' + sec,

	let resultTime
	if (time > -1) {
		var hour = Math.floor(time / 3600);
		var min = Math.floor(time / 60) % 60;
		var sec = Math.ceil(time % 60);
		if (hour < 10) {
			resultTime = '0' + hour + ":";
		} else {
			resultTime = hour + ":";
		}

		if (min < 10) {
			resultTime += "0";
		}
		resultTime += min + ":";
		if (sec < 10) {
			resultTime += "0";
		}
		resultTime += Math.ceil(sec);
	}
	return resultTime;
}
/**
 * 格式化两位数 */
function formatNumber(n) {
	n = n.toString()
	return n[1] ? n : '0' + n
}
/**
 *随机打乱数组的方法，用于Array.sort()*/
function randomsort(a, b) {
	return Math.random() > .5 ? -1 : 1;
	//用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
}
/**
 * 格式化时间 传入: 时间戳， 格式化的格式*/
const formatTime = (number, format) => {
	if (number) {
		number = parseInt(number) * 1000

		let date = new Date(parseInt(number))
		let arr = []
		let formatStr = ['Y', 'M', 'D', 'h', 'm', 's']
		arr.push(date.getFullYear())
		arr.push(formatNumber(date.getMonth() + 1))
		arr.push(formatNumber(date.getDate()))

		arr.push(formatNumber(date.getHours()))
		arr.push(formatNumber(date.getMinutes()))
		arr.push(formatNumber(date.getSeconds()))

		for (let index in arr) {
			format = format.replace(formatStr[index], arr[index])
		}
		return format
	} else {
		return ''
	}
}

/**
 *将歌手页或用户页上部的封面弧形画出*/
function drawIamgeForBezier(canvasID, imageSrc, callback) {
	let ctx = uni.createCanvasContext(canvasID)
	let w, h, winWidth, winHeight, beginPoint;
	uni.getSystemInfo({
		success(info) {
			winWidth = info.windowWidth
			winHeight = info.windowHeight * 0.39
			beginPoint = winHeight * 0.92

			// console.log(winWidth, winHeight, beginPoint, '1')

			if (typeof callback === 'function') {
				callback(winHeight)
			}
			ctx.beginPath()
			ctx.moveTo(0, 0)
			ctx.lineTo(0, beginPoint)
			ctx.bezierCurveTo(0, winHeight, winWidth, winHeight, winWidth, beginPoint)
			ctx.lineTo(winWidth, 0)
			ctx.setStrokeStyle('transparent')
			ctx.stroke()
			ctx.clip()
			// console.log(winWidth, winHeight, beginPoint, '2')
			uni.getImageInfo({
				src: imageSrc,
				success: function(image) {
					w = image.width;
					h = image.height;
					var dw = winWidth / w //canvas与图片的宽高比
					var dh = winHeight / h

					// console.log(w, h, dw, dh, '3')

					// 裁剪图片中间部分
					if (w > winWidth && h > winHeight || w < winWidth && h < winHeight) {
						if (dw > dh) {
							ctx.drawImage(imageSrc, 0, (h - winHeight / dw) / 2, w, winHeight / dw, 0, 0, winWidth, winHeight)
						} else {
							ctx.drawImage(imageSrc, (w - winWidth / dh) / 2, 0, winWidth / dh, h, 0, 0, winWidth, winHeight)
						}
					}
					// 拉伸图片
					else {
						if (w < winWidth) {
							ctx.drawImage(imageSrc, 0, (h - winHeight / dw) / 2, w, winHeight / dw, 0, 0, winWidth, winHeight)
						} else {
							ctx.drawImage(imageSrc, (w - winWidth / dh) / 2, 0, winWidth / dh, h, 0, 0, winWidth, winHeight)
						}
					}

					// console.log(w, h, dw, dh, '4')
					ctx.draw()
				},
				fail(image) {
					console.log(image, 'fail', imageSrc, canvasID)
				},
				complete(image) {
					// console.log(image, 'complete', imageSrc, canvasID)
				}
			});
		}
	})
}

/**
 * android动态申请权限 */
function requestPermission() {
	plus.android.requestPermissions(
		["android.permission.WRITE_EXTERNAL_STORAGE", "android.permission.READ_EXTERNAL_STORAGE"],
		function(resultObj) {
			for (var i = 0; i < resultObj.granted.length; i++) {
				var grantedPermission = resultObj.granted[i];
				// console.log('已获取的权限：' + grantedPermission);
			}
			for (var i = 0; i < resultObj.deniedPresent.length; i++) {
				var deniedPresentPermission = resultObj.deniedPresent[i];
				// console.log('拒绝本次申请的权限：' + deniedPresentPermission);
			}
			for (var i = 0; i < resultObj.deniedAlways.length; i++) {
				var deniedAlwaysPermission = resultObj.deniedAlways[i];
				// console.log('永久拒绝申请的权限：' + deniedAlwaysPermission);
			}
			// 若所需权限被永久拒绝,则打开APP设置界面,可以在APP设置界面打开相应权限  
			if (resultObj.deniedAlways.length > 0) {
				var Intent = plus.android.importClass("android.content.Intent");
				var Settings = plus.android.importClass("android.provider.Settings");
				var Uri = plus.android.importClass("android.net.Uri");
				var mainActivity = plus.android.runtimeMainActivity();
				var intent = new Intent();
				intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
				var uri = Uri.fromParts("package", mainActivity.getPackageName(), null);
				intent.setData(uri);
				mainActivity.startActivity(intent); 
			}
		},
		function(error) {
			console.log('申请权限错误：' + error.code + " = " + error.message);
		});
}

/**
 *获取本地所有视频， 该方法是将bitmap图转换为base64码来显示出图片*/
function getLocalVideo() {
	let list = new Array()
	// #ifdef APP-PLUS
	if (plus.os.name === 'Android') {
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
		Uri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI; // 查询规则
		let resolver = new ContentResolver();
		resolver = context.getContentResolver();
		let c = new Cursor();

		c = resolver.query(Uri, null, null, null, null); // 查询数据库
		c.moveToFirst();
		if (c != null) {
			while (c.moveToNext()) {
				let videoType = c.getString(c.getColumnIndex(MediaStore.Video.Media.MIME_TYPE))
				if (videoType === 'video/mp4' || videoType === 'video/3gp') {
					let base64 = null
					let videoId = c.getInt(c.getColumnIndex(MediaStore.Video.Media._ID))
					let videoSrc = c.getString(c.getColumnIndex(MediaStore.Video.Media.DATA))
					base64 = bitmapToBase64(getVideoBitMap(videoSrc))
					//扫描本地文件，得到歌曲的相关信息
					const tempInfo = {
						videoId: videoId,
						title: c.getString(c.getColumnIndex(MediaStore.Video.Media.TITLE)), // 视频标题
						src: c.getString(c.getColumnIndex(MediaStore.Video.Media.DATA)), // 视频路径
						videoCover: base64, // 视频封面图
						duration: formatTimeForPlayer(c.getString(c.getColumnIndex(MediaStore.Video.Media.DURATION)) / 1000), // 视频时长
					}
					list.push(tempInfo)
				}
			}
		}
		c.close();
	}
	// #endif
	return list
}
/**
 * @Description 获取的封面位图该方法的速度会很慢建议使用下面那个方法
 * @param videoId：video的MediaStore.Video.Media._ID， resolver：android.content.ContentResolver
 * 			bitMapType ：输出的图片规格值为 MINI_KIND：512×384， MICRO_KIND：96×96，默认为MINI_KIND
 * @return bitMap类
 * */
// function getVideoBitMap(videoId, bitMapType = 'MINI_KIND') {
// 	// 各种android类
// 	let Bitmap = plus.android.importClass("android.graphics.Bitmap")
// 	let MediaStore = plus.android.importClass("android.provider.MediaStore")
// 	let ContentResolver = plus.android.importClass("android.content.ContentResolver")
// 	let main = plus.android.runtimeMainActivity();
// 	// 实例化各类
// 	let videoBitMap = new Bitmap()
// 	let context = main
// 	let resolver = new ContentResolver();
// 	resolver = context.getContentResolver();
// 	let imgType = bitMapType === 'MINI_KIND' ? MediaStore.Video.Thumbnails.MINI_KIND : MediaStore.Video.Thumbnails.MICRO_KIND
// 
// 	try {
// 		videoBitMap = MediaStore.Video.Thumbnails.getThumbnail(resolver, videoId, imgType, null)
// 	} catch (e) {
// 		//TODO handle the exception
// 		console.log(e)
// 	}
// 
// 	return videoBitMap
// }

/**
 * @Description 获取的封面位图
 * @param path：视频资源路径
 * 			bitMapType ：输出的图片规格值为 MINI_KIND：512×384， MICRO_KIND：96×96，默认为MINI_KIND
 * 			width： 输出视频的宽度，必须时Number
 * 			height： 输出视频的高度，必须时Number
 * @return bitMap类
 * */
function getVideoBitMap(path, bitMapType = 'MINI_KIND', width = 100, height = 100) {
	// 各种android类
	let Bitmap = plus.android.importClass("android.graphics.Bitmap")
	let ThumbnailUtils = plus.android.importClass("android.media.ThumbnailUtils")
	let MediaStore = plus.android.importClass("android.provider.MediaStore")
	// 实例化各类
	let imgType = bitMapType === 'MINI_KIND' ? MediaStore.Video.Thumbnails.MINI_KIND : MediaStore.Video.Thumbnails.MICRO_KIND;
	let videoBitMap = new Bitmap()
	try {
		videoBitMap = ThumbnailUtils.createVideoThumbnail(path, imgType) //还可以选择MINI_KIND和MICRO_KIND
		videoBitMap = ThumbnailUtils.extractThumbnail(videoBitMap, width, height, ThumbnailUtils.OPTIONS_RECYCLE_INPUT)
	} catch (e) {
		//TODO handle the exception
		console.log(e)
	}
	return videoBitMap
}
/**
 * @Description 将位图转化为base64格式
 * @param bitmap 位图
 * @return 位图的base64版
 * */
function bitmapToBase64(bitmap) {
	// 各种android类
	let Bitmap = plus.android.importClass("android.graphics.Bitmap")
	let ByteArrayOutputStream = plus.android.importClass("java.io.ByteArrayOutputStream")
	let Byte = plus.android.importClass("java.lang.Byte")
	let Base64 = plus.android.importClass("android.util.Base64")
	// 实例化各类
	let baos = new ByteArrayOutputStream();
	let bitmapBytes = []
	let result = null
	try {
		if (bitmap !== null) {
			bitmap.compress(Bitmap.CompressFormat.JPEG, 50, baos);
			baos.flush();
			baos.close();
			bitmapBytes = baos.toByteArray()
			// encodeToString会带有换行符，放到image中使用时无效，需要去除掉换行符，
			// Apache的 commons-codec.jar， Base64.encodeBase64String(byte[]）得到的编码字符串是不带换行符的，但是目前引用不了commons-codec.jar
			result = Base64.encodeToString(bitmapBytes, Base64.DEFAULT).replace(/[\r\n]/g, "");
		}
	} catch (e) {
		//TODO handle the exception
		console.log(e)
	} finally {
		try {
			if (baos != null) {
				baos.flush();
				baos.close();
			}
		} catch (e) {
			console.log(e)
		}
	}
	return result
}


/**
 * @Description 将位图转化为png图片
 * @param filePath 文件路径，like XXX/XXX/XX.mp3，fileName 文件名
 * @return 创建出来的图片路径
 */
function makeBitMap2Png(filePath, fileName) {
	let File = plus.android.importClass("java.io.File")
}
/**
 *获取本地所有音乐*/
function getLocalMusic() {
	let list = new Array()
	// #ifdef APP-PLUS
	if (plus.os.name === 'Android') {
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
		let c = new Cursor();

		c = resolver.query(Uri, null, null, null, MediaStore.Audio.Media.DEFAULT_SORT_ORDER); // 查询数据库
		c.moveToFirst();
		let i = 0
		if (c != null) {
			while (c.moveToNext()) {
				dir = context.getFileStreamPath("Music")

				let musicTitle = c.getString(c.getColumnIndex(MediaStore.Audio.Media.DISPLAY_NAME)) + '.png'
				let file = new File(dir.getAbsolutePath() + '/Music/' + musicTitle);
				let fileOutputStream = new FileOutputStream(file)
				let musicId = c.getInt(c.getColumnIndex(MediaStore.Audio.Media._ID));
				videoImg = MediaStore.Audio.Thumbnails.getThumbnail(resolver, musicId, MediaStore.Audio.Thumbnails.MICRO_KIND,
					null)
				if (videoImg.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream)) {
					fileOutputStream.flush();
					fileOutputStream.close();
				}

				//扫描本地文件，得到歌曲的相关信息
				const tempInfo = {
					musicId: videoId,
					title: musicTitle, // 音频标题
					src: c.getString(c.getColumnIndex(MediaStore.Audio.Media.DATA)), // 音频路径
					musicCover: 'file://' + file.getAbsolutePath(), // 音频封面图
					duration: formatTimeForPlayer(c.getString(c.getColumnIndex(MediaStore.Audio.Media.DURATION)) / 1000), // 音频时长
					singer: c.getString(c.getColumnIndex(MediaStore.Audio.Media.ARTIST)), // 音频歌手
					size: c.getString(c.getColumnIndex(MediaStore.Audio.Media.SIZE)), // 音频大小
				}
				list.push(tempInfo)
				i++
			}
		}
		c.close();
	}

	// #endif
	return list
}

/**
 * @Description 获取专辑封面
 * @param filePath 文件路径，like XXX/XXX/XX.mp3
 * @return 专辑封面bitmap
 */
function createAlbumArt(filePath) {
	// 各种android类
	let MediaMetadataRetriever = plus.android.importClass("android.media.MediaMetadataRetriever")
	let BitmapFactory = plus.android.importClass("android.graphics.BitmapFactory") //从各种源创建位图对象，包括文件、流和字节数组
	let Byte = plus.android.importClass("java.lang.Byte")

	let embedPic = new Array()
	let retriever = new MediaMetadataRetriever()
	let bitmap = new BitmapFactory()

	try {
		retriever.setDataSource(filePath); //设置数据源
		embedPic = retriever.getEmbeddedPicture(); //得到字节型数据
		bitmap = BitmapFactory.decodeByteArray(embedPic, 0, embedPic.length); //转换为图片

	} catch (e) {
		//TODO handle the exception
		console.log(e)
	}

	return bitmap
}

/**
 * @描述：删除本地文件并立即更新媒体库 !该方法仅支持删除音乐/视频/图片文件且推荐删除媒体文件的时候使用该方法，通过File类删除文件时android将无法及时更新媒体库
 * @参数：!type: 要删除的文件类型，可选值为audio（音频）/video（视频）/image（图片），默认值为audio
 * 		  !path: 文件路径
 * @返回值：Object类型，如res = {
							status: false,
							msg: '删除文件失败'
						}
 * */
function deleteMediaStoreFile({
	type = 'audio',
	path,
}) {
	let res = {
		status: false,
		msg: '删除文件失败'
	}
	// #ifdef APP-PLUS
	if (plus.os.name === 'Android') {
		// 各种android类
		let Context = plus.android.importClass("android.content.Context");
		let ContentResolver = plus.android.importClass("android.content.ContentResolver");
		let MediaStore = plus.android.importClass("android.provider.MediaStore");
		let main = plus.android.runtimeMainActivity();
		let Uri = plus.android.importClass("android.net.Uri");
		// 实例化各类
		let context = main;
		let resolver = new ContentResolver();
		resolver = context.getContentResolver();

		let where = null
		if (type === 'audio') {
			Uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI; // 查询规则
			where = MediaStore.Audio.Media.DATA + " = '" + path + "'"
		} else if (type === 'video') {
			Uri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI; // 查询规则
			where = MediaStore.Video.Media.DATA + " = '" + path + "'"
		} else {
			Uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI; // 查询规则
			where = MediaStore.Images.Media.DATA + " = '" + path + "'"
		}

		try {
			resolver.delete(Uri, where, null);
			res.status = true
			res.msg = '文件删除成功'
		} catch (e) {
			//TODO handle the exception
			console.log('删除文件失败', e)
		}

	}
	// #endif
	return res
}

/**
 * @描述：获取不同类型的文件路径
 * @参数：!type: 文件类型，可选值为music（音频）/video（视频）/image（图片）/database（SQLite数据库文件），无默认值
 * @返回值：String类型，对应路径
 * */
function getPath({type}) {
	let databasePath = ''
	let directoryType = ''
	// #ifdef APP-PLUS
	if (plus.os.name === 'Android') {
		let path = ''
		// 各种android类
		let Environment = plus.android.importClass("android.os.Environment")
		let File = plus.android.importClass("java.io.File")
		// 实例化各类
		switch (type) {
			case 'database':
				path = '/hyMusic/dataBase/'
				break
			case 'music':
				// 通过Environment.DIRECTORY_MUSIC获取不到对应的公共目录， 只能直接填目录名称了
				// directoryType = Environment.DIRECTORY_MUSIC
				path = '/hyMusic/'
				break
			case 'video':
				// directoryType = Environment.DIRECTORY_MOVIES
				path = '/hyMusic/'
				break
			case 'image':
				// directoryType = Environment.DIRECTORY_PICTURES
				path = '/hyMusic/'
				break
			default:
				break
		}
		try {
			// 获取外部存储的根路径 该路径为/storage/emulated/0 + path
			let fileDir = new File(Environment.getExternalStoragePublicDirectory(directoryType).getAbsolutePath() + path)
			// 路径不存在
			if (!fileDir.exists()) {
				fileDir.mkdirs()
			}
			databasePath = fileDir.getAbsolutePath() + '/'
		} catch (e) {
			//TODO handle the exception
			console.log('路径错误', e)
		}
	} else {
		let firstFile = ''
		let fileName = 'hyMusic/'
		let secondFileName = ''
		switch (type) {
			case 'database':
				secondFileName = 'dataBase/'
				firstFile = '_documents/'
				break
			case 'music':
				// 通过Environment.DIRECTORY_MUSIC获取不到对应的公共目录， 只能直接填目录名称了
				secondFileName = 'music/'
				firstFile = '_doc/'
				break
			case 'video':
				secondFileName = 'video/'
				firstFile = '_doc/'
				break
			case 'image':
				secondFileName = 'image/'
				firstFile = '_doc/'
				break
			default:
				break
		}
		databasePath = firstFile + fileName + secondFileName
		// databasePath = '_doc/' + fileName + secondFileName
	}
	// #endif
	return databasePath
}

/**
 * @描述：校验是否为http||https开头
 * @参数：!str:校验的字符串
 * @返回值：Boolean类型，校验成功与否
 * */
function validateHttp(str) {
	if (str === undefined || str === null || str === '') return false
	const regex = /(http|https):\/\/([\w.]+\/?)\S*/
	return regex.test(str)
}
/**
 * @描述：获取网络状态 https://uniapp.dcloud.io/api/system/network?id=getnetworktype
 * @参数：callBack:回调函数
 * @返回值：String类型，网络类型
 * */
 function getNetworkType(callBack) {
	 uni.getNetworkType({
		success: (res) => {
			if(typeof callBack === 'function') {
				callBack(res.networkType)
			}
		},
		fail: (err) => {
			if(typeof callBack === 'function') {
				callBack()
			}
			console.log(err)
		}
	 })
 }
/**
  * @描述: 播放音乐
  * @参数：musicList: 音乐列表, index: 当前播放的音乐index值
  * @返回值：void
  * */
function playMusic(musicList, index) {
	utilsVue.$player.setSongsList(musicList)
	store.commit('changeSongList', utilsVue.$player.getSongList())
	if(index === null) {
		index = 0
	}
	utilsVue.$player.chooseToPlay(index, () => {
		let songInfo = utilsVue.$player.getCurrSongInfo()
		let tempSongInfo = {
			avatar: songInfo.avatar,
			songName: songInfo.name,
			singerName: songInfo.singer_name,
			background: songInfo.background,
			songId: songInfo.id,
			albumId: songInfo.album_id
		}
		store.commit('changeplayerInfo', tempSongInfo)
	})
}
// 获取当前时间并转化
function getTime(format) {
    let timeTemp = new Date();
	let arr = []
	let formatStr = ['Y', 'M', 'D', 'h', 'm', 's']
	arr.push(timeTemp.getFullYear())
	arr.push(formatNumber(timeTemp.getMonth() + 1))
	arr.push(formatNumber(timeTemp.getDate()))
	arr.push(formatNumber(timeTemp.getHours()))
	arr.push(formatNumber(timeTemp.getMinutes()))
	arr.push(formatNumber(timeTemp.getSeconds()))
	
    for (let index in arr) {
    	format = format.replace(formatStr[index], arr[index])
    }
	
    return format
}
// ios端支付对应的id, 
/*	1 余额充值1元 hy.coin1
	2 余额充值6元 hy.coin6
	3 余额充值45元 hy.coin45
	4 余额充值68元 hy.coin68
	5 余额充值118元 hy.coin118
	6 余额充值198元 hy.coin198
	7 余额充值348元 hy.coin348
	8 余额充值648 hy.coin648
	9 会员包月 hy.userMonlyCard
	10 会员包季 hy.userSeasonCard
	11 会员半年 hy.userHalfYearCard
	12 会员包年 hy.userYearCard
	13 会员连续包月 hy.newMonlyCard*/
function mapIOSPay(type) {
	let orderId = ''
	switch(type) {
		case 1:
			orderId = 'hy.coin1'
			break
		case 2:
			orderId = 'hy.coin6'
			break
		case 3:
			orderId = 'hy.coin45'
			break
		case 4:
			orderId = 'hy.coin68'
			break
		case 5:
			orderId = 'hy.coin118'
			break
		case 6:
			orderId = 'hy.coin198'
			break
		case 7:
			orderId = 'hy.coin348'
			break
		case 8:
			orderId = 'hy.coin648'
			break
		case 9:
			orderId = 'hy.userMonlyCard'
			break
		case 10:
			orderId = 'hy.userSeasonCard'
			break
		case 11:
			orderId = 'hy.userHalfYearCard'
			break
		case 12:
			orderId = 'hy.userYearCard'
			break
		case 13:
			orderId = 'hy.newMonlyCard'
			break
	}
	return orderId
}
/***********************Ironman区-end**************************/


/**
 * @param delta number 返回的页面数量,只有pageUrl = 'back'时生效
 */
function jumpTo(pageUrl, delta = 1) {
	switch (pageUrl) {
		case "back":
			uni.navigateBack({
				delta: 1
			})
			break;
		default:
			uni.navigateTo({
				url: pageUrl
			})
	}
}

/**
 * @description 获取当前页面的右上角文字
 * @param text 传入右上角文字
 */
function setNavButtonText(text) {
	// 获取右上角按钮
	// #ifdef APP-PLUS
	let pages = getCurrentPages();
	let page = pages[pages.length - 1];
	let currentWebview = page.$getAppWebview();
	let titleObj = currentWebview.getStyle().titleNView;
	titleObj.buttons[0].text = text;
	currentWebview.setStyle({
		titleNView: titleObj
	});
	return text;
	// #endif
}
function updating(){
	uni.showToast({
		title:'系统升级中',
		icon:'none'
	})
}

function nextRelease(){
	uni.showToast({
		title:'该功能将在下个正式版本中更新开放',
		icon:'none',
		duration: 2000
	})
}
/* 部分隐藏处理
** str 需要处理的字符串
** frontLen  保留的前几位
** endLen  保留的后几位
** cha  替换的字符串
*/
function replaceString(str, frontLen, endLen,cha) {
	if(!str) return false
    var len = str.length - frontLen - endLen;
    var xing = '';
    for (var i = 0; i < len; i++) {
        xing += cha;
    }
    return str.substring(0, frontLen) + xing + str.substring(str.length - endLen);
};

function handleSwiperList(dataList, callBack) {
	dataList.forEach((item, index, array) => {
		try {
			let obj = JSON.parse(item.url);
			switch (obj.type) {
				case 'song':
					utilsVue.$api.querySongDetails({ id: obj.id }).then(res => {
						item.url = res.data;
					});
					break;
				case 'singer':
					item.url = '/pages/index/singer/singer_detail?id=' + obj.id;
					break;
				case 'album':
					item.url = '/components/list/album/album-list?id=' + obj.id + '&type=album';
					break;
				case 'mix':
					item.url = '/pages/index/mixDetail/mixDetail?id=' + obj.id;
					break;
				case 'rank':
					utilsVue.$api.rankingList().then(res => {
						res.data.forEach((rankItem, index) => {
							if (rankItem.id === obj.id) item.url = '/components/list/rank/rank-list?id=' + obj.id + '&banner=' + rankItem.name + '&bg=' + rankItem.Background;
						});
					});
					break;
				case 'video':
					item.url = '/pages/index/singer/singer_video_detail?id=' + obj.id;
					break;
				case 'newDisc':
					item.url = '/components/list/album/album-list?id=' + obj.id + '&type=mix&navTitle=新碟';
					break;
				case 'notice':
					item.url = '/pages/index/notice/notice?title=' + item.title + '&content=' + btoa(encodeURI(item.content));
					break;
				case 'radio': 
					item.url = '/pages/index/radio/radio'
				default:
					break;
			}
		} catch (e) {
			// console.log('----', e)
			//TODO handle the exception
		}
	});
	return dataList;
}

/**
 * 函数节流 防抖/节流同理
 * 规定在一个单位时间内，只能触发一次函数，如果这个单位时间内触发多次函数，只有一次生效； 典型的案例就是鼠标不断点击触发，规定在n秒内多次点击只有一次生效。
 * @example methods:{
              appSearch:debounce(function(){
                this.getAppList()
              },300)
            }
 */
function throttle(fn, delay) {
  let lastTime;
  let timer;
  delay = delay || 200;
  return function () {
    let args = arguments;
    // 记录当前函数触发的时间
    let nowTime = Date.now();
    if (lastTime && nowTime - lastTime < delay) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        // 记录上一次函数触发的时间
        lastTime = nowTime;
        // 修正this指向问题
        fn.apply(this, args);
      }, delay);
    } else {
      lastTime = nowTime;
      fn.apply(this, args);
    }
  };
}

/**
 * @description 判断是否有下一页
 * @param {Number} page-页面数
 * @param {Number} limit-每页数据条数
 * @param {Number} length-这次数据条数 
 * @param {Number} total-后台返回数据总数
 * @return {Bollean}
 */
function pageHaveMore(page, limit, length, total) {
	let tempTotal = (page - 1) * limit + length;
	return tempTotal < total;
}

/**
 * @description 修改图片链接
 * @param  {String} src-资源链接
 * @param  {String} type-图片压缩类型
 * @return {string} 资源链接
 */
function handleSrc(src, type = 'middle') {
  let imgSrc = '';
  // 类型不为空且是网络图片
  if (type !== '' && validateHttp(src)) {
    let str = '';
    if (src.lastIndexOf('&x-oss-process=style/w_') !== -1) {
      str = src.slice(0, src.lastIndexOf('&x-oss-process=style/w_') + 23);
    } else {
      str = src + '&x-oss-process=style/w_';
    }
    switch (type) {
    case 'large':
      str = str + '750';
      break;
    case 'middle':
      str = str + '300';
      break;
    case 'small':
      str = str + '150';
      break;
    case 'mini':
      str = str + '50';
      break;
    default:
      break;
    }
    imgSrc = str;
  } else {
      imgSrc = src;
  }
  return imgSrc;
}

module.exports = {
	timesFun,
	jumpTo,
	formatTime,
	randomsort,
	formatTimeForPlayer,
	drawIamgeForBezier,
	requestPermission,
	getLocalVideo,
	getLocalMusic,
	deleteMediaStoreFile,
	getPath,
	validateHttp,
	setNavButtonText,
	time2Sec,
	updating,
	getNetworkType,
	playMusic,
	getTime,
	replaceString,
	nextRelease,
	mapIOSPay,
	handleSwiperList,
	throttle,
	pageHaveMore,
	handleSrc
}
/************* example *********************/
/*  
	方法名： jumpTo
	使用方法：this.$utils.jumpTo('pages/explore/pushDyna/pushDyna')
*/
/* 
	方法名： randomsort
	引入：import {randomsort} from "@/common/js/utils.js"
	使用方法：Array.sort(randomsort)
 */
/* 
	方法名： formatTime
	方法介绍：时间戳转换
	引入：import {formatTime} from "@/common/js/utils.js"
	参数：时间戳 如：1566612011， Y，M，D，h，m，s不能改变且对应 年月日时分秒 其他符号如：-，/ 等可自行改变
	使用方法：formatTime( '1566612011', 'Y-M-D h:m:s' )
	返回值： 格式化后的时间 如： 2019-08-12 13:14:30
	
 */
/* 
	方法名： timesFun
	方法介绍：将时间戳转换为距离当前的时间，如： 2分钟前
	引入：import {timesFun} from "@/common/js/utils.js"
	参数： 时间戳 如：1566612011
	使用方法：timesFun('1566612011')
	返回值： 将时间戳转换为距离当前的时间，如： 2分钟前
 */

/* 
	方法名：getLocalVideo
	方法介绍：获取本地所有视频
	引入：import {getLocalVideo} from "@/common/js/utils.js"
	参数：无
	使用方法：getLocalVideo()
	返回值： 视频列表（Array）
			[
				{
					videoId: String 视频id 如 video12
					title: String 视频标题
					src: String 视频资源路径
					videoCover: String 视频封面
					duration: Number 视频时长
				},
				.......
			]
 */
