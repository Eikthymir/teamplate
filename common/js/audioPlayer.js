import {
	randomsort,
	getNetworkType,
} from '@/common/js/utils'
import api from '@/common/api/index.js'
import store from '@/store'
import {Downloader} from '@/common/js/plusDownloader.js'
export class hyAudio {
	inter_Src = null // 设置播放源
	time_Src = 0
	expiredTimeSegStart = 'auth_key=' // 歌曲过期时间分割符-开始
	expiredTimeSegEnd = '-' // 歌曲过期时间分割符-结束
	//IOS事件枚举 0 加载中, 1 暂停, 2 播放, 3 结束（播放完成）, 4 重新播放, 5 拖动播放, 6 继续播放, 7 播放错误、失败, 8 下一首, 9 上一首, 10 试听结束
	constructor() {
		// #ifdef APP-PLUS
		this.platform = plus.os.name
		// #endif
		// this.innerAudioContext = uni.createInnerAudioContext(); //audio 上下文 innerAudioContext 对象。
		this.audioConfig = {} //播放器相应配置
		this.audioInfo = {} // 当前音乐的相关信息
		this.canPlay = false
		this.paused = true // 是否是暂停或停止
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
		this.isFirstPlay = true // 是否是第一次播放
		this.lastSongInfo = {
			id: -1
		} // 上一首歌曲的信息
		this.onlyWifi = true // 是否仅WiFi播放
		this.listenAndSave = true // 是否边听边存
		this.downloaderCache = new Downloader()
		this.currSongQue = 'Q' // 当前歌曲的品质
		this.interAudition = null // 试听定时器,每秒触发一次并获取当前的播放事时间
		this.isAudition = false // 是否试听完成
		this.isOnlyWIFI = false // 该歌曲是否是仅WIFI播放
		this.isLocalSong = false // 是否是本地歌曲
		this.isFirstToPlay = true // 是否第一次调用播放
		this.audioSrc = '' // 播放器中的src
		this.currentTime = '' // 当前歌曲播放的时间
		this.duration = 0 // 歌曲时间
		this.isAgain = false // 是否是重新播放
		this.isToPlay = false // 是否有播放
	}
	initNative() {
		if(this.platform === 'Android') {
			this.nativePlayer = require('@/common/js/html5app-music-not.js')
			this.nativePlayer.initService()
		} else {
			this.nativePlayer = uni.requireNativePlugin('HuaYin_MusicController')
		}
	}
	/**
	 * 初始化状态栏 */
	initStatusBar() {
		this.nativePlayer.show((data) => {
			//监听控制条按键点击事件K
			switch (data.action) {
				//暂停
				case "com.example.notification.ServiceReceiver.pause":
					this.nativePlayer.updateNotification(1);
					this.play()
					break;
					//播放	
				case "com.example.notification.ServiceReceiver.play":
					this.nativePlayer.updateNotification(2);
					this.pause()
					break;
					//上一首	
				case "com.example.notification.ServiceReceiver.last":
					//上一首歌曲信息
					this.lastSong()
					break;
					//下一首	
				case "com.example.notification.ServiceReceiver.next":
					//下一首歌曲信息
					this.nextSong()
					break;
				case "notification-open":
					//打开当前播放页面（uni-app页面）
					break;
				default:
					break;
			}
		});
	}
	/**
	 * 设置播放歌单 */
	setSongsList(list) {
		if(list) {
			this.songsList = this.mapInfo(list)
			this.playList = JSON.parse(JSON.stringify(this.songsList))
			if(this.playList.length > 0) {
				// this.currSongInfo = this.playList[0]
			} else {
				this.currSongInfo = {}
			}
		}
	}
	mapInfo(list) {
		let musicList = []
		if(Array.isArray(list)) {
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
		} else {
			let tempSrc = this.chooseMusicQue(list)
			let tempInfo = {
				src: tempSrc.src,
				quality: tempSrc.queType,
				Description: list.Description,
				SongStatus: list.song_status || list.SongStatus,
				album_id: list.album_id,
				album_name: list.album_name,
				hot: list.hot,
				avatar: list.avatar,
				id: list.id,
				created_at: list.created_at,
				lyric: list.lyric,
				mv: list.mv,
				name: list.name,
				recommend: list.recommend,
				singer_id: list.singer_id,
				singer_name: list.singer_name,
				status: list.status,
				type: list.type,
				updated_at: list.updated_at,
				position: this.playList.length,
				Sole: list.sole || list.Sole,
				url: list.url,
				hq_url: list.hq_url,
				sq_url: list.sq_url,
				background: list.background,
				maxQuality: tempSrc.maxQuality,
			}
			musicList = tempInfo
		}
		
		return musicList
	}
	// 选择音乐品质
	chooseMusicQue(item) {
		let tempInfo = {
			src: '',
			queType: 'Q',
			maxQuality: ''
		}
		tempInfo.maxQuality = item.sq_url ? 'SQ' : item.hq_url ? 'HQ' : ''
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
	// 获取音乐品质
	mapMusicQue() {
		let item = this.currSongInfo
		let tempList = []
		if(item.url) {
			tempList.push({
				title: '标准',
				value: 'Q'
			})
		}
		if(item.hq_url) {
			tempList.push({
				title: '高品质',
				value: 'HQ'
			})
		}
		if(item.sq_url) {
			tempList.push({
				title: '超高品质',
				value: 'SQ'
			})
		}
		return tempList
	}
	// 删除歌单中的歌曲
	delSongList(songId) {
		let selectedIndexForPlayList = 0
		let selectedIndexForSongList = 0
		for(let i = 0, len = this.playList.length; i < len; i++) {
			if(songId === this.playList[i].id) {
				selectedIndexForPlayList = i
				break
			}
		}
		for(let i = 0, len = this.songsList.length; i < len; i++) {
			if(songId === this.songsList[i].id) {
				selectedIndexForSongList = i
				break
			}
		}
		
		let tempList = []
		if(songId === this.currSongInfo.id) {
			if(this.playList.length === 1) {
				this.stop()
				this.playList = []
				this.songsList = []
			} else {
				let tempInfo = {}
				if(this.playList.length + 1 < selectedIndexForPlayList) {
					tempInfo = this.playList[0]
				} else {
					tempInfo = this.playList[selectedIndexForPlayList + 1]
				}
				this.playList.splice(selectedIndexForPlayList, 1)
				this.songsList.splice(selectedIndexForSongList, 1)
				this.playList = this.mapInfo(this.playList)
				this.songsList = this.mapInfo(this.songsList)
				this.switchSongs(tempInfo)
			}
		} else {
			this.playList.splice(selectedIndexForPlayList, 1)
			this.songsList.splice(selectedIndexForSongList, 1)
			this.playList = this.mapInfo(this.playList)
			this.songsList = this.mapInfo(this.songsList)
		}
	}
	// 添加到播放歌单
	addSongList(songInfo) {
		let songList = this.mapInfo(songInfo)
		if(Array.isArray(songInfo)){
			for(let i = 0, len = songList.length; i < len; i++) {
				let isHas = false
				for(let j = 0, len = this.playList.length; j < len; j++) {
					if(songList[i].id === this.playList[j].id) {
						isHas = true
					}
				}
				if(!isHas) {
					this.playList.push(songList[i])
				}
			}
			
			this.songsList = this.playList
			store.commit('changeSongList', this.songsList)
			uni.showToast({
				title: '歌曲已添加到播放歌单',
				icon: 'none'
			})
		} else {
			let isHas = false
			for(let i = 0, len = this.playList.length; i < len ; i++) {
				if(songList.id === this.playList[i].id) {
					isHas = true
				}
			}
			if(!isHas) {
				this.playList.push(songList)
				this.songsList = this.playList
				store.commit('changeSongList', this.songsList)
				uni.showToast({
					title: '歌曲已添加到播放歌单',
					icon: 'none'
				})
			} else {
				uni.showToast({
					title: '该歌曲已经在播放歌单中',
					icon: 'none'
				})
			}
		}
	}
	/**
	 * 设置音频数据链接 */
	setSrc(src) {
		// 清除试听定时器
		clearInterval(this.interAudition)
		this.interAudition = null
		// 暂停正在播放的歌曲
		// this.pause()
		this.canPlay = false
		this.allowPlay = false
		// this.innerAudioContext.startTime = 0
		this.onlyWifi = uni.getStorageSync('onlyWIFI') === undefined ? false : uni.getStorageSync('onlyWIFI')
		this.isOnlyWIFI = false
		this.isAudition = false
		this.isToPlay = false
		let canplayTime = 0
		
		this.playBeforeCallBack((resBefore, songInfo) => {  // 判断是否允许播放
			songInfo.src = src
			songInfo['isAudition'] = !resBefore
			songInfo['auditionTime'] = 60
			let tempInfo = {
				src: src,
				title: songInfo.name,
				singerName: songInfo.singer_name,
				backgroundImg: songInfo.avatar,
			}
			this.audioSrc = src
			if(this.onlyWifi) { // 用户设置了仅wifi播放
				getNetworkType((resNetwork) => {
					if(resNetwork === 'wifi') { // 当前为wifi环境
						// this.innerAudioContext.src = src
						if(this.platform === 'Android') { // android 播放
							this.nativePlayer.setSrc(tempInfo, res => {
								if(typeof res === 'object') {
									console.log('设置播放链接', res)
									if(parseInt(res.status) === 0) {
										this.duration = res.duration
										uni.$emit('onCanplay', res)
										uni.$emit('onCanplayTemp')
									}
									if(parseInt(res.status) === -1) {
										uni.$emit('onError')
									}
								}
							})
						} else { // IOS 播放
							console.log('wifi')
							this.nativePlayer.showMusicWithData({musicData: songInfo}, (res) => {
								if (res.bufferProgress !== 0) {
									this.duration = Math.ceil(res.musicTime) * 1000
									this.currentTime = res.currentTime * 1000
									uni.$emit('onTimeUpdate')
									if(canplayTime < 1) {
										uni.$emit('onCanplay', res)
									}
									canplayTime++
								}
							})
						}
					} else { // 用户设置了仅wifi播放,当前为非wifi环境
						if(src.indexOf('file://') !== -1) { // 播放的时是本地音乐
							// this.innerAudioContext.src = src
							if(this.platform === 'Android') { // android 播放
								this.nativePlayer.setSrc(tempInfo, res => {
									if(typeof res === 'object') {
										if(parseInt(res.status) === 0) {
											this.duration = res.duration
											uni.$emit('onCanplay', res)
											uni.$emit('onCanplayTemp')
										}
										if(parseInt(res.status) === -1) {
											uni.$emit('onError')
										}
									}
								})
							} else { // IOS 播放
								console.log('notwifi')
								this.nativePlayer.showMusicWithData({musicData: songInfo}, (res) => {
									if (res.bufferProgress !== 0) {
										this.duration = Math.ceil(res.musicTime) * 1000
										this.currentTime = res.currentTime * 1000
										uni.$emit('onTimeUpdate')
										if(canplayTime < 1) {
											uni.$emit('onCanplay', res)
										}
										canplayTime++
									}
								})
							}
						} else { // 播放的是网络音乐
							this.isOnlyWIFI = true
							let tempSongInfo = {
								avatar: songInfo.avatar,
								songName: songInfo.name,
								singerName: songInfo.singer_name,
								background: songInfo.background,
								songId: songInfo.id,
								albumId: songInfo.album_id
							}
							store.commit('changeplayerInfo', tempSongInfo)
							uni.showToast({
								title: '当前为非WIFI环境,音乐将不会播放,请切换至WIFI环境后再播放或在设置中将"仅WIFI播放"关闭',
								icon: 'none',
								duration: 3000
							})
						}
					}
				})
			} else { // 用户没有设置仅wifi播放
				// this.innerAudioContext.src = src
				if(this.platform === 'Android') { // android 播放
					this.nativePlayer.setSrc(tempInfo, res => {
						if(typeof res === 'object') {
							if(parseInt(res.status) === 0) {
								this.duration = res.duration
								uni.$emit('onCanplay', res)
								uni.$emit('onCanplayTemp')
							}
							if(parseInt(res.status) === -1) {
								uni.$emit('onError')
							}
						}
					})
				} else { // IOS 播放
					console.log('给IOS的数据', songInfo)
					this.nativePlayer.showMusicWithData({musicData: songInfo}, (res) => {
						if (res.bufferProgress !== 0) {
							this.duration = Math.ceil(res.musicTime) * 1000
							this.currentTime = res.currentTime  * 1000
							uni.$emit('onTimeUpdate')
							console.log(res)
							if(canplayTime < 1) {
								uni.$emit('onCanplay', res)
							}
							canplayTime++
						}
					})
				}
			}
			this.isFirstPlay = true
			console.log('准备播放')
			this.play()
		})
	}
	// 改变音乐品质
	changeMusicQue(que) {
		this.getMusicSrc(this.currSongInfo, (src, data) => {
			this.currSongQue = que
			if(que === 'Q') {
				this.setSrc(data.url)
			}
			if(que === 'HQ') {
				this.setSrc(data.hq_url)
			}
			if(que === 'SQ') {
				this.setSrc(data.sq_url)
			}
		})
	}
	// 设置是否允许播放
	setAllowPlay(value) {
		this.allowPlay = value
	}
	// 获取是否可以播放
	getCanPlay() {
		return this.canPlay
	}
	// 获取音频的数据链接
	getSrc() {
		return this.audioSrc
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
	// useAudicConfig() {
	// 	this.innerAudioContext.src = this.audioConfig.src // 音频的数据链接
	// 	this.innerAudioContext.startTime = this.audioConfig.startTime // 开始播放的位置（单位：s）
	// 	this.innerAudioContext.autoplay = this.audioConfig.autoplay // 是否自动播放
	// 	this.innerAudioContext.loop = this.audioConfig.loop // 是否循环播放
	// 	this.innerAudioContext.volume = this.audioConfig.volume // 播放时的音量
	// }
	// 获取当前播放的歌曲品质
	getCurrSongQue() {
		this.currSongQue
	}
	/**
	 * 获取当前播放的歌单 */
	getSongList() {
		return this.songsList
	}
	/**
	 * 获取歌曲的时长，单位为ms
	 */
	getDuration() {
		return this.duration
		// return this.innerAudioContext.duration
	}
	/**
	 * 获取当前歌曲的播放位置,单位为ms
	 */
	getCurrentTime() {
		return this.currentTime
		// return this.innerAudioContext.currentTime
	}
	getIsToPlay() {
		return this.isToPlay
	}
	/**
	 * 获取当前的暂停状态，true为暂停，false为正在播放
	 */
	getPaused() {
		return this.paused
	}
	/**
	 * 获取音频的信息,默认音频的路径是有效的
	 */
	// getAudioConfig() {
	// 	// 获取音频信息
	// 	this.audioInfo.duration = this.innerAudioContext.duration
	// 	this.audioInfo.currentTime = this.innerAudioContext.currentTime
	// 	this.audioInfo.paused = this.innerAudioContext.paused
	// 	this.audioInfo.buffered = this.innerAudioContext.buffered
	// }
	getCurrSongInfo() {
		return this.currSongInfo
	}
	// 获取是否已经试听过
	getIsAudition() {
		return this.isAudition
	}
	// 获取当前歌曲是否是仅wifi播放
	getIsOnlyWIFI() {
		return this.isOnlyWIFI
	}
	// 获取该歌曲是否允许播放
	getAllowPlay() {
		return this.allowPlay
	}
	// 获取该歌曲是否是缓存的歌曲
	getIsLocalSong() {
		return this.isLocalSong
	}
	/**
	 * 初始化
	 */
	init(config, nowPlay) {
		if (config) {
			this.setAudioConfig(config)
		}
		if (this.audioConfig.src === '' || this.audioConfig.src === undefined || this.audioConfig.src === null) {
			this.onCanplay(() => {})
			this.onError()
			this.onEnded(() => {
				this.nextSong(false)
			})
		} else {
			this.useAudicConfig()
			this.onCanplay(() => {})
			this.onError()
			this.onEnded(() => {
				this.nextSong(false)
			})
		}
	}
	/**
	 * 播放或者暂停
	 *正在播放时触发该方法则暂停，暂停时触发该方法则播放
	 */
	playOrPause(callBack) {
		if (!this.audioSrc || !this.nativePlayer) {
			if(!this.onlyWifi) {
				this.chooseToPlay(0)
			}
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
	 * 播放音频
	 */
	play() {
		this.isAlreadyPLay.play = true
		if (this.canPlay) {
			// 允许播放则直接播放,不允许则判断是否试听过,试听过不能再直接播放
			if(this.allowPlay) {
				// this.innerAudioContext.play()
				if(this.platform === 'Android') {
					if(this.isFirstPlay) {
						this.currentTime = 0
						this.nativePlayer.play(res => {
							if(res.status !== undefined) {
								this.isFirstPlay = false
								if(parseInt(res.status) === 2) {
									uni.$emit('onPlay')
								}
								if(parseInt(res.status) === 3) {
									uni.$emit('onEnded')
								}
							} else {
								this.currentTime = res.currentPosition
								uni.$emit('onTimeUpdate')
							}
						})
					} else {
						this.nativePlayer.playContinue(res => {
							console.log('继续播放音频', JSON.stringify(res), parseInt(res) === 2)
							this.isFirstPlay = false
							if(parseInt(res) === 2) {
								uni.$emit('onPlay')
							}
						})
					}
				} else {
					let playType = 0
					if(this.isFirstPlay) {
						playType = 2
					} else if(this.isAgain) {
						playType = 4
					} else {
						playType = 6
					}
					this.nativePlayer.showMusicWithEven({playType}, (res) => {
						this.isFirstPlay = false
						this.IOSMapEvent(res)
					})
				}
			} else {
				if(!this.isAudition) {
					// this.innerAudioContext.play()
					if(this.platform === 'Android') {
						if(this.isFirstPlay) {
							this.currentTime = 0
							this.nativePlayer.play(res => {
								if(res.status !== undefined) {
									this.isFirstPlay = false
									if(parseInt(res.status) === 2) {
										uni.$emit('onPlay')
									}
									
									if(parseInt(res.status) === 3) {
										uni.$emit('onEnded')
									}
								} else {
									this.currentTime = res.currentPosition
									uni.$emit('onTimeUpdate')
								}
							})
						} else {
							this.nativePlayer.playContinue(res => {
								console.log('继续播放音频', JSON.stringify(res), parseInt(res) === 2)
								this.isFirstPlay = false
								if(parseInt(res) === 2) {
									uni.$emit('onPlay')
								}
							})
						}
					} else {
						let playType = 0
						if(this.isFirstPlay) {
							playType = 2
						} else if(this.isAgain) {
							playType = 4
						} else {
							playType = 6
						}
						this.nativePlayer.showMusicWithEven({playType}, (res) => {
							this.isFirstPlay = false
							this.IOSMapEvent(res)
						})
					}
				}
			}
		}
	}
	/**
	 * 播放音频前的校验
	 * */
	async playBeforeCallBack(callback) {
		this.userInfo = uni.getStorageSync('userInfo') || {}
		if(!(this.currSongInfo === undefined)) {
			this.allowPlay = true
			this.isFirstPlay = true
			this.canPlay = true
			if(store.state.isXF) {
				if(typeof callback === 'function') {
					callback(true, this.currSongInfo)
				}
				return false
			}
			if(this.currSongQue !== 'Q') {
				if(this.userInfo.vip_level === undefined) {
					this.allowPlay = false
					if(typeof callback === 'function') {
						callback(false, this.currSongInfo)
					}
					return false
				}
			}
			if(this.currSongInfo.src.indexOf('file://') !== -1) {
				if(typeof callback === 'function') {
					callback(true, this.currSongInfo)
				}
				return false
			}
			
			if(this.currSongInfo.SongStatus === 1) { // 当前播放的歌曲为免费歌曲
				if(this.currSongQue !== 'Q') { // 当前播放的歌曲的品质不是标准品质
					if(this.userInfo.vip_level !== 2) { // 用户不是会员,即无法播放高品质的歌曲
						this.allowPlay = false
						try{
							this.checkMusic(this.currSongInfo.id, (res) => { // 检查用户是否有单独购买过这首歌曲,买过则允许非会员用户听
								this.allowPlay = res
								if(typeof callback === 'function') {
									callback(res, this.currSongInfo)
								}
							})
						}catch(e){
							//TODO handle the exception
							this.allowPlay = false
							if(typeof callback === 'function') {
								callback(this.allowPlay, this.currSongInfo)
							}
						}
					} else {
						if(typeof callback === 'function') {
							callback(this.allowPlay, this.currSongInfo)
						}
					}
				} else {
					if(typeof callback === 'function') {
						callback(this.allowPlay, this.currSongInfo)
					}
				}
			}
			
			// 暂时不做判断
			if(this.currSongInfo.SongStatus === 2) { // 如果该歌曲是会员免费
				if(this.userInfo.vip_level !== 2 || this.userInfo === null || this.userInfo === undefined || this.userInfo === '') { // 且用户不是高级会员则不允许播放
					this.allowPlay = false
					try{
						this.checkMusic(this.currSongInfo.id, (res) => {
							this.allowPlay = res
							if(typeof callback === 'function') {
								callback(res, this.currSongInfo)
							}
						})
					}catch(e){
						//TODO handle the exception
						this.allowPlay = false
						if(typeof callback === 'function') {
							callback(this.allowPlay, this.currSongInfo)
						}
					}
				} else {
					if(typeof callback === 'function') {
						callback(this.allowPlay, this.currSongInfo)
					}
				}
			}
			
			if(this.currSongInfo.SongStatus === 3) { // 如果该歌曲是付费
				try{
					this.checkMusic(this.currSongInfo.id, (res) => {
						this.allowPlay = res
						if(typeof callback === 'function') {
							callback(res, this.currSongInfo)
						}
					})
				}catch(e){
					//TODO handle the exception
					this.allowPlay = false
					if(typeof callback === 'function') {
						callback(this.allowPlay, this.currSongInfo)
					}
				}
			}
		}
	}
	// 播放前的准备，设置歌曲信息或是其他
	playReady(res, songInfo) {
		let token = uni.getStorageSync('token')
		if(!this.lastSongInfo || this.lastSongInfo.id !== songInfo.id) {
			this.lastSongInfo = JSON.parse(JSON.stringify(songInfo))
			
			let tempSongInfo = {
				avatar: songInfo.avatar,
				songName: songInfo.name,
				singerName: songInfo.singer_name,
				background: songInfo.background,
				songId: songInfo.id,
				albumId: songInfo.album_id
			}
			store.commit('changeplayerInfo', tempSongInfo)
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
	// 音乐试听,试听到进度的30秒后将停止播放并清除定时
	musicAudition() {
		clearInterval(this.interAudition)
		this.interAudition = null
		this.interAudition = setInterval(() => {
			if(this.getCurrentTime() > 60000) {
				if(uni.getStorageSync('token')) {
					store.commit('changeplayerInfo', {allowPlay: this.allowPlay})
					if(!this.allowPlay) {
						store.commit('changeplayerInfo', {alreadyClose: false})
					}
				} else {
					store.commit("updateIsShowLogin",true)
				}
				// 弹出弹框
				this.pause()
				this.isAudition = true
				clearInterval(this.interAudition)
				this.interAudition = null
			}
		}, 1000)
	}
	/**
	 * 从歌单中选择并播放某首歌,传入这首歌在歌单中的index值*/
	chooseToPlay(index, callback) {
		if (this.playList.hasOwnProperty(index)) {
			if(this.currSongInfo.id === this.playList[index].id && this.currSongInfo.src === this.audioSrc) {
				if(this.paused) {
					this.switchSongs(this.playList[index], () => {
						if(typeof callback === 'function') {
							callback()
						}
					})
				} else {
					this.isAlreadyPLay.play = false
					this.pause()
				}
			} else {
				this.switchSongs(this.playList[index], () => {
					if(typeof callback === 'function') {
						callback()
					}
				})
			}
		} else {
			this.switchSongs(this.playList[0], () => {
				if(typeof callback === 'function') {
					callback()
				}
			})
		}
	}
	/**
	 * 切换到上一首歌  */
	lastSong() {
		let tempSongInfo = {}
		if (!this.currSongInfo || !this.currSongInfo.src) {
			tempSongInfo = this.playList[0]
		} 
		
		if (this.currSongInfo.position === 0) {
			tempSongInfo = this.playList[this.playList.length - 1]
		} else {
			tempSongInfo = this.playList[this.currSongInfo.position - 1]
		}
		// console.log(!this.currSongInfo || !this.currSongInfo.src, this.currSongInfo.position === 0)
		this.switchSongs(tempSongInfo)
	}
	/**
	 * 切换到下一首歌 */
	nextSong() {
		let tempSongInfo = {}
		if (!this.currSongInfo || !this.currSongInfo.src) {
			tempSongInfo = this.playList[0]
		} 
		if (this.currSongInfo.position >= this.playList.length - 1) {
			tempSongInfo = this.playList[0]
		} else {
			tempSongInfo = this.playList[this.currSongInfo.position + 1]
		}
		// console.log(!this.currSongInfo || !this.currSongInfo.src, this.currSongInfo.position >= this.playList.length - 1)
		this.switchSongs(tempSongInfo)
	}
	/**
	 * 切换歌曲并自动播放，传入新歌曲的资源链接
	 */
	switchSongs(info, callback) {
		store.commit('changeNowSongInfo', {songId: info.id})
		this.currSongQue = 'Q'
		console.log('songInfo-------------------1', info)
		if (info.src === this.audioSrc && plus.os.name === 'iOS') {
			console.log('同一首歌,停止播放继续播放')
			this.stop()
			this.timeline = 0
			this.isFirstPlay = true
			uni.$emit('onCanplayTemp')
			this.play()
		} else {
			this.timeline = 0
			this.canPlay = false
			this.isToPlay = false
			if(this.listenAndSave && !store.state.isXF) {
				this.downloaderCache.checkSongCache(info, (res) => {
					if(res.code === 1) {
						this.isLocalSong = true
						info.src = this.platform === 'iOS' ? 'file://' + plus.io.convertLocalFileSystemURL(res.data.src) : 'file://' + res.data.src
						info.avatar = this.platform === 'iOS' ? 'file://' + plus.io.convertLocalFileSystemURL(res.data.avatarSrc) : 'file://' + res.data.avatarSrc
						info.background = this.platform === 'iOS' ? 'file://' + plus.io.convertLocalFileSystemURL(res.data.backgroundSrc) : 'file://' + res.data.backgroundSrc
						this.currSongInfo = info
						this.setSrc(info.src)
						// this.play()
						if(typeof callback === 'function') {
							callback()
						}
					} else {
						this.isLocalSong = false
						this.getMusicSrc(info, (newSrc) => {
							info.src = newSrc
							this.currSongInfo = info
							this.userInfo = uni.getStorageSync('userInfo') || {}
							if ((info.SongStatus === 2 || info.SongStatus === 1) && this.userInfo.vip_level === 2) {
								this.downloaderCache.createMusicCacheDownlaoder(info)
							} else if (info.SongStatus === 3 || (info.SongStatus === 2 && this.userInfo.vip_level !== 2)) {
								this.checkMusic(info.id, (res) => {
									if(res) {
										this.downloaderCache.createMusicCacheDownlaoder(info)
									}
								})
							}
							this.setSrc(newSrc)
							// this.play()
							if(typeof callback === 'function') {
								callback()
							}
						})
					}
				})
			} else {
				this.getMusicSrc(info, (newSrc) => {
					info.src = newSrc
					this.currSongInfo = info
					this.setSrc(newSrc)
					// this.play()
					if(typeof callback === 'function') {
						callback()
					}
				})
			}
		}
	}
	/**
	 * 修改播放模式并同步到歌单 */
	changePlayMode(mode = 'order') {
		switch (mode) {
			case 'random':
				this.playList = JSON.parse(JSON.stringify(this.songsList))
				this.playList.sort(randomsort)
				for (let index in this.playList) {
					this.playList[index].position = parseInt(index)
					if (this.playList[index].id === this.currSongInfo.id) {
						this.currSongInfo.position = parseInt(index)
					}
				}
				break;
			case 'order':
				this.playList = JSON.parse(JSON.stringify(this.songsList))
				for (let index in this.playList) {
					if (this.playList[index].id === this.currSongInfo.id) {
						this.currSongInfo.position = parseInt(index)
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
					if (this.playList[index].id === this.currSongInfo.id) {
						this.currSongInfo.position = parseInt(index)
					}
				}
		}
	}
	/**
	 * 暂停播放 
	 */
	pause() {
		// this.innerAudioContext.pause()
		if(this.platform === 'Android') {
			this.nativePlayer.pause(res => {
				this.isFirstPlay = false
				uni.$emit('onPause')
			})
		} else {
			console.log('触发暂停', this.isFirstPlay)
			this.nativePlayer.showMusicWithEven({playType: 1}, (res) => {
				this.isFirstPlay = false
				this.IOSMapEvent(res)
			})
		}
	}
	/**
	 * 停止播放
	 */
	stop() {
		// this.innerAudioContext.stop()
		if(this.platform === 'Android') {
			this.nativePlayer.stop(res => {
				console.log('停止播放音频', res)
				this.isFirstPlay = true
				this.isAgain = true
				uni.$emit('onStop')
			})
		} else {
			this.nativePlayer.showMusicWithEven({playType: 3}, (res) => {
				this.isFirstPlay = false
				this.isAgain = true
				this.IOSMapEvent(res)
			})
		}
	}
	/**
	 * 跳转播放
	 */
	seek(position) {
		if (position <= this.getDuration()) {
			// this.innerAudioContext.seek(position)
			if(this.platform === 'Android') {
				if (position === 0) {
					position = 0.001
				}
				position = position * 1000
				this.nativePlayer.seek(position, res => {
					console.log('播放音频', res)
					this.isFirstPlay = false
					uni.$emit('onSeeked')
				})
			} else {
				position = position / (this.duration / 1000)
				position = Math.round(position * 100) / 100
				if (position === 0) {
					position = 0.001
				}
				this.nativePlayer.showMusicWithEven({playType: 5, seekPosition: position}, (res) => {
					// uni.showToast({
					// 	title: '----------' + position,
					// 	icon: 'none'
					// })
					this.isFirstPlay = false
					this.IOSMapEvent(res)
					console.log('IOS跳转播放', res)
				})
			}
		}
	}
	/**
	 * 销毁当前实例
	 */
	// destroy() {
	// 	if (this.innerAudioContext) {
	// 		this.innerAudioContext.destroy()
	// 	}
	// }
	/**
	 * 音乐进入可播放状态触发该方法
	 */
	onCanplay(callback) {
		uni.$on('onCanplay', () => {
			this.isFirstPlay = true
			this.canPlay = true
			this.isToPlay = true
			this.playReady(this.allowPlay, this.currSongInfo)
			if(!this.allowPlay) {
				this.isAudition = false
				this.musicAudition()
			}
			if(this.platform === "Android") {
				this.play()
			}
		})
	}
    onCanplayTemp(callback) {
        uni.$on('onCanplayTemp', () => {
            if (typeof callback === 'function') {
                callback()
            }
        })
    }
	/**
	 * 音乐播放触发该方法*/
	onPlay(callbackDur, callbackTime) {
		uni.$on('onPlay', () => {
			if(this.platform === "Android") {
				this.nativePlayer.updateNotification(1);
				if(this.isFirstToPlay) {
					this.initStatusBar()
					this.isFirstToPlay = false
				}
			}
			
			clearTimeout(this.timeOut)
			// console.log('音乐开始播放native', this.getPaused())
			clearInterval(this.inter)
			this.paused = false
			
			if(!this.allowPlay) {
				this.musicAudition()
			}
			
			if (typeof callbackDur === 'function') {
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
	 * 音乐播放暂停触发该方法*/
	onPause(callBack) {
		uni.$on('onPause', () => {
			if (this.platform === "Android") {
				this.nativePlayer.updateNotification(2);
			}
			clearInterval(this.inter)
			this.paused = true
			clearTimeout(this.interPlay)
			
			clearInterval(this.interAudition)
			this.interAudition = null
			
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
		uni.$on('onStop', () => {
			if (this.platform === "Android") {
				this.nativePlayer.updateNotification(2);
			}
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
		uni.$on('onEnded', () => {
			console.log('音乐自然播放结束', this.playList.length)
			if (typeof callback === 'function') {
				callback()
			}
		})
	}
	/**
	 * 音乐进度条改变触发该方法*/
	onTimeUpdate(callback) {
		uni.$on('onTimeUpdate', () => {
			if (typeof callback === 'function') {
				callback(this.currentTime)
			}
		})
	}
	/**
	 * 音乐播发错误触发该方法*/
	onError(callback) {
		uni.$on('onError', () => {
			if (typeof callback === 'function') {
				console.log('播放失败', err, this.getSrc())
				callback()
			}
		})
	}
	/**
	 * 音乐进入加载中触发该方法*/
	// onWaiting(callback) {
	// 	this.innerAudioContext.onWaiting(() => {
	// 		console.log('加载中')
	// 		uni.showLoading({
	// 			title: '歌曲加载中'
	// 		})
	// 		if (typeof callback === 'function') {
	// 			callback()
	// 		}
	// 	})
	// }
	/**
	 * 音乐进入进行seek操作触发该方法*/
	// onSeeking(callback) {
	// 	// this.closeListener('seeking')
	// 	this.innerAudioContext.onSeeking(() => {
	// 		if (this.getCurrentTime() < 1 && this.getCurrentTime() > 0) {
	// 			this.timeline = 0
	// 		} else {
	// 			this.timeline = Math.ceil(this.getCurrentTime())
	// 		}
	// 		this.innerAudioContext.pause()
	// 		setTimeout(() => {
	// 			this.innerAudioContext.play()
	// 		}, 5)
	// 		console.log('进行seek操作', this.timeline)
	// 		if (typeof callback === 'function') {
	// 			callback()
	// 		}
	// 	})
	// }
	/**
	 * 音乐完成seek操作触发该方法，没有触发过 o(≧口≦)o*/
	onSeeked(callback) {
		uni.$on('onSeeked', () => {
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
				// this.innerAudioContext.offCanplay()
				break;
			case 'play':
				// this.innerAudioContext.offPlay()
				break;
			case 'pause':
				// this.innerAudioContext.offPause()
				break;
			case 'stop':
				this.innerAudioContext.offStop()
				break;
			case 'ended':
				this.innerAudioContext.offEnded()
				break;
			case 'timeupdate':
				this.innerAudioContext.offTimeUpdate()
				break;
			case 'error':
				this.innerAudioContext.offError()
				break;
			case 'waiting':
				this.innerAudioContext.offWaiting()
				break;
			case 'seeking':
				this.innerAudioContext.offSeeking()
				break;
			case 'seeked':
				this.innerAudioContext.offSeeked()
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
	// 重新获取歌曲信息，避免链接过期无法播放
	getMusicSrc(songInfo, callBack) {
		if(!this.getExpiredTime(songInfo.src)) {
			api.querySongDetails({
				id: songInfo.id
			}).then(res => {
				if(res.code === 200) {
					if(typeof callBack === 'function') {
						callBack(this.chooseMusicQue(res.data).src, res.data)
					}
				}
			}).catch(err => {
				console.log(err)
			})
		} else {
			if(typeof callBack === 'function') {
				callBack(songInfo.src, songInfo)
			}
		}
	}
	// IOS端匹配事件
	IOSMapEvent(eventType) {
		console.log('IOS播放音乐回调' + eventType)
		switch (eventType){
			case 0:
				break;
			case 1:
				uni.$emit('onPause')
				break;
			case 2:
				uni.$emit('onPlay')
				break;
			case 3:
				uni.$emit('onEnded')
				break;
			case 4:
				uni.$emit('onPlay')
				break;
			case 5:
				uni.$emit('onSeeked')
				break;
			case 6:
				uni.$emit('onPlay')
				break;
			case 7:
				uni.$emit('onError')
				break;
			case 8:
				this.nextSong()
				break;
			case 9:
				this.lastSong()
				break;
			case 10:
				this.pause()
				break;
			default:
				break;
		}
	}
	/**
	 * 获取歌曲的过期时间 */
	getExpiredTime(str) {
		let authKeyStr = str.substr(str.indexOf(this.expiredTimeSegStart) + this.expiredTimeSegStart.length)
		let time = authKeyStr.substring(0, authKeyStr.indexOf(this.expiredTimeSegEnd))
		let nowTime = new Date().getTime() / 1000
		if(parseInt(time) - nowTime > 0) {
			return true
		} else {
			return false
		}
	}
}
