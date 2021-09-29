<template>
  <view v-if="showHead" class="top-bar">
		<!--space为true时可以把页面内容顶下来-->
		<view v-if="space" class="space">
			<view class="status-height"></view>
			<view class="nav-height"></view>
		</view>
		<!--头部-->
		<view class="tb-main">
			<view class="tb-bg" :style="{opacity: scrollTop, background }" ></view>
			<!--电量条高度-->
			<view class="status-height"></view>
			<view class="top-nav">
				<view class="tn-left" :style="{color}">
					<text v-if="back && !$slots.left" class="iconfont" @click="goBack">&#xe60c;</text>
					<slot v-if="$slots.left" name="left"></slot>
				</view>
				<view class="tn-title" :style="{ color, 'padding-left': $slots.right ? '25px' : 0 }">
					<text v-if="title && !$slots.center">{{ title }}</text>
					<slot v-if="$slots.center" name="center" ></slot>
				</view>
				<view class="tn-right" :style="{ color }">
					<text v-if="right && !$slots.right" @click="onRightClick">{{ right }}</text>
					<slot v-if="$slots.right" name="right"></slot>
				</view>
			</view>
		</view>
		<!--电量条背景-->
	</view>
</template>

<script>
export default {
  props: {
    pageType: {
      type: Number,
      default: 2,
    },
		scrollTop: {
			type: Number,
			default: 1
		},
		title: {
			type: String,
			default: ''
		},
		background: {
			type: String,
			default: 'linear-gradient(to right, #FF152D, #ff6c76)'
		},
		back: {
			type: Boolean,
			default: true
		},
		// 是否把导航部分的间距顶下来
		space: {
			type: Boolean,
			default: true
		},
		color: {
			type: String,
			default: '#ffffff'
		},
		right: {
			type: String,
			default: ''
		},
		// 是否只在网页显示
		onlyH5: {
			default: false
		}
  },
  data() {
    return {
			sLoad: false,
			isLogin: false,
			messageNum: 0,
    };
  },
	computed: {
		showHead() {
			return this.onlyH5 ? this.$isH5 : true
		}
	},
  methods: {
		goBack() {
			this.$nav.back()
		},
		onRightClick() {
			this.$emit('rightClick')
		}
  },
};
</script>

<style scoped lang="scss">
	$barheight: var(--status-bar-height);
	$navheight: 50px;
	$txtcolor: #333333;
	.tb-main {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		z-index: 10;
		background: none;
		.tb-bg {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 0;
		}
		.top-nav {
			background: none;
			height: $navheight;
			display: flex;
			justify-content: space-between;
			align-items: center;
			position: relative;
			z-index: 1;
		}
		.status-height {
			height: $barheight;
			background: none;
			position: relative;
			z-index: 1;
		}
		.tn-left, .tn-right {
			display: block;
			height: 30px;
			margin-left: 15px;
			text-align: center;
			line-height: 30px;
			color: $txtcolor;
			font-size: 18px;
			z-index: 2;
		}
		.tn-left {
			&:active {
				opacity: 0.8;
			}
		}
		.tn-right {
			left: initial;
			margin-left: 0;
			margin-right: 15px;
			font-size: 16px;
		}
		.tn-title {
			display: inline-block;
			max-width: 40%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin: auto;
			color: $txtcolor;
			font-size: 18px;
		}
	}
	.space {
		background: none;
		.status-height {
			height: $barheight;
		}
		.nav-height {
			height: $navheight;
		}
	}
</style>