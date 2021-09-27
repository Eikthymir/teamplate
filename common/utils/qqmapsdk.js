import QQMapWX from '../static/js/qqmap-wx-jssdk.min.js'
const qqmapsdk = new QQMapWX({
	key: 'G33BZ-CIREF-OT5JJ-NLXEJ-UGDF3-ZUFD4'
})

// api计算距离
const calculateDistance = (item) => {

	if (!item.map_location_x || !item.map_location_x) {
		return 0
	}
	return new Promise((resolve, reject) => {
		qqmapsdk.calculateDistance({
			mode: 'straight',
			to: `${item.map_location_x},${item.map_location_y}`,
			success: (res, data) => {
				const dis = data.distanceResult / 1000
				resolve(typeof dis === 'number' ? dis : 0)
			},
			fail: err => {
				reject(err)
			}
		})
	})
}

// 获取当前位置
const reverseGeocoder = (obj) => {
	return new Promise((resolve, reject) => {
		qqmapsdk.reverseGeocoder({
			location: {
				latitude: obj.latitude,
				longitude: obj.longitude
			},
			success: (res) => {
				resolve(res.result)
			},
			fail: err => {
				reject(err)
			}
		})
	})
}

/*======================================================================
====================不使用腾讯地图接口查询距离============================
=========================================================================*/
//根据经纬度判断距离
const Rad = (d) => {
	return d * Math.PI / 180.0;
}
const getDistance = (lat1, lng1, lat2, lng2) => {
	// lat1用户的纬度
	// lng1用户的经度
	// lat2商家的纬度
	// lng2商家的经度
	const radLat1 = Rad(lat1);
	const radLat2 = Rad(lat2);
	const a = radLat1 - radLat2;
	const b = Rad(lng1) - Rad(lng2);
	let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
	s = s * 6378.137;
	s = Math.round(s * 10000) / 10000;
	s = s.toFixed(2) //保留两位小数
	console.log('经纬度计算的距离:' + s)
	return s
}
/*======================================================================
====================end============================
=========================================================================*/

export {
	calculateDistance,
	reverseGeocoder,
	getDistance
}
