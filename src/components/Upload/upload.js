// import OSS from 'ali-oss'
import request from '@/utils/request'

let gObjectName = ''
let picBucketType = 'music-app-pic'
let videoBucketType = 'music-app-video-in'
let mediaBucketType = 'music-app-media-in'

// 请求后端返回ossToken
function getOssData () {
  return request({
    url: '/upload/ossToken',
    method: 'post'
  })
}

function clockRule () {
  let timeTemp = new Date()
  let year = timeTemp.getFullYear()
  let month = timeTemp.getMonth() + 1
  let day = timeTemp.getDate()
  let clock = 'M' + year.toString().substring(2, 4) + '/'
  if (month < 10) clock += '0'
  clock += month + '/'
  if (day < 10) clock += '0'
  clock += day + '/'
  return (clock)
}

// 随机命名
function randomString (len) {
  len = len || 32
  let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  let maxPos = chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

function getSuffix (filename) {
  let pos = filename.lastIndexOf('.')
  let suffix = ''
  if (pos !== -1) {
    suffix = filename.substring(pos)
  }
  return suffix
}

function getBucketType (type) {
  let temp = ''
  switch (type) {
    case 'image':
      temp = picBucketType
      break
    case 'video':
      temp = videoBucketType
      break
    case 'media':
      temp = mediaBucketType
      break
  }
  return temp
}

function calculateObjectName (filename) {
  let suffix = getSuffix(filename)
  gObjectName = randomString(10) + suffix
  return gObjectName
}

export function upLoad (file, type, callback) {
  getOssData().then(res => {
    const filename = calculateObjectName(file.name)
    const filePath = clockRule() + filename
    const bucketType = getBucketType(type)
    console.log('filePath', filePath, filename, bucketType)
    // eslint-disable-next-line
    const client = new OSS({
      region: 'oss-cn-shenzhen',
      accessKeyId: res.data.AccessKeyID,
      accessKeySecret: res.data.AccessKeySecret,
      stsToken: res.data.SecurityToken,
      bucket: bucketType,
      secure: true
    })
    client.multipartUpload(filePath, file, {
      progress: (p) => { // 获取进度条的值
        if (typeof callback === 'function') {
          let res = p * 100
          callback(res)
        }
      }
    }).then((res) => {
      // console.log('res总数据', res)
      const returnData = {
        url: res.res.requestUrls[0],
        name: res.name
      }
      // 上传成功结果
      if (typeof callback === 'function') {
        const str = res.res.requestUrls
        // 图片过大会出现upload，需要进行切割
        if (str.toString().includes('?')) {
          const data = str.toString().split('?')
          returnData.url = data[0]
        }
        callback(returnData)
      }
    }).catch((err) => {
      console.log('err', err)
    })
  })
}
