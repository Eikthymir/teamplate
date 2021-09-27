/**
 * @description 对播放次数，观看人数进行过滤处理
 */
const countFilter = (count) => {
  count = count ? count : 0
  let newCount;
  let caculCount = (count / 10000).toString().replace(/([0-9]+\.[0-9]{1})[0-9]*/, "$1")
  // 小于1万人
  if (count < 10000) {
  	newCount = count + '人观看'
  }
  // 1万人至9万人
  else if (count >= 10000 && count < 100000) {
  	newCount = caculCount + 'w人观看'
  }
  // 10万人至100万人
  else if (count >= 100000 && count <= 1000000) {
  	if (count % 10000 === 0) newCount = count / 10000 + 'w人观看'
  	else newCount = caculCount + 'w人\r\n观看'
  }
  // 100万人至1亿人
  else if (count > 1000000 && count < 100000000) {
  	if (count % 10000 === 0) newCount = count / 10000 + 'w人\r\n观看'
  	else newCount = caculCount + 'w人\r\n观看'
  }
  else newCount = '超1亿人观看'
  return newCount;
}

/**
 * @description 对课播放次数，观看人数进行过滤处理
 */
const albumCountFilter = (count) => {
  count = count ? count : 0
  let newCount;
  let caculCount = (count / 10000).toString().replace(/([0-9]+\.[0-9]{1})[0-9]*/, "$1")
  // 小于1万人
  if (count < 10000) {
  	newCount = count
  }
  // 1万人至1亿人
  else if (count >= 10000 && count < 100000000) {
  	newCount = caculCount + 'w'
  }
  else newCount = '超1亿人'
  return newCount;
}

/**
 * @description 视频时长处理
 */
const durationFilter = (duration) => {
  if (duration) {
    let min = Math.floor(duration / 60) >= 10 ? Math.floor(duration / 60) : '0' + Math.floor(duration / 60);
    duration -= 60 * min;
    let sec = Math.floor(duration) >= 10 ? Math.floor(duration) : '0' + Math.floor(duration);
    return min + ':' + sec + ' '; // 防止cover-view over-flow:hidden属性
  } else {
    return '00:00 '
  }
}

module.exports = {
  countFilter,
  albumCountFilter,
  durationFilter
}