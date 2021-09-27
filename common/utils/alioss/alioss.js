const Base64 = require('./base64.js');
const Crypto = require('./crypto.js');
const url = require('@/common/utils/request.js');

const aliOSS = {
  accessKeyID: '',
  accessKeySecret: '',
  host: 'https://music-app-pic.oss-cn-shenzhen.aliyuncs.com',
  securityToken: '',
  expiration: '',
  timeout: 87600,
}
const token = (uni.getStorageSync('url') === url.appUrl) ? uni.getStorageSync('token') : uni.getStorageSync('xf-token')
// const OSSparams = {
// 	accessKeyID: '',
// 	accessKeySecret: '',
// 	securityToken: '',
// 	expiration:'',
// }

const bucket =  {
    pic: 'music-app-pic',
    music: 'music-app-media-in',
    video: 'music-app-video-in'
}

// const serverUrl = 'https://app.huayingmusic.com/api/v1/upload/ossToken' // 请求Policy参数的接口
const serverUrl = uni.getStorageSync('url') + '/upload/ossToken' // 请求Policy参数的接口


function send_request() {
	return new Promise((resolve, reject) => {
		uni.request({
			url: serverUrl,
			data: null,
			method: 'POST',
			header:{
				token: token
			},
			success: (res) => {
				if(res.statusCode === 200) {
					aliOSS.accessKeyID = res.data.data.AccessKeyID
					aliOSS.accessKeySecret = res.data.data.AccessKeySecret
					aliOSS.securityToken = res.data.data.SecurityToken
					aliOSS.expiration = res.data.data.Expiration
					resolve(res.data)
				}
			},
			fail: (err) => {
				console.log('请求Policy参数失败：' + err)
				console.log(err)
			},
			complete: (data) => {}
		})
	})
}

// 上传文件命名规则
function getTime() {
    var timeTemp = new Date();
    var year = timeTemp.getFullYear();
    var month = timeTemp.getMonth() + 1;
    var day = timeTemp.getDate();

    var clock = "M" + year.toString().substring(2, 4) + "/";
    if (month < 10) clock += '0'
    clock += month + '/'
    if (day < 10) clock += '0'
    clock += day + '/'
    return (clock)
}

function uploadFile_Multiple(files, callback) {
	return new Promise((resolve, reject) => {
		if(!files.length > 0) {
			reject({
				status: false,
				err: '上传文件为空'
			})
			return
		}
		
		let promiseArr = []
		let uploadTaskObj = {}
		
		for(let i = 0, len = files.length; i < len; i++) {
			let one = uploadFile(files[i].filePath, (uploadTask) => {
				uploadTaskObj[files[i].fileName] = uploadTask
			})
			promiseArr.push(one)
		}
		
		Promise.all(promiseArr).then((resultArr) => {
			let urlArr = []
			for(let i = 0, len = resultArr.length; i < len; i++) {
				urlArr.push(resultArr[i].data.url)
			}
			resolve({
				status: true,
				data: {
					urlArr,
				},
				msg: '文件全部上传完成'
			})
		}).catch((err) => {
			console.log(err)
			reject({
				status: true,
				err: '文件上传失败'
			})
		})
		
		if(typeof callback === 'function') {
			callback(uploadTaskObj)
		}
	})
}

function uploadFile(filePath, callback) {
  return new Promise(function (resolve, reject) {
    if (!filePath) {
      reject({
        status: false,
        err:'文件错误',
      });
      return;
    }
    //文件后缀
    let dotIndex = filePath.lastIndexOf('.') + 1;
    let filePathLength = filePath.length;
    let suffix = filePath.substring(dotIndex, filePathLength);
    const aliyunFileKey = getTime() + (new Date().getTime()) + '.' + suffix;
    const aliyunServerURL = aliOSS.host;
    const accessid = aliOSS.accessKeyID;
    const policyBase64 = Base64.encode(JSON.stringify({
      "expiration": aliOSS.expiration,
      "conditions": [
        ["content-length-range", 0, 1024 * 1024 * 10 * 10 * 10]// 1048576000字节 = 1000m
      ]
    }));
    let bytes = Crypto.util.HMAC(Crypto.util.SHA1, policyBase64, aliOSS.accessKeySecret, { asBytes: true });
    const signature = Crypto.util.bytesToBase64(bytes);
    const uploadTask = uni.uploadFile({
      url: aliyunServerURL,
      filePath: filePath,
      name: 'file',
      formData: {
        'key': aliyunFileKey,
        'OSSAccessKeyId': aliOSS.accessKeyID,
        'policy': policyBase64,
        'Signature': signature,
		'x-oss-security-token':aliOSS.securityToken,
        'success_action_status': '200',
      },
	  header:{
		  
	  },
      success: function (res) {
        if (res.errMsg === 'uploadFile:ok') {
          // let url = aliyunServerURL + '/' + aliyunFileKey; //这是全地址
          let url = aliyunFileKey;//不要传全地址了
          resolve({
            status: true,
            data:{
              url,
            },
            err: '',
          });
        }
      },
      fail: function (err) {
        reject({
          status: false,
          err,
        });
      },
    })
	
	let uploadTaskObj = {
		progress: 0,
		totalBytesSent: 0,
		totalBytesExpectedToSend: 0,
	}
	uploadTask.onProgressUpdate((res) => {
		uploadTaskObj.progress = res.progress
		uploadTaskObj.totalBytesSent = res.totalBytesSent
		uploadTaskObj.totalBytesExpectedToSend = res.totalBytesExpectedToSend
	})
	if(typeof callback === 'function') {
		callback(uploadTaskObj)
	}
	
  });
}

export function init_uploadFile(file, callback=null,loadingVisible=false) {
	console.log(file,"laile ")
	if(loadingVisible){
		uni.showLoading({
			title: '正在上传'
		})
	}
	return new Promise((resolve, reject) => {
		send_request().then(() => {
			if(typeof file === 'string') {
				uploadFile(file, callback).then((res) => {
					resolve(res)
					uni.hideLoading();
				}).catch((err) => {
					reject(err)
				})
			} else {
				uploadFile_Multiple(file, callback).then((res) => {
					resolve(res)
				}).catch((err) => {
					reject(err)
				})
			}
		}).catch(err => {
			uni.hideLoading();
		})
	})
}