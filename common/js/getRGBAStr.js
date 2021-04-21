/**
 * @描述：获取颜色rgba的值
 * @参数：void
 * @返回值：String rgba颜色的值 */
export class GradientColor {
	colors = [
		'background-color:rgba(255,137,137,1)',
		'background-color:rgba(255,137,156,1)',
		'background-color:rgba(255,137,187,1)',
		'background-color:rgba(255,137,223,1)',
		'background-color:rgba(254,137,255,1)',
		'background-color:rgba(212,137,255,1)',
		'background-color:rgba(179,137,255,1)',
		'background-color:rgba(151,137,255,1)',
		'background-color:rgba(137,156,255,1)',
		'background-color:rgba(137,195,255,1)',
		'background-color:rgba(137,226,255,1)',
		'background-color:rgba(137,251,255,1)',
		'background-color:rgba(137,255,229,1)',
		'background-color:rgba(137,255,187,1)',
		'background-color:rgba(137,255,151,1)',
		'background-color:rgba(167,255,137,1)',
		'background-color:rgba(187,255,137,1)',
		'background-color:rgba(201,255,137,1)',
		'background-color:rgba(220,255,137,1)',
		'background-color:rgba(237,255,137,1)',
		'background-color:rgba(255,237,137,1)',
		'background-color:rgba(255,223,137,1)',
		'background-color:rgba(255,204,137,1)',
		'background-color:rgba(255,181,137,1)',
		'background-color:rgba(255,167,137,1)',
		'background-color:rgba(255,156,137,1)',
		'background-color:rgba(255,137,137,1)',
		
	]
	constructor() {
		this.inter = null
		this.currIndex = 0
		this.rgbaStr = ''
		this.colorsLen = this.colors.length
	}
	startInter(callBack) {
		clearInterval(this.inter)
		this.inter = null
		this.inter = setInterval(() => {
			this.rgbaStr = this.colors[this.currIndex]
			this.currIndex++
			if(this.currIndex >= this.colorsLen + 1) {
				this.currIndex = 0
			}
			if(typeof callBack === 'function') {
				callBack(this.rgbaStr)
			}
		}, 2000)
	}
	stopInter() {
		clearInterval(this.inter)
		this.inter = null
	}
}