<template>
	<view :style="{ width: width + 'rpx', height: width + 'rpx' }" class="lmy-avatar">
		<image class="avatar-img" :src="errImg || src" mode="aspectFill" @error="onImageError"></image>
	</view>
</template>

<script>
	const defaultSrc = '/static/img/default_avatar.png'
	export default {
		props: {
			width: {
				type: String,
				default: '60'
			},
			user: {
				default: () => {}
			}
		},
		computed: {
			src() {
				let src = defaultSrc
				if (!this.user) {
					return src
				}
				const sex = this.user.sex
				const head = this.user.headimgurl
				if (head) {
					return head
				}
				if (!sex) {
					return src
				}
				if (sex === 1) {
					src = '/static/img/default_man.png'
				}
				if (sex === 2) {
					src =  '/static/img/default_women.png'
				}
				return src
			}
		},
		data() {
			return {
				errImg: ''
			}
		},
		methods: {
			onImageError(e) {
				this.errImg = defaultSrc
			}
		}
	}
</script>

<style scoped lang="scss">
	.lmy-avatar {
		border-radius: 50%;
		overflow: hidden;
		background: #EEEEEE;
		.avatar-img {
			width: 100%;
			height: 100%;
			border-radius: 50%;
		}
	}
</style>
