<!--基本的选型按钮和表单左右排列的-->
<template>
	<view
		:class="{
			'top': align === 'top',
			'left': align === 'left',
			'left-top': align === 'left top',
			'no-border': noBorder,
			small,
			gray,
      red,
			'no-arrow': noArrow,
			slots: Object.keys($slots).length || hasVModel
		}"
		:style="{ background }"
		class="opt-item"
		@click="$emit('onClick')">
		<view class="opt-left">
			<text v-if="icon && icon.indexOf('img') < 0" class="opt-icon iconfont">{{ icon }}</text>
			<image v-if="icon && icon.indexOf('img') > -1" :src="icon" class="opt-img"></image>
			<view class="opt-txt">
				<text>{{ label }}</text>
				<text v-if="required" class="opt-require">*</text>
			</view>
		</view>
		<view class="opt-right">
			<template v-if="!Object.keys($slots).length">
				<text v-if="right !== ''" class="opt-val">{{ right }}</text>
				<!--由于不支持动态设置type，只能这样了-->
				<template v-if="type === 'text'">
					<input
						v-if="!right && hasVModel"
						:placeholder="placeholder"
						:disabled="disabled"
						type="text"
						v-model="content"
						class="opt-val opt-input"
						@input="onInput"
					/>
				</template>
				<template v-if="type === 'number'">
					<input
						v-if="!right && hasVModel"
						:placeholder="placeholder"
						:disabled="disabled"
						type="number"
						v-model="content"
						class="opt-val opt-input"
						@input="onInput"
					/>
				</template>
				<template v-if="type === 'digit'">
					<input
						v-if="!right && hasVModel"
						:placeholder="placeholder"
						:disabled="disabled"
						type="digit"
						v-model="content"
						class="opt-val opt-input"
						@input="onInput"
					/>
				</template>
				<!--日期-->
				<picker
					v-if="type === 'date'"
          :start="start"
          :end="end"
					:value="content"
					mode="date"
					@change="onDateChange"
				>
					<view class="opt-date">
						<text class="opt-val">{{ content || '请选择' }}</text>
            <text v-if="!noArrow" class="opt-arrow iconfont">&#xe62a;</text>
					</view>
				</picker>
			</template>
			<view v-else class="opt-val">
				<slot></slot>
			</view>
			<text v-if="!hasVModel && !noArrow" :class="{'rotate': rotate}" class="opt-arrow iconfont">&#xe62a;</text>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			// 左边显示的文本
			label: {
				type: String,
				default: ''
			},
			// 右边显示的文本
			right: {
				default: ''
			},
			icon: {
				type: String,
				default: '',
			},
			value: {
				type: [String, Number, Object, Array, Date],
				default: '',
			},
			placeholder: {
				type: String,
				default: '请输入',
			},
			noArrow: {
				default: false,
				type: Boolean
			},
			// 箭头旋转
			rotate: {
				default: false,
				type: Boolean
			},
			disabled: {
				default: false,
				type: Boolean
			},
			align: {
				type: String,
				default: 'center',
			},
			noBorder: {
				type: Boolean,
				default: false,
			},
			small: {
				type: Boolean,
				default: false,
			},
			gray: {
				type: Boolean,
				default: false,
			},
      red: {
        type: Boolean,
        default: false,
      },
			required: {
				type: Boolean,
				default: false,
			},
			type: {
				type: String,
				default: 'text',
			},
			background: {
				type: String,
				default: '',
			},
      notFormat: {
        type: Boolean,
        default: true
      },
      start: {
        type: String,
        default: undefined
      },
      end: {
        type: String,
        default: undefined
      }
		},
		data() {
			return {
				content: '',
			}
		},
		computed: {
			hasVModel() {
				const props = this.$options.propsData
				return Object.keys(this.$options.propsData).indexOf('value') > -1
			}
		},
		mounted() {
		  this.content = this.value
		},
		watch: {
			value(newVal) {
			  this.content = newVal
			}
		},
		methods: {
			onInput({ detail }) {
				this.$emit('input', detail.value)
			},
			onDateChange({ detail }) {
        const val = detail.value
				if (!this.notFormat) {
          val = val.replace(/-/g, '/')
        }
				this.content = val
				this.$emit('input', val)
			},
		}
	}
</script>

<style scoped lang="scss">
	.opt-item {
		display: flex;
		padding: 30rpx;
		flex-direction: row;
		align-items: center;
		position: relative;
		background-color: #FFFFFF;
		line-height: 44rpx;
		justify-content: space-between;
		&:active {
			background-color: $app-bg;
		}
		&.slots {
			&:active {
				background-color: #ffffff!important;
			}
			.opt-val {
				width: 100%;
			}
		}
		&.no-arrow {
			&:active {
				background-color: #FFFFFF;
			}
			.opt-val {
				margin-right: 0;
			}
		}
		&.small {
			padding: 15rpx 30rpx;
			.opt-txt, .opt-val {
				font-size: 26rpx;
			}
			.opt-icon, .opt-img {
				font-size: 36rpx;
				width: 36rpx;
			}
		}
		&.gray {
			.opt-txt {
				color: #999999;
			}
			.opt-val {
				color: #333333;
			}
		}
    &.red {
      .opt-val {
      	color: red;
      }
    }
		&.left-top {
			align-items: flex-start;
			justify-content: flex-start;
			.opt-right {
				justify-content: flex-start;
			}
		}
		&.top {
			align-items: flex-start;
		}
		&.end {
			align-items: flex-end;
		}
		&.left {
			justify-content: flex-start;
			.opt-right {
				justify-content: flex-start;
			}
		}
		&:last-child {
			&:after {
				display: none;
			}
		}
		&.borderpadd {
			&:after {
				left: 120rpx;
			}
		}
		&:after {
			content: '';
			display: block;
			left: 30rpx;
			right: 30rpx;
			height: 1px;
			background: $app-bg;
			position: absolute;
			bottom: 0;
		}
		&.no-border {
			&:after {
				display: none;
			}
		}
		.opt-left {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			margin-right: 30rpx;
		}
		.opt-right {
			flex: 1;
			display: flex;
			align-items: center;
			position: relative;
			justify-content: flex-end;
		}
		.opt-icon, .opt-img {
			display: block;
			font-size: 44rpx;
			width: 44rpx;
			color: #999999;
			margin-right: 30rpx;
		}
		.opt-img {
			height: 44rpx;
		}
		.opt-txt {
			display: inline-block;
			font-size: 30rpx;
			color: #333333;
			min-width: 120rpx;
		}
		.opt-arrow {
			display: block;
			font-size: 26rpx;
			color: #999999;
			position: absolute;
			right: 0;
			transition: all 0.3s;
			&.rotate {
				transform: rotate(90deg)
			}
		}
		.opt-val{
			display: block;
			text-align: right;
			margin-right: 45rpx;
			font-size: 30rpx;
			color: #999999;
		}
		.opt-require {
			color: #FF152D;
		}
		.opt-date {
			display: flex;
			align-items: center;
		}
		.opt-input {
			margin-right: 0;
		}
	}
</style>
