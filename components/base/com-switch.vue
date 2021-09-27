<template>
	<view class="lmy-switch">
		<text v-if="label" :style="{ color }" class="ls-label">{{ label }}</text>
		<view :style="{ 'background-color': checked ? activeColor : inactiveColor }" class="ls-parent" @click="onSwitchClick">
			<view :class="{ active: checked }" class="ls-pointer"></view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			/**
			 * @param { String }  label 提示文字
			 */
			label: {
				type: String,
				default: ''
			},
			/**
			 * @param { String }  color 文本颜色
			 */
			color: {
				type: String,
				default: '#666666'
			},
			/**
			 * @param { String }  activeColor 激活的背景色
			 */
			activeColor: {
				type: String,
				default: '#FF152D'
			},
			/**
			 * @param { String }  inactiveColor 未激活的背景色
			 */
			inactiveColor: {
				type: String,
				default: '#dddddd'
			},
			/**
			 * @param { Boolean, Number, String }  value v-model 目前仅支持布尔值
			 */
			value: {
				type: [Boolean, Number, String],
				default: false
			},
			/**
			 * @param { Boolean, Number, String }  inactiveValue 关闭的时候的值，值不是布尔值的时候使用的
			 */
			inactiveValue: {
				type: [Boolean, Number, String],
				default: false
			},
			/**
			 * @param { Boolean, Number, String }  activeValue 打开的时候的值
			 */
			activeValue: {
				type: [Boolean, Number, String],
				default: false
			}
		},
		
		data() {
			return {
				actVal: false,
				checked: false
			}
		},
		mounted() {
			this.setValue(1)
			// console.log(this)
		},
		methods: {
			onSwitchClick() {
				this.setValue(0)
				this.$emit('input', this.actVal)
				this.$emit('change', this.actVal)
				//console.log(this.actVal)
			},
			setValue(flag) {
				const inact = this.hasProps('inactiveValue')
				const act = this.hasProps('activeValue')
				if (inact || act) {
					if (flag) {
						this.checked = this.value === this.activeValue
						this.actVal = this.checked ? this.inactiveValue : this.activeValue
					} else {
						this.checked = this.value !== this.activeValue
						this.actVal = !this.checked ? this.inactiveValue : this.activeValue
					}
				} else {
					this.actVal = flag ? this.value : !this.value
					this.checked = this.actVal
				}
			},
			hasProps(key) {
				return Object.keys(this.$options.propsData).indexOf(key) > -1
			}
		}
	}
</script>

<style scoped lang="scss">
	.lmy-switch {
		display: flex;
		align-items: center;
	}
	.ls-label {
		display: inline-block;
		margin-right: 12rpx;
		color: #666666;
		font-size: 24rpx;
	}
	.ls-parent {
		width: 80rpx;
		height: 40rpx;
		background-color: #dddddd;
		border-radius: 40rpx;
		position: relative;
		display: flex;
		align-items: center;
		transition: all 0.3s;
		.ls-pointer {
			position: absolute;
			width: 25rpx;
			height: 25rpx;
			border-radius: 50%;
			background-color: #FFFFFF;
			top: 0;
			bottom: 0;
			margin: auto;
			left: 10rpx;
			transition: left 0.3s;
			&.active {
				left: 50rpx;
			}
		}
	}
</style>
