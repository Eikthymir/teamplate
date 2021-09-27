<template>
	<view :class="{ small: size === 'small', large: size === 'large', normal: size === 'normal' }" class="pop-check">
		<text v-if="!active" class="no iconfont" >&#xe619;</text>
		<text v-else class="theme-text-color yes iconfont">&#xe61b;</text>
		<text v-if="label" class="check-label">{{ label }}</text>
	</view>
</template>

<script>
	export default {
		props: {
			checked: {
				type: Boolean,
				default: false,
			},
			label: {
				type: String,
				default: ''
			},
			// small, normal, large
			size: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				active: false
			}
		},
		mounted() {
			this.active = this.checked
		},
		watch: {
			checked(v) {
				this.active = v
			}
		},
	}
</script>

<style scoped lang="scss">
.pop-check {
		display: flex;
		align-items: center;
		height: 40rpx;
		&.small {
			height: 34rpx;
			.iconfont {
				font-size: 34rpx;
			}
			.check-label {
				font-size: 24rpx;
			}
		}
		&.large {
			height: 60rpx;
			.iconfont {
				font-size: 60rpx;
			}
			.check-label {
				font-size: 32rpx;
			}
		}
		.iconfont {
			display: inline-block;
			font-size: 40rpx;
			&.no {
				color: #cccccc;
			}
		}
		.check-label {
			display: inline-block;
			margin-left: 12rpx;
		}
	}
</style>
