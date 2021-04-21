import {
	randomsort
} from '@/common/js/utils'
import api from '@/common/api/index.js'
import store from '@/store'
export class hyH5Audio {
	inter_Src = null // 设置播放源
	time_Src = 0
	constructor() {
		this.h5Player = plus.audio.createPlayer({}) //audio 创建音频播放器对象
		this.audioConfig = {} //播放器相应配置
		this.audioInfo = {} // 当前音频对象配置的相关信息
		this.canPlay = false
		this.paused = true // 是否暂停或停止
		this.songsList = [] // 需要播放的歌曲列表，作为保留原有歌单，不随播放模式改变而改变
		this.playList = [] // 真正的播放歌单列表，会随播放模式改变
		this.currSongInfo = {} // 当前播放歌曲的信息
		this.timeline = 0 // 歌曲时间轴
		this.inter = null // 定时器
		this.playMode = 'order' // order: 顺序播放，singleCycle: 单曲循环，random: 随机播放
		this.init()
		this.timeOut = null // 倒计时
		this.allowPlay = false // 是否允许播放
		this.interPlay = null // 定时器 控制暂停与播放
		this.userInfo = {} // 用户信息
		this.isAlreadyPLay = {
			src: 0,
			play: false,
		} // 是否播放
		this.lastSongInfo = {
			id: -1
		} // 上一首歌曲的信息
		console.log('初始化。。。。。。。。。。。。。')
	}
	/**
	 * 设置播放歌单 */
	setSongsList(list) {
		console.log('设置播放歌单', list)
		this.songsList = this.mapInfo(list)
		this.playList = this.songsList
		if(this.playList.length > 0) {
			this.currSongInfo = this.playList[0]
		} else {
			this.currSongInfo = {}
		}
	}
	mapInfo(list) {
		let musicList = []
		for(let index in list) {
			let tempSrc = this.chooseMusicQue(list[index])
			let tempInfo = {
				src: tempSrc.src,
				quality: tempSrc.queType,
				Description: list[index].Description,
				SongStatus: list[index].song_status || list[index].SongStatus,
				album_id: list[index].album_id,
				album_name: list[index].album_name,
				hot: list[index].hot,
				avatar: list[index].avatar,
				id: list[index].id,
				created_at: list[index].created_at,
				lyric: list[index].lyric,
				mv: list[index].mv,
				name: list[index].name,
				recommend: list[index].recommend,
				singer_id: list[index].singer_id,
				singer_name: list[index].singer_name,
				status: list[index].status,
				type: list[index].type,
				updated_at: list[index].updated_at,
				position: parseInt(index),
				Sole: list[index].sole || list[index].Sole,
				url: list[index].url,
				hq_url: list[index].hq_url,
				sq_url: list[index].sq_url,
				background: list[index].background,
			}
			musicList.push(tempInfo)
		}
		return musicList
	}
	// 选择音乐品质
	chooseMusicQue(item) {
		let tempInfo = {
			src: '',
			queType: 'Q'
		}
		if(item.url) {
			tempInfo.src = item.url
			tempInfo.queType = 'Q'
		} else if(item.hq_url) {
			tempInfo.src = item.hq_url
			tempInfo.queType = 'HQ'
		} else {
			tempInfo.src = item.sq_url
			tempInfo.queType = 'SQ'
		}
		return tempInfo
	}
	// 删除歌单中的歌曲
	delSongList(index) {
		let tempList = []
		if(this.currSongInfo.id === this.playList[index].id) {
			if(this.playList.length === 1) {
				this.stop()
				this.playList = []
				this.songsList = []
			} else {
				if(this.playList.length + 1 < index) {
					this.currSongInfo = this.playList[0]
				} else {
					this.currSongInfo = this.playList[index + 1]
				}
				tempList = this.playList.splice(index, 1)
				this.playList = this.mapInfo(this.playList)
				this.songsList = this.playList
				this.switchSongs(this.currSongInfo.src)
			}
		} else {
			tempList = this.playList.splice(index, 1)
			this.playList = this.mapInfo(this.playList)
			this.songsList = this.playList
			this.switchSongs(this.currSongInfo.src)
		}
	}
	/**
	 * 设置音频数据链接 */
	setSrc(src) {
		// uni.showLoading({
		// 	title: '歌曲加载中...'
		// })
		console.log('this.innerAudioContext.src------------------********************', src)
		// this.h5Player.close()
		this.canPlay = false
		this.allowPlay = false
		this.h5Player.setStyles({src})
		
	}
	// 获取是否可以播放
	getCanPlay() {
		return this.canPlay
	}
	// 获取音频的数据链接
	getSrc() {
		return this.h5Player.getStyles('src')
	}
	/**
	 * 设置开始播放的时间，单位：s */
	setStartTime(startTime) {
		this.h5Player.setStyles({
			startTime,
		})
	}
	/**
	 * 设置自动播放 */
	setAutoplay(autoplay) {
		this.h5Player.setStyles({
			autoplay,
		})
	}
	/**
	 * 设置循环播放 */
	setLoop(loop) {
		this.h5Player.setStyles({
			loop,
		})
	}
	/**
	 * 设置音量 */
	setVolume(volume) {
		this.h5Player.setStyles({
			volume,
		})
	}
	/**
	 * 设置播放模式 */
	setPlayMode(mode) {
		this.playMode = mode
	}
	/**
	 * 配置音频数据 */
	setAudioConfig(arg) {
		if (arg) {
			this.audioConfig = {
				src: arg.src ? arg.src : '', // 音频的数据链接，用于直接播放，默认为空
				startTime: arg.startTime ? arg.startTime : 0, // 开始播放的位置（单位：s），默认 0
				autoplay: arg.autoplay ? arg.autoplay : false, // 是否自动开始播放，默认 false
				loop: arg.loop ? arg.loop : false, // 是否循环播放，默认 false
				volume: arg.volume ? arg.volume : this.getSysVolume(), // 音量。范围 0~1。 默认为系统当前的音量
			}
		}
	}
	/**
	 * 应用配置信息*/
	useAudicConfig() {
		this.h5Player.setStyles({
			src: this.audioConfig.src, // 音频的数据链接
			volume: this.audioConfig.volume, // 播放时的音量
			startTime: this.audioConfig.startTime, // 开始播放的位置（单位：s）
			autoplay: this.audioConfig.autoplay, // 是否自动播放
			loop: his.audioConfig.loop // 是否循环播放
		})
	}
	/**
	 * 获取当前播放的歌单 */
	getSongList() {
		return this.songsList
	}
	/**
	 * 获取歌曲的时长，单位为s
	 */
	getDuration() {
		return this.h5Player.getDuration()
	}
	/**
	 * 获取当前歌曲的播放位置,单位为s
	 */
	getCurrentTime() {
		return this.h5Player.getPosition()
	}
	/**
	 * 获取当前的暂停状态，true为暂停，false为正在播放
	 */
	getPaused() {
		return this.paused
	}
	getPlayerPaused() {
		return this.h5Player.isPaused()
	}
	/**
	 * 获取音频的缓冲时间点，单位为s，即当前音频正在播放的时间点到该点的内容已加载
	 */
	getBuffered() {
		return this.h5Player.getBuffered()
	}
	/**
	 * 获取系统音量
	 */
	getSysVolume() {
		let volume = 0.2
		// #ifdef APP-PLUS
		volume = plus.device.getVolume();
		// #endif
		return volume

	}
	/**
	 * 获取音频的信息,默认音频的路径是有效的
	 */
	getAudioConfig() {
		// 获取音频信息
		this.audioInfo = {
			duration: this.h5Player.getDuration(),
			currentTime: this.h5Player.getPosition(),
			paused: this.h5Player.isPaused(),
			buffered: this.h5Player.getBuffered(),
		}
		return this.audioInfo
	}
	getCurrSongInfo() {
		return this.currSongInfo
	}
	/**
	 * 初始化
	 */
	init(config, nowPlay) {
		if (config) {
			this.setAudioConfig(config)
		}
		if (this.audioConfig.src === '' || this.audioConfig.src === undefined || this.audioConfig.src === null) {
			// this.onCanplay(() => {})
			// this.onPlay(() => {})
			// this.onPause(() => {})
			// this.onStop(() => {})
			// this.onSeeked(() => {})
			// this.onSeeking(() => {})
			// this.onWaiting(() => {})
			// this.onTimeUpdate(() => {})
			this.onError()
			this.onEnded(() => {
				this.nextSong(() => {})
			})
		} else {
			this.useAudicConfig()
			// this.onCanplay(() => {})
			// this.onPlay(() => {})
			// this.onPause(() => {})
			// this.onStop(() => {})
			// this.onSeeked(() => {})
			// this.onSeeking(() => {})
			// this.onWaiting(() => {})
			// this.onTimeUpdate(() => {})
			this.onError()
			this.onEnded(() => {
				this.nextSong(() => {})
			})
		}
	}
	/**
	 * 播放或者暂停
	 *正在播放时触发该方法则暂停，暂停时触发该方法则播放
	 */
	playOrPause(callBack) {
		if (!this.getSrc() || !this.h5Player) {
			this.chooseToPlay(0)
		} else {
			this.isAlreadyPLay.play = true
			if (this.canPlay) {
				if (this.paused) {
					this.play()
				} else {
					this.pause()
					this.isAlreadyPLay.play = false
				}
			}
		}
		if(typeof callBack === 'function') {
			callBack(this.paused)
		}
	}
	/**
	 * 改变音乐音量 
	 */
	changeVolume(volume) {
		if (volume <= 1 || volume >= 0) {
			this.setVolume(volume)
		}
	}
	/**
	 * 播放音频
	 */
	play() {
		this.isAlreadyPLay.play = true
		this.playBeforeCallBack()
		console.log('this.isAlreadyPLay.play', this.canPlay, this.allowPlay)
		if(this.allowPlay) {
			console.log('this.isAlreadyPLay.play++++++++++++++++++++++++++++++')
			this.h5Player.play(() => { // 播放成功回调
				console.log('播放成功')
			}, (err) => { // 播放失败回调
				console.log('播放失败：' + err)
			})
		}
	}
	/**
	 * 播放音频前的校验
	 * */
	async playBeforeCallBack(callback) {
		this.userInfo = uni.getStorageSync('userInfo')
		if(!(this.currSongInfo === undefined)) {
			this.canPlay = true
			this.allowPlay = true
			if(this.currSongInfo.SongStatus === 2) { // 如果该歌曲是会员免费
				if(this.userInfo.vip_level !== 2 || this.userInfo === null || this.userInfo === undefined || this.userInfo === '') { // 且用户不是高级会员则不允许播放
					this.allowPlay = false
				}
			}
			
			if(this.currSongInfo.SongStatus === 3) { // 如果该歌曲是付费
				this.allowPlay = false
				await this.checkMusic(this.currSongInfo.id, (res) => { // 检查该歌曲是否已经购买
					if(res) { // 用户付费购买
						this.allowPlay = true
					}
				})
			}
			
			this.playReady(this.allowPlay, this.currSongInfo)
		}
	}
	// 播放前的准备，设置歌曲信息或是其他
	playReady(res, songInfo) {
		let token = uni.getStorageSync('token')
		if(!this.lastSongInfo || this.lastSongInfo.id !== songInfo.id) {
			console.log(this.lastSongInfo.id, songInfo.id)
			this.lastSongInfo = JSON.parse(JSON.stringify(songInfo))
			
			let tempSongInfo = {
				avatar: songInfo.avatar,
				songName: songInfo.name,
				singerName: songInfo.singer_name,
				background: songInfo.background,
				songId: songInfo.id,
			}
			store.commit('changeplayerInfo', tempSongInfo)
		}
		
		store.commit('changeplayerInfo', {allowPlay: res})
		console.log('changeplayerInfo***************', res)
		if(!res) {
			store.commit('changeplayerInfo', {alreadyClose: false})
		}
			
		if(res) {
			if(token) {
				store.dispatch('addMusicPlay', {type: 1, musicId: this.getCurrSongInfo().id})
				store.dispatch('getSingerInfo', this.getCurrSongInfo().singer_id)
			}
			store.dispatch('addMusicPlayNum', this.getCurrSongInfo().id)
		}
		
		// 获取歌曲收藏列表
		if(token) {
			store.dispatch('getCollectionList', 1)
		}
	}
	/**
	 * 从暂停播放音频
	 */
	resume() {
		this.h5Player.resume()
	}
	/**
	 * 从歌单中选择并播放某首歌,传入这首歌在歌单中的index值*/
	chooseToPlay(index) {
		if (this.playList.hasOwnProperty(index)) {
			console.log('--------------------------------------', this.currSongInfo.id, this.playList[index].id, this.currSongInfo.src, this.getSrc())
			if(this.currSongInfo.id === this.playList[index].id && this.currSongInfo.src === this.getSrc()) {
				console.log('+++++++++++++++++++++', this.getPlayerPaused())
				if(this.getPlayerPaused()) {
					this.currSongInfo = this.playList[index]
					this.switchSongs(this.currSongInfo.src)
				} else {
					this.isAlreadyPLay.play = false
					this.pause()
				}
			} else {
				this.currSongInfo = this.playList[index]
				this.switchSongs(this.currSongInfo.src)
			}
		} else {
			this.currSongInfo = this.playList[0]
			this.switchSongs(this.currSongInfo.src)
		}
	}
	/**
	 * 切换到上一首歌 */
	lastSong() {
		if (!this.currSongInfo || !this.currSongInfo.src) {
			this.currSongInfo = this.playList[0]
		} 
		
		if (this.currSongInfo.position === 0) {
			this.currSongInfo = this.playList[this.playList.length - 1]
		} else {
			this.currSongInfo = this.playList[this.currSongInfo.position - 1]
		}
		this.switchSongs(this.currSongInfo.src)
	}
	/**
	 * 切换到下一首歌 */
	nextSong() {
		if (!this.currSongInfo || !this.currSongInfo.src) {
			this.currSongInfo = this.playList[0]
		} 
		if (this.currSongInfo.position >= this.playList.length - 1) {
			this.currSongInfo = this.playList[0]
		} else {
			this.currSongInfo = this.playList[this.currSongInfo.position + 1]
		}
		this.switchSongs(this.currSongInfo.src)
	}
	/**
	 * 切换歌曲并自动播放，传入新歌曲的资源链接
	 */
	switchSongs(src) {
		console.log('--innerAudioContext----------------------------')
		if (src === this.getSrc()) {
			this.stop()
			this.timeline = 0
			this.play()
		} else {
			this.timeline = 0
			this.canPlay = false
			this.getMusicSrc(this.currSongInfo.id, (newSrc) => {
				this.setSrc(newSrc)
				this.play()
			})
		}
	}
	/**
	 * 修改播放模式并同步到歌单 */
	changePlayMode(mode = 'order') {
		this.setPlayMode(mode)
		switch (mode) {
			case 'random':
				this.playList = JSON.parse(JSON.stringify(this.songsList))
				this.playList.sort(randomsort)
				for (let index in this.playList) {
					if (this.playList[index].src === this.currSongInfo.src) {
						this.currSongInfo.position = index
					}
				}
				break;
			case 'order':
				this.playList = JSON.parse(JSON.stringify(this.songsList))
				for (let index in this.playList) {
					if (this.playList[index].src === this.currSongInfo.src) {
						this.currSongInfo.position = index
					}
				}
				
				break;
			case 'singleCycle':
				this.playList = [
					this.currSongInfo
				]
				this.currSongInfo.position = 0
				break;
			default:
				this.playList = JSON.parse(JSON.stringify(this.songsList))
				for (let index in this.playList) {
					if (this.playList[index].src === this.currSongInfo.src) {
						this.currSongInfo.position = index
					}
				}
		}
	}
	/**
	 * 暂停播放 
	 */
	pause() {
		this.h5Player.pause()
	}
	/**
	 * 停止播放
	 */
	stop() {
		this.h5Player.stop()
	}
	/**
	 * 跳转播放
	 */
	seek(position) {
		if (position <= this.getDuration()) {
			if (position === 0) {
				position = 0.001
			}
			this.h5Player.seekTo(position)
		}
	}
	/**
	 * 销毁当前实例
	 */
	destroy() {
		if (this.h5Player) {
			this.h5Player.close()
		}
	}
	/**
	 * 音乐进入可播放状态触发该方法
	 */
	onCanplay(callback) {
		this.h5Player.addEventListener('canplay', () => {
			console.log('音乐可播放')
			this.userInfo = uni.getStorageSync('userInfo')
			if(!(this.currSongInfo === undefined)) {
				this.canPlay = true
				this.allowPlay = true
				if(this.currSongInfo.SongStatus === 2) { // 如果该歌曲是会员免费
					if(this.userInfo.vip_level !== 2 || this.userInfo === null || this.userInfo === undefined || this.userInfo === '') { // 且用户不是高级会员则不允许播放
						this.allowPlay = false
					}
				}
				
				if(this.currSongInfo.SongStatus === 3) { // 如果该歌曲是付费
					this.allowPlay = false
					this.checkMusic(this.currSongInfo.id, (res) => { // 检查该歌曲是否已经购买
						if(res) { // 用户未付费购买
							this.allowPlay = true
						}
						this.play()
					})
				}
				
				if (typeof callback === 'function') {
					callback(this.allowPlay, this.currSongInfo)
				}
			}
			this.play()
		});
	}
	/**
	 * 音乐播放触发该方法*/
	onPlay(callbackDur, callbackTime) {
		this.h5Player.addEventListener('play', () => {
			clearTimeout(this.timeOut)
			console.log('音乐开始播放', this.getPaused(), this.getPlayerPaused())
			clearInterval(this.inter)
			this.paused = false
			if (typeof callbackDur === 'function') {
				this.audioInfo.duration = this.getDuration()
				callbackDur(Math.ceil(this.getDuration()))
			}
			
			if (typeof callbackTime === 'function') {
				this.setTimeLine((time, timeNum) => {
					callbackTime(time, timeNum)
				})
			}
		})
	}
	/**
	 * 音乐播放触发该方法*/
	onPlayForInfo(callBack) {
		this.h5Player.addEventListener('play', () => {
			console.log('音乐开始播放', this.getPaused())
			clearInterval(this.inter)
			this.paused = false
			clearTimeout(this.interPlay)
			this.interPlay = setTimeout(() => {
				if (typeof callBack === 'function') {
					callBack(this.currSongInfo)
				}
			}, 50)
		})
	}
	/**
	 * 音乐播放暂停触发该方法*/
	onPause(callBack) {
		this.h5Player.addEventListener('pause', () => {
			console.log('音乐已暂停', this.getPaused(), this.getPlayerPaused())
			clearInterval(this.inter)
			this.paused = true
			clearTimeout(this.interPlay)
			this.interPlay = setTimeout(() => {
				if (typeof callBack === 'function') {
					callBack()
				}
			}, 50)
		})
	}
	/**
	 * 音乐播放停止触发该方法*/
	onStop(callback) {
		this.h5Player.addEventListener('stop', () => {
			console.log('音乐播放停止')
			clearInterval(this.inter)
			this.paused = true
			if (typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 音乐自然播放结束触发该方法*/
	onEnded(callback) {
		this.h5Player.addEventListener('ended', () => {
			if (typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 音乐进度条改变触发该方法*/
	onTimeUpdate(callback) {
		this.h5Player.addEventListener('timeUpdate', () => {
			if (typeof callback === 'function') {
			 	callback(this.getCurrentTime().toFixed(3) * 1000)
			}
		})
	}
	/**
	 * 音乐播发错误触发该方法*/
	onError(callback) {
		this.h5Player.addEventListener('error', (err) => {
			console.log('播放失败', err, this.getSrc())
			this.setSrc(this.currSongInfo.src)
			if (typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 音乐进入加载中触发该方法*/
	onWaiting(callback) {
		this.h5Player.addEventListener('waiting', () => {
			uni.showLoading({
				title: '歌曲加载中'
			})
			if (typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 音乐进入进行seek操作触发该方法*/
	onSeeking(callback) {
		this.h5Player.addEventListener('seeking', () => {
			if (this.getCurrentTime() < 1 && this.getCurrentTime() > 0) {
				this.timeline = 0
			} else {
				this.timeline = Math.ceil(this.getCurrentTime())
			}
			this.pause()
			setTimeout(() => {
				this.play()
			}, 5)
			console.log('进行seek操作', this.timeline)
			if (typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 音乐完成seek操作触发该方法，没有触发过 o(≧口≦)o*/
	onSeeked(callback) {
		this.h5Player.addEventListener('seeked', (err) => {
			console.log('完成seek操作')
			if (typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 取消监听事件 
	 * 传入事件名称数组，参数如：
	 * [
		 'paly',
		 'pause',
	 ]*/
	offListener(events) {
		for (let item of events) {
			this.closeListener(item)
		}
	}
	// 关闭监听事件
	closeListener(events) {
		switch (events) {
			case 'canplay':
				this.h5Player.removeEventListener('canplay', (err) => {
					console.log('关闭' + events)
				});
				break;
			case 'play':
				this.h5Player.removeEventListener('play', (err) => {
					console.log('关闭' + events)
				})
				break;
			case 'pause':
				this.h5Player.removeEventListener('pause', (err) => {
					console.log('关闭' + events)
				})
				break;
			case 'stop':
				this.h5Player.removeEventListener('stop', (err) => {
					console.log('关闭' + events)
				})
				break;
			case 'ended':
				this.h5Player.removeEventListener('ended', (err) => {
					console.log('关闭' + events)
				})
				break;
			case 'timeupdate':
				break;
			case 'error':
				this.h5Player.removeEventListener('error', (err) => {
					console.log('关闭' + events)
				})
				break;
			case 'waiting':
				this.h5Player.removeEventListener('waiting', (err) => {
					console.log('关闭' + events)
				})
				break;
			case 'seeking':
				this.h5Player.removeEventListener('seeking', (err) => {
					console.log('关闭' + events)
				})
				break;
			case 'seeked':
				this.h5Player.removeEventListener('seeked', (err) => {
					console.log('关闭' + events)
				})
				break;
			default:
				break;
		}
	}
	/**
	 * 计时 */
	setTimeLine(callback) {
		clearInterval(this.inter)
		this.inter = setInterval(() => {
			if (this.getDuration() < this.timeline) {
				clearInterval(this.inter)
				this.timeline = 0
			} else {
				this.timeline++
				if (typeof callback === 'function') {
					callback(this.formatTime(this.timeline), Math.ceil(this.timeline))
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
	/**
	 * 检查用户是否有买这首歌 */
	 checkMusic(songId, callBack) {
		 api.listeningPermission({
		 	id: songId
		 }).then(res => {
		 	if(res.code === 200) {
				if(typeof callBack === 'function') {
					callBack(res.data)
				}
		 	} else {
		 		
		 	}
		 }).catch(err => {
		 	console.log(err)
		 })
	 }
	// 重新获取歌曲信息，避免链接过期无法播放
	getMusicSrc(songId, callBack) {
		api.querySongDetails({
			id: songId
		}).then(res => {
			if(res.code === 200) {
				console.log('重新获取歌曲信息，避免链接过期无法播放')
				if(typeof callBack === 'function') {
					callBack(this.chooseMusicQue(res.data).src)
				}
			}
		}).catch(err => {
			console.log(err)
		})
	}
}
