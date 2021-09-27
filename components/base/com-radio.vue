<template>
	<view :class="{ small: size === 'small', large: size === 'large', normal: size === 'normal' }" class="pop-check">
		<text v-if="!active" class="no iconfont" >&#xe618;</text>
		<text v-else class="theme-text-color yes iconfont">&#xe61a;</text>
		<text v-if="label" :class="{ 'theme-text-color': active }" class="check-label">{{ label }}</text>
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
				default: 'normal'
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
		&.small {
			.iconfont {
				font-size: 34rpx;
			}
			.check-label {
				font-size: 24rpx;
			}
		}
		&.large {
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
