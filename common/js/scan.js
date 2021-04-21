function getCodeContent() {
	return new Promise((resolve, reject) => {
		let r = null;
		uni.scanCode({
			success: function (res) {
				// console.log('条码类型：' + res.scanType);
				// console.log('条码内容：' + res.result);
				resolve(res)
				// r.push(res.result);
			},
			fail:function(res){
				// console.log('条码类型：' + res.scanType);
				// console.log('条码内容：' + res.result);
				reject(res)
			}
		});
	})
}


module.exports = {
	getCodeContent
}