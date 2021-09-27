<template>
	<view :class="{'has-height': state===0}" class="loading-box">
		<view v-show="state === 1" class="loading-content">
			<slot></slot>
		</view>
		<view v-if="state !== 1" class="loading-main">
			<view v-if="state===0" :class="{'relative': isRelative}" class="loading-wrap loading5">
				<!-- <image class="loading-img" src="/static/img/load.gif"></image> -->
				<view class="shape shape1"></view>
				<view class="shape shape2"></view>
				<view class="shape shape3"></view>
			</view>
			<view v-if="state === -1 || state === -2" :class="{'relative': isRelative}" class="tip-wrap">
				<view v-if="!$slots.nodata" class="no-slots">
					<view v-if="state === -1" class="error-tip">
						<image class="err-img" src="/static/img/nodata.png"></image>
						<text class="err-txt">{{errMsg || '暂无相关内容'}}</text>
					</view>
				</view>
				<slot v-if="$slots.nodata"  name="nodata"></slot>
				<view v-if="!$slots.error" class="no-slots" :class="{'relative': isRelative}">
					<view v-if="state === -2 || state === ''" class="error-tip" @click="errClick">
						<image class="err-img" src="/static/img/icon_fail.png"></image>
						<text class="err-txt">{{errMsg || requestErrorMsg || '加载失败，请点击重试'}}</text>
					</view>
				</view>
				<slot v-if="$slots.error"  name="error"></slot>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'

	export default {
		props: {
			// status 1请求成功,-1暂无数据,-2，请求失败
			status: {
				type: Number,
				default: 0
			},
			msg: {
				type: String,
				default: ''
			},
			// 是否相对定位
			relative: {
				type: Boolean,
				default: false
			},
			// 请求的接口属性地址
			api: {
				type: String,
				default: ''
			},
			// 请求的额外参数
			condition: {
				type: [String, Object, Number, Array],
				default: ''
			}
		},
		computed: {
			...mapState(['requestErrorMsg']),
		},
		data() {
			return {
				state: 0,
				errMsg: '',
				isRelative: false,
				filter: {}
			}
		},
		watch: {
			status(v) {
				this.state = v
			},
			msg(v) {
				this.errMsg = v
			},
			relative(v) {
				this.isRelative = v
			},
		},
		mounted() {
			this.state = this.status
			this.errMsg = this.msg
			this.isRelative = this.relative
			this.getData()
		},
		methods: {
			errClick() {
				if (this.status === -2) {
					this.$emit('errClick')
				}
			},
			async getData(filter = {}) {
				if (!this.api) {
					return
				}
				try {
          const params = typeof this.condition === 'string' ? this.condition : { ...this.condition, ...filter }
					const apiUrl = this.api.split('.')
					const { data } = await this.$api[apiUrl[0]][apiUrl[1]](params)
					this.$emit('load', data)
					if (data.name === 'Failure') {
						this.state = -2
						this.errMsg = '服务器内部错误哦~'
					} else {
						this.state = 1
					}
          if (data.items && !data.items.length) {
            this.state = -1
          }
				} catch(e) {
					this.state = -2
					console.log(e)
					return Promise.reject()
				}
			},
			init(filter) {
				this.state = 0
				this.getData(filter)
			}
		},
	}
</script>

<style scoped lang="scss">
	.has-height {
		min-height: 200rpx;
	}
	.error-tip {
		position: absolute;
		left: 0;
		right: 0;
		top: 45%;
		margin: auto;
		text-align: center;
		z-index: 1;
		.err-img {
			width: 124rpx;
			height: 124rpx;
			margin: auto;
			margin-bottom: 30rpx;
		}
		.err-txt {
			display: block;
			font-size: 30rpx;
			color: #999;
		}
	}
	.loading-wrap {
		height: 25rpx;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		margin: auto;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1;
		.loading-img {
			width: 100rpx;
			height: 100rpx;
		}
	}
	.static, .relative .error-tip {
		position: static!important;
		margin: 60rpx auto;
	}
	.shape {
	  width: 25rpx;
	  height: 25rpx;
	  border-radius: 50%;
	  background-color: $theme_color;
		margin: 0 6rpx;
	}
	.shape1 {
	  animation: pulse .4s ease 0s infinite alternate;
	}
	.shape2 {
	  animation: pulse .4s ease .2s infinite alternate;
	}
	.shape3 {
	  animation: pulse .4s ease .4s infinite alternate;
	}
	@keyframes pulse {
	  from {
	    opacity: 1;
	    transform: scale(1);
	  }
	  to {
	    opacity: .25;
	    transform: scale(.75);
	  }
	}
</style>
