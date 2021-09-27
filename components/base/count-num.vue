<template>
	<view class="count-num" @click="$emit('click')">
		<text :class="{ disabled: disabled || Number(count) <= Number(min) }" class="iconfont cn-min" @click="countNum(0)">&#xe643;</text>
		<!-- <text class="cn-count">{{ count || 0 }}</text> -->
		<input type="digit" :disabled="disabled" :class="{disabled}" class="cn-count" v-model="count" @blur="onInput" @focus="onFocus" />
		<text :class="{ disabled: disabled || Number(count) >= Number(max) }" class="iconfont cn-add" @click="countNum(1)">&#xe611;</text>
	</view>
</template>

<script>
	export default {
		props: {
			value: {
				type: [Number, String],
				default: 0
			},
			max: {
				type: [Number, String],
				default: 999
			},
			min: {
				type: [Number, String],
				default: 0
			},
			disabled: {
				type: Boolean,
				default: false
			},
      opType: {
         type: String,
         default: ''
      },
      comeFrom: {
         type:String,
         default:''
      }
		},
		data() {
			return {
				count: 1,
				isErrorNumber: false,
        optType:0
			}
		},
		watch: {
			value(v) {
				this.count = v
        console.log('count=',this.count)
			}
		},
		mounted() {
			this.count = this.value
		},
		methods: {
			onFocus() {
				this.isFocus = true
			},
			onInput({ detail }) {
				const max = Number(this.max)
				const count = Number(this.count)
				const min = Number(this.min)
				if (!this.isFocus) {
					return
				}
				this.isFocus = false
				if (count < min) {
					this.count = min
					return this.$toast('超出最小数值')
				}
				if (count > max) {
					this.count = max
					return this.$toast('超出最大数值')
				}
				this.emit()
			},
			countNum(type) {
        this.optType = type
				const max = Number(this.max)
				const count = Number(this.count)
				const min = Number(this.min)
				if (this.disabled) {
					this.emit()
					return
				}
				if (type) {
					if (count >= max) {
						return
					}
					this.count ++
					this.emit()
				} else {
					if (count <= min) {
						return
					}
					this.count --
					this.emit()
				}
			},
			emit() {
        if(this.opType === 'KXJCLX06') {
          if(this.comeFrom === '0') {
             this.$emit('input',this.count,this.optType)
          }
          if(this.comeFrom === '1') {
             this.$emit('onInput',this.count,this.optType)
          }

        } else {
          console.log('eeee')
          this.$emit('input', this.count)
        }

			}
		}
	}
</script>

<style scoped lang="scss">
	.count-num {
		display: flex;
		border: 1px solid #dddddd;
		border-radius: 6rpx;
		align-items: center;
		overflow: hidden;
		.iconfont {
			text-align: center;
			font-size: 26rpx;
			color: #999999;
			display: block;
			width: 52rpx;
			height: 52rpx;
			line-height: 52rpx;
			background: #dddddd;
			&:active {
				background: #cccccc;
			}
			&.disabled {
				color: #dddddd;
				background: #f5f5f5;
				&:active {
					background: #f5f5f5;
				}
			}
		}
		.cn-min {
			border-top-left-radius: 6rpx;
			border-bottom-left-radius: 6rpx;
		}
		.cn-add {
			border-top-right-radius: 6rpx;
			border-bottom-right-radius: 6rpx;
		}
		.cn-count {
			text-align: center;
			width: 80rpx;
			font-size: 28rpx;
			height: 52rpx;
			&.disabled {
				color: #cccccc;
				background: $app-bg;
			}
		}
	}
</style>
