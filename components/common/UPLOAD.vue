<!--批量上传，采用递归的方式-->
<template>
	<view :class="{[align]: true, noMargin}" class="batch-pic">
		<view v-for="(img, i) in imageUrls" :key="i" :style="{ width: width + 'rpx', height: width + 'rpx' }" class="batch-items" >
			<image
				:src="img"
				class="batch-img"
				mode="aspectFill"
			 @click="viewImg(img, imageUrls)"
			>
			</image>
			<text v-if="!disabled" class="iconfont batch-remove" @click="removeImage(i)">&#xe631;</text>
		</view>
		<text
			v-if="count !== imageUrls.length && !disabled "
			:style="{'font-size': width + 'rpx', width: width + 'rpx', height: width + 'rpx'}"
			class="batch-items batch-btns iconfont"
			@click="addImage(imageUrls)"
		>&#xe8be;</text>
	</view>
</template>

<script>
	import aliyunUpload from '@/utils/aliyunUpload.js'

	export default {
		props: {
			width: {
				type: String,
				default: '120',
			},
			value: {
				type: [Array, String],
				default: () => [],
			},
			count: {
				type: Number,
				default: 6,
			},
			disabled: {
				type: Boolean,
				default: false,
			},
			// 对其方式 start | end
			align: {
				type: String,
				default: 'end',
			},
			noMargin: {
				type: Boolean,
				default: false,
			}
		},
		data() {
			return {
				imageUrls: [],
			}
		},
		mounted() {
			this.imageUrls = this.setUrls(this.value)
		},
		watch: {
			value(v) {
				this.imageUrls = this.setUrls(v)
			}
		},
		methods: {
			setUrls(v) {
				if (!v) {
					return []
				}
				if (typeof v === 'string') {
					return [v]
				}
				return v
			},
			removeImage(i) {
				console.log(i)
				this.imageUrls.splice(i, 1)
				this.$emit('input', this.imageUrls)
			},
			addImage(urls) {
				uni.chooseImage({
					count: this.count, // 默认 9
					sizeType: ['original', 'compressed'],
					sourceType: ['album'],
					success: async (res) => {
						const files = res.tempFiles
						const length = files.length
						if (urls && (length + urls.length) > this.count) {
							return this.$toast(`最多可上传${this.count}张图片`)
						}
						this.imageUrls = urls
						const data = await this.loopUpload(files, 0)
						if (data) {
							this.$emit('input', this.count > 1 ? this.imageUrls : this.imageUrls[0])
						}
					}
				});
			},
			/**
			  递归上传多张图片
			 *@param { Array } files
			 *@param { Number } counter 计数
			 */
			async loopUpload(files, counter) {
				console.log(files.length, counter)
				if (counter === files.length) {
					return
				}
				try {
					const url = await aliyunUpload.start(files[counter])
					console.log(url)
					if (!url) throw { msg: 'upload fail' }
					counter++
					this.loopUpload(files, counter)
					let lastUrl = url + this.$config.IMG_SUFFIX_375
					this.imageUrls.push(lastUrl)
					return lastUrl
				} catch (e) {
					console.log(e)
					return Promise.reject()
				}
			},
			viewImg(current, urls) {
				uni.previewImage({ current, urls })
			}
		},
	}
</script>

<style scoped lang="scss">
	.batch-pic {
		display: flex;
		flex-wrap: wrap;
		margin-right: -15rpx;
		&.end {
			justify-content: flex-end;
		}
		&.start {
			justify-content: flex-start;
		}
		.batch-items {
			display: block;
			margin-right: 15rpx;
			margin-bottom: 15rpx;
			width: 120rpx;
			height: 120rpx;
			border-radius: 6rpx;
			position: relative;
			.batch-img {
				width: 100%;
				height: 100%;
				border-radius: 6rpx;
			}
			.batch-remove {
				color: $theme_color;
				font-size: 36rpx;
				position: absolute;
				top: -15rpx;
				right: -15rpx;
				display: block;
				width: 36rpx;
				height: 36rpx;
				border-radius: 50%;
				background-color: #FFFFFF;
			}
		}
		.batch-btns {
			font-size: 120rpx;
			color: #cccccc;
			line-height: 120rpx;
		}
	}
</style>
