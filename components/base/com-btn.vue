<template>
  <view
		:class="{
			fixed: position === 'fixed',
			slotContent: $slots.content,
			noContent: !$slots.content,
			iphoneX: safeBottom > 0,
			hasPadding,
			hasLeft: $slots.left
		}"
		class="btn-wrap"
		:style="{height}"
	>
		<view v-if="$slots.left" class="btn-left">
			<slot name="left"></slot>
		</view>
		<button
			v-if="!$slots.content"
      :style="{
				width,
				height,
				color,
				background: background,
				'border-radius': radius + 'rpx',
				border
			}"
      :class="{
				small: size === 'small',
				mini: size === 'mini',
				disabled: loading || disabled,
				primary: type === 'primary',
				success: type === 'success',
				info: type === 'info',
				warning: type === 'warning',
				danger: type === 'danger',
				text: type === 'text',
				default: type === 'default',
				plain,
				round,
				reverse,
				circle
			}"
			:disabled="loading || disabled"
      class="btn-main"
			@click.stop="onClick"
		>
			<image v-if="loading && !circle" class="btn-loading" src="/static/img/load.gif"></image>
			<text v-if="icon && icon.indexOf('icon') > -1" :class="icon" class="btn-icon iconfont"></text>
			<text v-if="icon && icon.indexOf('icon') < 0" class="btn-icon iconfont">{{ icon }}</text>
			<slot v-if="!circle"></slot>
    </button>
		<slot v-else name="content"></slot>
	</view>
</template>

<script>
 export default {
   props: {
     // 定位方式 static, fixed
     position: {
       type: String,
       default: 'static'
     },
     width: {
       type: String,
       default: ''
     },
		 height: {
		   type: String,
		   default: ''
		 },
     background: {
       type: String,
       default: ''
     },
     radius: {
       type: String,
       default: '12'
     },
     size: {
       type: String,
       default: 'normal'
     },
		 disabled: {
			 type: Boolean,
			 default: false
		 },
		 color: {
			 type: String,
			 default: '#ffffff'
		 },
		 loading: {
			 type: Boolean,
			 default: false
		 },
		 border: {
		   type: String,
		   default: ''
		 },
		 // 按钮类型 primary, success, info, warning, danger, text，
		 type: {
			 type: String,
			 default: 'primary'
		 },
		 // 朴素按钮
		 plain: {
			 type: Boolean,
			 default: false
		 },
		 // 圆角
		 round: {
			 type: Boolean,
			 default: false
		 },
		 // 圆形
		 circle: {
			 type: Boolean,
			 default: false
		 },
		 // 图标
		 icon: {
			 type: String,
			 default: ''
		 },
		 // 背景色左右调换
		 reverse: {
			 type: Boolean,
			 default: false
		 },
		 // fixed的时候是否有边距
		 hasPadding: {
			 type: Boolean,
			 default: false
		 }
   },
	 computed: {
		hasSlots() {
			return Object.keys(this.$slots).length
		},
		safeBottom() {
			return uni.getSystemInfoSync().safeAreaInsets.bottom
		}
	 },
   methods: {
     onClick() {
       this.$emit('click', true)
     }
   },
 }
</script>

