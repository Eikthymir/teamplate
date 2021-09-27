/**
 * 暂时还有很多问题，如onSeeked,onSeeking,onCanplay方法无效*/
export class hyBackAudio {
	constructor() {
		this.bgAudioMannager = uni.getBackgroundAudioManager(); // 获取全局唯一的背景音频管理器 backgroundAudioManager。
		this.audioConfig = {} //播放器相应配置
		this.audioInfo = {} // 当前音乐的相关信息
		this.canPlay = false
		this.paused = true // 是否是暂停或停止
		this.songsList = [] // 需要播放的歌曲列表
		this.currSongInfo = null // 当前播放歌曲的信息
		this.timeline = 0 // 歌曲时间轴
		this.inter = null // 定时器
		this.isWaiting = false // 歌曲是否正在加载，代替无效的onCanplay事件，wdnm
	}
	/**
	 * 设置播放歌单 */
	setSongsList(list) {
		this.songsList = list
	}
	/**
	 * 设置音频数据链接 */
	setSrc(src) {
		this.bgAudioMannager.src = src
	}
	/**
	 * 设置开始播放的时间，单位：s */
	setStartTime(startTime) {
		this.bgAudioMannager.startTime = startTime
	}
	/**
	 * 设置音频标题*/
	setTitle(title) {
		this.bgAudioMannager.title = title
	}
	/**
	 * 设置专辑名*/
	setEpname(epname) {
		this.bgAudioMannager.epname = epname
	}
	/**
	 * 设置设置歌手名*/
	setSinger(singer) {
		this.bgAudioMannager.singer = singer
	}
	/**
	 * 设置封面图的url*/
	setCoverImgUrl(coverImgUrl) {
		this.bgAudioMannager.coverImgUrl = coverImgUrl
	}
	/**
	 * 设置页面链接*/
	setWebUrl(webUrl) {
		this.bgAudioMannager.webUrl = webUrl
	}
	/**
	 * 设置音频协议值为：hls,http*/
	setProtocol(protocol) {
		this.bgAudioMannager.protocol = protocol
	}
	/**
	 * 配置音频数据 */
	setAudioConfig(arg = {}) {
		if (arg) {
			this.audioConfig = {
				// src: arg.src ? arg.src : '', // 音频的数据链接，用于直接播放，默认为空
				startTime: arg.startTime ? arg.startTime : 0, // 开始播放的位置（单位：s），默认 0
				title: arg.title ? arg.title : '无标题', // 音频标题，用于做原生音频播放器音频标题。原生音频播放器中的分享功能，分享出去的卡片标题，也将使用该值。
				epname: arg.epname ? arg.epname : '未知', // 专辑名，原生音频播放器中的分享功能，分享出去的卡片简介，也将使用该值。
				singer: arg.singer ? arg.singer : '网络歌手', // 歌手名，原生音频播放器中的分享功能，分享出去的卡片简介，也将使用该值。
				coverImgUrl: arg.coverImgUrl ? arg.coverImgUrl : '', // 封面图url，用于做原生音频播放器背景图。原生音频播放器中的分享功能，分享出去的卡片配图及背景也将使用该图。
				webUrl: arg.webUrl ? arg.webUrl : '', // 页面链接，原生音频播放器中的分享功能，分享出去的卡片简介，也将使用该值。
				protocol: arg.protocol ? arg.protocol : 'http', // 音频协议。默认值为 'http'，设置 'hls' 可以支持播放 HLS 协议的直播音频
			}
		}
	}
	/**
	 * 应用配置信息*/
	useAudicConfig() {
		// this.bgAudioMannager.src = this.audioConfig.src // 音频的数据链接
		this.bgAudioMannager.startTime = this.audioConfig.startTime // 开始播放的位置（单位：s）
		this.bgAudioMannager.title = this.audioConfig.title // 是否自动播放
		this.bgAudioMannager.epname = this.audioConfig.epname // 是否循环播放
		this.bgAudioMannager.singer = this.audioConfig.singer // 播放时的音量
		this.bgAudioMannager.coverImgUrl = this.audioConfig.coverImgUrl // 播放时的音量
		this.bgAudioMannager.webUrl = this.audioConfig.webUrl // 播放时的音量
		this.bgAudioMannager.protocol = this.audioConfig.protocol // 播放时的音量
	}
	/**
	 * 获取当前播放的歌单 */
	getSongsList() {
		return this.songsList
	}
	/**
	 * 获取歌曲的时长，单位为s
	 */
	getDuration() {
		return this.bgAudioMannager.duration
	}
	/**
	 * 获取当前歌曲的播放位置,单位为s
	 */
	getCurrentTime() {
		return this.bgAudioMannager.currentTime
	}
	/**
	 * 获取当前的暂停状态，true为暂停，false为正在播放
	 */
	getPaused() {
		return this.bgAudioMannager.paused
	}
	/**
	 * 获取音频的缓冲时间点，单位为s，即当前音频正在播放的时间点到该点的内容已加载
	 */
	getBuffered() {
		return this.bgAudioMannager.buffered
	}
	/**
	 * 获取-系统-音量
	 */
	getSysVolume() {
		return plus.device.getVolume();
	}
	/**
	 * 获取音频的信息,默认音频的路径是有效的
	 */
	getAudioConfig() {
		// 获取音频信息
		this.audioInfo.duration = this.bgAudioMannager.duration
		this.audioInfo.currentTime = this.bgAudioMannager.currentTime
		this.audioInfo.paused = this.bgAudioMannager.paused
		this.audioInfo.buffered = this.bgAudioMannager.buffered
	}
	/**
	 * 初始化
	 */
	init(config) {
		this.setAudioConfig(config)
		this.useAudicConfig()
		this.onCanplay(() => {})
		this.onPlay()
		this.onPause(() => {})
		this.onStop(() => {})
		this.onSeeked(() => {})
		this.onSeeking(() => {})
		this.onWaiting(() => {})
		this.onTimeUpdate(() => {})
		this.onEnded(() => {
			this.nextSong()
		})
	}
	/**
	 * 播放或者暂停
	 *正在播放时触发该方法则暂停，暂停时触发该方法则播放
	 */
	playOrPause() {
		if (this.canPlay) {
			if (this.paused) {
				this.bgAudioMannager.play()
			} else {
				this.bgAudioMannager.pause()
			}
		} else {
			this.onCanplay(() => {
				this.bgAudioMannager.play()
			})
		}
	}
	/**
	 * 播放音频
	 */
	play() {
		if (this.canPlay) {
			this.bgAudioMannager.play()
		} else {
			this.onCanplay(() => {
				this.innerAudioContext.play()
			})
		}
	}
	/**
	 * 从歌单中选择并播放某首歌,传入这首歌在歌单中的index值
	 * 回调函数返回该音乐的时长，单位：S*/
	chooseToPlay(index) {
		if (this.songsList.hasOwnProperty(index)) {
			this.currSongInfo = {
				position: index,
				src: this.songsList[index]
			}
			this.switchSongs(this.currSongInfo.src)
		}
	}
	/**
	 * 切换到上一首歌  */
	lastSong() {
		let tempSongInfo = {}
		if (this.currSongInfo.position === 0) {
			tempSongInfo = {
				position: this.songsList.length - 1,
				src: this.songsList[this.songsList.length - 1]
			}
		} else {
			tempSongInfo = {
				position: this.currSongInfo.position - 1,
				src: this.songsList[this.currSongInfo.position - 1]
			}
		}
		this.currSongInfo = tempSongInfo
		this.switchSongs(this.currSongInfo.src)
		
	}
	/**
	 * 切换到下一首歌 */
	nextSong() {
		let tempSongInfo = {}
		if (this.currSongInfo.position >= this.songsList.length - 1) {
			tempSongInfo = {
				position: 0,
				src: this.songsList[0]
			}
		} else {
			tempSongInfo = {
				position: this.currSongInfo.position + 1,
				src: this.songsList[this.currSongInfo.position + 1]
			}
		}
		this.currSongInfo = tempSongInfo
		this.switchSongs(this.currSongInfo.src)
	}
	/**
	 * 切换歌曲并自动播放，传入新歌曲的资源链接
	 */
	switchSongs(src) {
		this.timeline = 0
		this.canPlay = false
		this.setSrc(src)
		this.play()
	}
	/**
	 * 暂停播放 
	 */
	pause() {
		this.bgAudioMannager.pause()
	}
	/**
	 * 停止播放
	 */
	stop() {
		this.bgAudioMannager.stop()
	}
	/**
	 * 跳转播放
	 */
	seek(position) {
		if (position <= this.getDuration()) {
			this.bgAudioMannager.seek(position)
		}
	}
	/**
	 * 音乐进入可播放状态触发该方法,貌似无效，难道是我的姿势不对？ onCanplay无！法！触！发！心痛，没用就不要拿出来呀wdnm,都是程序员，程序员何苦为难程序员
	 */
	onCanplay(callback) {
		this.bgAudioMannager.onCanplay(() => {
			console.log('音乐可播放')
			this.canPlay = true
			callback()
		})
	}
	/**
	 * 音乐播放触发该方法*/
	onPlay(callbackDur, callbackTime) {
		this.bgAudioMannager.onPlay(() => {
			console.log('音乐开始播放')
			clearInterval(this.inter)
			this.paused = false
			this.canPlay = true
			if(typeof callbackDur === 'function') {
				this.audioInfo.duration = this.getDuration()
				callbackDur(this.getDuration())
			}
			
			if(typeof callbackTime === 'function') {
				this.setTimeLine((time) => {
					callbackTime(time)
				})
			}
		})
	}
	/**
	 * 音乐播放暂停触发该方法*/
	onPause(callback) {
		this.bgAudioMannager.onPause(() => {
			console.log('音乐已暂停')
			clearInterval(this.inter)
			this.paused = true
			if(typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 音乐播放停止触发该方法*/
	onStop(callback) {
		this.bgAudioMannager.onStop(() => {
			clearInterval(this.inter)
			this.paused = true
			if(typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 音乐自然播放结束触发该方法*/
	onEnded(callback) {
		this.bgAudioMannager.onEnded(() => {
			console.log('自然播放结束')
			if(typeof callback === 'function') {
				callback()
			} 
		})
	}
	/**
	 * 音乐进度条改变触发该方法*/
	onTimeUpdate(callback) {
		this.bgAudioMannager.onTimeUpdate(() => {
		})
	}
	/**
	 * 音乐播发错误触发该方法*/
	onError(callback) {
		this.bgAudioMannager.onError(() => {
			console.log('播放失败')
			callback()
		})
	}
	/**
	 * 音乐进入加载中触发该方法*/
	onWaiting(callback) {
		this.bgAudioMannager.onWaiting(() => {
			console.log('进入加载中')
			this.isWaiting = true
			callback()
		})
	}
	/**
	 * 音乐进入进行seek操作触发该方法,貌似无效，难道是我的姿势不对？*/
	onSeeking(callback) {
		this.bgAudioMannager.onSeeking(() => {
			console.log('进行seek操作')
			if(typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 音乐完成seek操作触发该方法,貌似无效，难道是我的姿势不对？*/
	onSeeked(callback) {
		console.log('注册seeked')
		this.bgAudioMannager.onSeeked(() => {
			console.log('完成seek操作')
			if(typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 用户在系统音乐播放面板点击上一曲事件（iOS only）*/
	onPrev(callback) {
		this.bgAudioMannager.onPrev(() => {
			console.log('onPrev')
			callback()
		})
	}
	/**
	 * 用户在系统音乐播放面板点击下一曲事件（iOS only）*/
	onNext(callback) {
		this.bgAudioMannager.onNext(() => {
			console.log('onNext')
			callback()
		})
	}
	/**
	 * 计时 */
	setTimeLine(callback) {
		this.inter = setInterval(() => {
			if (this.getDuration() <= this.timeline) {
				clearInterval(this.inter)
				this.timeline = 0
			} else {
				this.timeline++
				if(typeof callback === 'function') {
					callback(this.formatTime(this.timeline))
				}
			}
		}, 1000)
	}
	/**
	 *重置timeLine */
	resetTimeLine() {
		clearInterval(this.inter)
		this.timeline = 0
	}
	/**
	 * 格式化时间 传入秒*/
	formatTime(time) {
		// const hour = 
		const min = this.formatNumber(parseInt((time / 60)) % 60)
		const sec = this.formatNumber(time % 60)
		return min + ':' + sec
	}
	/**
	 * 格式化两位数 */
	formatNumber(n) {
		n = n.toString()
		return n[1] ? n : '0' + n
	}
}
