import store from '@/store'
! function(root, factory) {
	if (typeof exports == 'object' && typeof module != 'undefined') {
		module.exports = factory()
	} else if (typeof define == 'function' && define.amd) {
		define(factory)
	} else {
		// 5+ 兼容  
		document.addEventListener('plusready', function() {
			// 修改此处为插件命名  
			var moduleName = 'HuaYin_MusicController';
			// 挂载在plus下  
			root.plus[moduleName] = factory()
		}, false);
	}
}(this, function() {
	let connectionHeadset = false // 是否连接了耳机
	//在此处定义自己的方法  
	const notice = uni.requireNativePlugin('HuaYin_MusicController');
	var ist = false;
	var _BARCODE = 'HuaYin_MusicController';
	var plugintest = {
		initService: function() {
			notice.initService();
		},
		show: function(fu) {
			var _this = this;
			//data: 歌曲的所有信息
			if (!ist) {
				console.log("开始注册")
				var main = plus.android.runtimeMainActivity();
				var context = plus.android.importClass('android.content.Context');
				var bluetooth=plus.android.importClass('android.bluetooth.BluetoothDevice');
				var receiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver', {
					onReceive: getReceive
				});
				var IntentFilter = plus.android.importClass('android.content.IntentFilter');
				var Intent = plus.android.importClass('android.content.Intent');
				//暂停
				var filter01 = new IntentFilter();
				filter01.addAction("com.example.notification.ServiceReceiver.pause");
				main.registerReceiver(receiver, filter01);
				//播放
				var filter02 = new IntentFilter();
				filter02.addAction("com.example.notification.ServiceReceiver.play");
				main.registerReceiver(receiver, filter02);
				var filter03 = new IntentFilter();
				//上一首
				filter03.addAction("com.example.notification.ServiceReceiver.last");
				main.registerReceiver(receiver, filter03);
				var filter04 = new IntentFilter();
				//下一首
				filter04.addAction("com.example.notification.ServiceReceiver.next");
				main.registerReceiver(receiver, filter04);
				var filter05 = new IntentFilter();
				//单击进入主程序
				filter05.addAction("notification-open");
				main.registerReceiver(receiver, filter05);

				var filter06 = new IntentFilter();
				filter06.addAction("android.intent.action.HEADSET_PLUG");
				main.registerReceiver(receiver, filter06);
				//蓝牙状态监听
				var filter07 = new IntentFilter();
				filter07.addAction("android.bluetooth.adapter.action.STATE_CHANGED");
				main.registerReceiver(receiver, filter07);

				var filter08 = new IntentFilter();
				filter08.addAction("android.bluetooth.device.action.ACL_CONNECTED");
				main.registerReceiver(receiver, filter08);

				var filter09 = new IntentFilter();
				filter09.addAction("android.bluetooth.device.action.ACL_DISCONNECTED");
				main.registerReceiver(receiver, filter09);

				var json = {};
				var isConnected = false;

				function getReceive(context, intent) {
					//可以将action封装到json中
					var action = intent.getAction();
					//可以将action封装到json中
					console.log("广播回调");
					if (intent.hasExtra("state")) {
						if (intent.getIntExtra("state", 0) == 0) {
							if(connectionHeadset) {
								this.nativePlayer.pause(res => {
									this.isFirstPlay = false
									uni.$emit('onPause')
								})
								connectionHeadset = false
							}
						} else if (intent.getIntExtra("state", 0) == 1) {
							connectionHeadset = true
						}
					}
					if (action === "android.bluetooth.device.action.ACL_CONNECTED") {
						isConnected = true;
						const device = intent.getParcelableExtra("android.bluetooth.device.extra.DEVICE");
						// var name = device.getName();
						if(connectionHeadset) {
							this.nativePlayer.pause(res => {
								this.isFirstPlay = false
								uni.$emit('onPause')
							})
							connectionHeadset = false
						}
						//连接上了
					} else if (action==="android.bluetooth.device.action.ACL_DISCONNECTED") {
						//蓝牙连接被切断
						bluetooth = intent.getParcelableExtra("android.bluetooth.device.extra.DEVICE");
						var name = bluetooth.getName();
						isConnected = false;
						connectionHeadset = true
						return;
					}
					json.action = action;
					fu(json);
				}
				ist = true;
				console.log("注册完毕")
			}
		},
		//更新状态栏
		updateNotification: function(status) {
			notice.updateNoti(status);
		},
		/*设置播放源
		data {
			src: 
			title: 
			singerName: 
			backgroundImg: 
		}
		*/
		setSrc: function(data, callback) {
			notice.setSrc(data, (status) => {
				if(typeof callback === 'function') {
					callback(status)
				}
			})
		},
		//播放
		play: function(callback) {
			notice.play11((status) => {
				if(typeof callback === 'function') {
					callback(status)
				}
			});
		},
		//暂停
		pause: function(callback) {
			notice.pause11((status) => {
				if(typeof callback === 'function') {
					callback(status)
				}
			});
		},
		//继续播放
		playContinue: function(callback) {
			notice.playContinue((status) => {
				if(typeof callback === 'function') {
					callback(status)
				}
			});
		},
		seek:function(data, callback) {
			notice.seek(data, (res) => {
				if(typeof callback === 'function') {
					callback(res)
				}
			});
		},
		stop: (callback) => {
			notice.stop(res=>{
				if(typeof callback === 'function') {
					callback(res)
				}
			});
		},
	};
	return plugintest;
});