<style scoped lang="scss">
	@mixin linear-gradient($direction, $color1, $color2) {
	  background: linear-gradient(to $direction, $color1, $color2);
	}
	.btn-main {
		font-size: 32rpx;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 12rpx;
		border: none;
		color: #ffffff;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		&:after {
			display: none
		}
		&:active {
			box-shadow: none;
			filter: brightness(0.8);
			opacity: 0.8;
		}
		&.nobg {
			background: none!important;
			&.disabled {
				background: none!important;
			}
		}
		&.small {
			height: 70rpx;
			line-height: 70rpx;
			font-size: 26rpx;
		}
		&.mini {
			height: 50rpx;
			line-height: 50rpx;
			font-size: 22rpx;
		}
		&.round {
			border-radius: 45rpx!important;
			&.small {
				border-radius: 35rpx!important;
			}
			&.mini {
				border-radius: 25rpx!important;
			}
		}
		&.primary {
			$color2: #ff6c76;
			$color3: #ffb2b3;
      $color4: #fef0f0;
			background: $theme_color;
			@include linear-gradient(right, $theme_color, $color2);
			&.reverse {
				@include linear-gradient(left, $theme_color, $color2);
			}
			&.plain {
				border: 1px solid $color3;
				background: $color4;
				color: $color2!important;
			}
		}
		&.success {
			$color1: #27a9ff;
			$color2: #b3d8ff;
			$color3: #ecf5ff;
			background: $color1;
			@include linear-gradient(right, $color1, $color2);
			&.reverse {
				@include linear-gradient(left, $color1, $color2);
			}
			&.plain {
				border: 1px solid $color2;
				background: $color3;
				color: $color1!important;
			}
		}
		&.info {
			$color1: #909399;
			$color2: #d3d4d6;
      $color3: #f4f4f5;
			background: $color1;
			@include linear-gradient(right, $color1, $color2);
			&.reverse {
				@include linear-gradient(left, $color1, $color2);
			}
			&.plain {
				border: 1px solid $color2;
				background: $color3;
				color: $color1!important;
			}
		}
		&.warning {
			$color1: #fc8f00;
      $color2: #f5dab1;
			$color3: #fdf6ec;
			background: $color1;
			@include linear-gradient(right, $color1, $color2);
			&.reverse {
				@include linear-gradient(left, $color1, $color2);
			}
			&.plain {
				border: 1px solid $color2;
				background: $color3;
				color: $color1!important;
			}
		}
		&.danger {
			$color1: #d02f2f;
			$color2: #f39996;
      $color3: #f3d4d2;
			background: $color1;
			@include linear-gradient(right, $color1, $color2);
			&.reverse {
				@include linear-gradient(left, $color1, $color2);
			}
			&.plain {
				border: 1px solid $color2;
				background: $color3;
				color: $color1!important;
			}
		}
		&.default {
			$color1: #ffffff;
			$color2: #cccccc;
      $color3: #999999;
			background: $color1;
			color: #666666!important;
      &.plain {
      	border: 1px solid $color2;
      	background: $color1;
      	color: $color3!important;
      }
		}
		&.circle {
			width: 90rpx!important;
			border-radius: 50%!important;
			padding: 0;
			.btn-icon {
				margin-right: 0;
			}
			&.small {
				width: 70rpx!important;
			}
			&.mini {
				width: 50rpx!important;
			}
		}
		&.text {
			background: none!important;
			width: auto!important;
			color: $theme_color!important;
			height: auto!important;
			line-height: initial!important;
		}
		&.disabled {
			@include linear-gradient(right, #dddddd, #eeeeee);
			cursor: not-allowed;
			color: #bbbbbb!important;
			&:active {
				filter: brightness(1);
				opacity: 1;
			}
		}
		.btn-loading {
			width: 40rpx;
			height: 40rpx;
			display: inline-block;
			margin-right: 12rpx;
		}
		.btn-icon {
			display: inline-block;
			margin-right: 12rpx;
		}
	}
	.btn-wrap {
		background: none;
		&.fixed {
			position: fixed;
			height: 120rpx;
			background: #ffffff;
			z-index: 1;
			left: 0;
			bottom: 0;
			right: 0;
			display: flex;
			align-items: center;
			justify-content: space-between;
			&.hasLeft {
				height: 90rpx;
				.btn-main {
					width: 200rpx;
					margin: 0;
					padding: 0;
				}
				.btn-left {
					flex: 1;
					padding-left: 24rpx;
				}
			}
			.btn-main {
				width: 690rpx;
			}
			&.iphoneX {
				height: 150rpx;
			}
		}
		&.slotContent {
			&.fixed {
				height:auto;
				.btn-wrap {
					width: auto;
					flex: 1;
				}
				.btn-main {
					width: auto;
				}
			}
		}
		&.hasPadding {
			&.fixed {
				height: 120rpx;
				.btn-wrap {
					margin: 0 24rpx;
				}
			}
		}
	}
</style>
