// export const hardWord = {
// 	playerMode:['order', 'singleCycle', 'random'], //// order: 顺序播放，singleCycle: 单曲循环，random: 随机播放
// }
// export const url = '' // 线上地址
// export const vipIcon = {
// 	icon: '/static/user/vipInfo_icon_vip@2x.png'
// }

const hardWord = {
	playerMode:['order', 'singleCycle', 'random'], //// order: 顺序播放，singleCycle: 单曲循环，random: 随机播放
}

const vipIcon = '/static/user/vipInfo_icon_vip@2x.png'

const IOSMoneyList = [{value: 1, type: 1},{value: 6, type: 2},{value: 45, type: 3},{value: 68, type: 4},{value: 118, type: 5},{value: 198, type: 6},{value: 348, type: 7},{value: 648, type: 8}] // ios端充值价格
// 歌单/专辑顶部返回条渐变颜色
const colorStart = '0, 173, 232';
const colorEnd = '83, 211, 255';
/**
 * @description 通过用户类型与用户等级映射对应标识图标
 * @param {number | string} type-用户类型 可选：1-用户，2-歌手，3-平台
 * @param {number | string} vipLevel-数字类型 可选：1-普通用户，2-会员用户
 * @return {Array} list-数字类型 src-图片链接 title-图片alt
 * */
function mapExploreIdentityIcon(type, vipLevel) {
  type = parseInt(type);
  vipLevel = parseInt(vipLevel);
  let list = [];
  switch (type) {
  case 1:
    if (vipLevel === 2) {
      list.push({
        src: '/static/explore/userLogo/vip.png',
        title: '会员'
      });
    }
    break;
  case 2:
    list.push({
      src: '/static/explore/userLogo/singer.png',
      title: '歌手'
    });
    if (vipLevel === 2) {
      list.push({
        src: '/static/explore/userLogo/singer-vip.png',
        title: '会员'
      });
    }
    break;
  case 3:
    list.push({
      src: '/static/explore/userLogo/official.png',
      title: '华莺音乐官方'
    });
    break;
  }
  return list;
}
/**
 * @description 通过用户类型与用户等级映射对应标识类名
 * @param {number | string} type-用户类型 可选：1-用户，2-歌手，3-平台
 * @param {number | string} vipLevel-数字类型 可选：1-普通用户，2-会员用户
 * @return {string} 类名
 * */
function mapExploreIdentityClassName(type, vipLevel) {
  type = parseInt(type);
  vipLevel = parseInt(vipLevel);
  let className = '';
  switch (type) {
  case 1: // 用户
    if (vipLevel === 2) {
      className = 'isLogo_vip';
    } else {
      className = '';
    }
    break;
  case 2: // 歌手
    if (vipLevel === 2) {
      className = 'isLogo_singer_vip';
    } else {
      className = 'isLogo_singer';
    }
    break;
  case 3: // 平台
    className = 'isLogo_official';
    break;
  }
  return className;
}
module.exports = {
	hardWord,
	vipIcon,
	IOSMoneyList,
	colorStart,
	colorEnd,
	mapExploreIdentityIcon,
	mapExploreIdentityClassName
}