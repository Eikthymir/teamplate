<template>
	<view
		class="echarts"
		:id="id"
		:prop="option"
		:sizeChange="sizeChange"
		:change:prop="echarts.update"
		:change:sizeChange="echarts.resize"
		@click="echarts.click">
	</view>
</template>

<script>
	export default {
		name: 'Echarts',
		props: {
			option: {
				type: Object,
				default: () => null,
				required: true,
			},
			id: {
				type: String,
				required: true,
			},
			sizeChange: {
				type: Boolean,
				default: false,
			},
		},
		created() {
		},
		methods: {
			/**
			 *  renderjs内的点击事件，回调到父组件
			 * @param {Object} params
			 */
			onViewClick(params) {
				this.$emit('click', params)
			},
		}
	}
</script>

<script module="echarts" lang="renderjs">
	export default {
		data() {
			return {
				chart: null,
				clickData: null, // echarts点击事件的值
        isRender: false
			}
		},
		mounted() {
			if (typeof window.echarts === 'object') {
				this.init()
			} else {
				// 动态引入类库
				const script = document.createElement('script')
				script.src = './static/js/echarts.5.0.common.min.js'
				script.onload = this.init
				document.head.appendChild(script)
			}
		},
		methods: {
			/**
			 * 初始化echarts
			 */
			init() {
				// 根据id初始化图表
				this.chart = echarts.init(document.getElementById(this.id))
				this.update(this.option, this.id)
				// echarts的点击事件
				this.chart.on('click', params => {
					// 把点击事件的数据缓存下来
					this.clickData = params
				})
			},
			/**
			 * 点击事件，可传递到外部
			 * @param {Object} event
			 * @param {Object} instance
			 */
			click(event, instance) {
				if (this.clickData) {
					// 把echarts点击事件相关的值传递到renderjs外
					instance.callMethod('onViewClick', {
						value: this.clickData.data,
						name: this.clickData.name,
						seriesName: this.clickData.seriesName
					})
					// 上次点击数据置空
					this.clickData = null
				}
			},
			clear() {
				this.chart.clear()
			},
			resize() {
				console.log('图表大小改变')
				this.chart.resize()
			},
			/**
			 * 监测数据更新
			 * @param {Object} option
			 */
			update(option, id) {
        this.isRender = false
				if (this.chart) {
					// 因App端，回调函数无法从renderjs外传递，故在此自定义设置相关回调函数
					if (option) {
						// tooltip
						if (option.tooltip) {
							// 判断是否设置tooltip的位置
							if (option.tooltip.positionStatus) {
								option.tooltip.position = this.tooltipPosition()
							}
							// 判断是否格式化tooltip
							if (option.tooltip.formatterStatus) {
								option.tooltip.formatter = this.tooltipFormatter(option.tooltip.formatterUnit, option.tooltip.formatFloat2, option.tooltip.formatThousands)
							}
              // 格式化Y轴刻度，要用isRender这个控制，不然就是无限循环了，但是只能用于第一次渲染
              if (!this.isRender && option.yAxis) {
                option.yAxis.axisLabel.formatter = (value) => {
                  console.log('format success')
                  if (value / 10000 >= 1) {
                    return value / 10000 + " 万";
                  } else if (value / 1000 >= 1) {
                    return value / 1000 + " 千";
                  } else if (value / 100 >= 1) {
                    return value / 100 + " 百";
                  } else {
                    return value;
                  }
                }
              }
              this.isRender = true
						}
						// 颜色渐变
						if (option.series) {
							for (let i in option.series) {
								let linearGradient = option.series[i].linearGradient
								if (linearGradient) {
									option.series[i].color = new echarts.graphic.LinearGradient(linearGradient[0],linearGradient[1],linearGradient[2],linearGradient[3],linearGradient[4])
								}
							}
						}
					}
					// console.log('echarts updated', this.id)

					// 设置新的option
					this.chart.setOption(option, true)
				}
			},
			/**
			 * 设置tooltip的位置，防止超出画布
			 */
			tooltipPosition() {
				return (point, params, dom, rect, size) => {
					// 其中point为当前鼠标的位置，size中有两个属性：viewSize和contentSize，分别为外层div和tooltip提示框的大小
					let x = point[0]
					let y = point[1]
					let viewWidth = size.viewSize[0]
					let viewHeight = size.viewSize[1]
					let boxWidth = size.contentSize[0]
					let boxHeight = size.contentSize[1]
					let posX = 0 // x坐标位置
					let posY = 0 // y坐标位置
					if (x >= boxWidth) { // 左边放的下
						posX = x - boxWidth - 1
					}
					if (y >= boxHeight) { // 上边放的下
						posY = y - boxHeight - 1
					}
					return [posX, posY]
				}
			},
			/**
			 * tooltip格式化
			 * @param {Object} unit 数值后的单位
			 * @param {Object} formatFloat2 是否保留两位小数
			 * @param {Object} formatThousands 是否添加千分位
			 */
			tooltipFormatter(unit, formatFloat2, formatThousands) {
				return params => {
					let result = ''
					unit = unit ? unit : ''
					for (let i in params) {
						if (i == 0) {
							result += params[i].axisValueLabel
						}
						let value = '--'
						if (params[i].data !== null) {
							value = params[i].data
							// 保留两位小数
							if (formatFloat2) {
								value = this.formatFloat2(value)
							}
							// 添加千分位
							if (formatThousands) {
								value = this.formatThousands(value)
							}
						}
						// #ifdef H5
						result += '\n' + params[i].seriesName + '：' + value + ' ' + unit
						// #endif

						// #ifdef APP-PLUS
						result += '<br/>' + params[i].marker + params[i].seriesName + '：' + value + ' ' + unit
						// #endif
					}
					return result
				}
			},
			/**
			 * 保留两位小数
			 * @param {Object} value
			 */
			formatFloat2(value) {
				let temp = Math.round(parseFloat(value) * 100) / 100
				let xsd = temp.toString().split('.')
				if (xsd.length === 1) {
					temp = (isNaN(temp) ? '0' : temp.toString()) + '.00'
					return temp
				}
				if (xsd.length > 1) {
					if (xsd[1].length < 2) {
						temp = temp.toString() + '0'
					}
					return temp
				}
			},
			/**
			 * 添加千分位
			 * @param {Object} value
			 */
			formatThousands(value) {
				if (value === undefined || value === null) {
					value = ''
				}
				if (!isNaN(value)) {
					value = value + ''
				}
				let re = /\d{1,3}(?=(\d{3})+$)/g
				let n1 = value.replace(/^(\d+)((\.\d+)?)$/, function(s, s1, s2) {
					return s1.replace(re, '$&,') + s2
				})
				return n1
			}
		}
	}
</script>

<style lang="scss" scoped>
	.echarts {
		width: 100%;
		height: 100%;
	}
</style>
