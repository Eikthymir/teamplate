export default function pay(orderInfo, type, IOSInfo = {}, callBack) {
	if(plus.os.name === 'iOS') {
		let nativePay = uni.requireNativePlugin('HuaYin_MusicController')
		nativePay.showPayWithGoodID({payType: IOSInfo.payType, goodID: IOSInfo.goodID, order_no: orderInfo}, (res) => {
			if(res.pay) {
				if(typeof callBack === 'function') {
					callBack({code: 1, data: res.pay})
				}
			} else {
				if(typeof callBack === 'function') {
					callBack({code: 0, data: res.pay})
				}
			}
		})
	} else {
		uni.getProvider({
			service: 'payment',
			success: function(res) {
				if (~res.provider.indexOf('alipay')&&type=='alipay') {
					uni.requestPayment({
						provider: 'alipay',
						orderInfo: orderInfo, //微信、支付宝订单数据
						success: function(res) {
							if(typeof callBack === 'function') {
								callBack({code: 1, data: res})
							}
						},
						fail: function(err) {
							console.log('fail:' + JSON.stringify(err));
							if(typeof callBack === 'function') {
								callBack({code: 0, data: err})
							}
						}
					});
				} else if (~res.provider.indexOf('wxpay')&&type=='wxpay') {
					uni.requestPayment({
						provider: 'wxpay',
						orderInfo: {
							"appid": orderInfo.app_id,
							"noncestr": orderInfo.nonce_str,
							"package": orderInfo.package,
							"partnerid": orderInfo.partner_id,
							"prepayid": orderInfo.prepay_id,
							"timestamp": orderInfo.timestamp,
							"sign": orderInfo.sign,
							"signtype": orderInfo.sign_type
						}, //微信、支付宝订单数据
						success: function(res) {
							if(typeof callBack === 'function') {
								callBack({code: 1, data: res})
							}
						},
						fail: function(err) {
							console.log('fail:' + JSON.stringify(err));
							if(typeof callBack === 'function') {
								callBack({code: 0, data: err})
							}
						}
						
					});
				}
			}
		});
	}
}
