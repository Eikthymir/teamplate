<template>
	<view class="loadmore-wrap">
		<boyu-loading
      :status="loadStatus"
      :relative="loadingPosition === 'relative'"
      :msg="errMsg"
      @errClick="init"
     >
			<slot></slot>
			<view class="no-data" @click="reload">
				<text>{{ tips }}</text>
				<image v-if="!noMore && !loadError" src="/static/img/load.gif"></image>
			</view>
		</boyu-loading>
	</view>
</template>

<script>
	export default {
		props: {
			// api地址
			api: {
				type: String,
				default: '',
				required: true
			},
			// 筛选条件
			condition: {
				type: Object,
				default: () => {}
			},
			// 不主动执行请求
			noInit: {
				type: Boolean,
				default: false
			},
			loadingPosition: {
				type: String,
				default: 'absolute',
			},
			// 是否请求完成就隐藏loading
			autoHideLoading: {
				type: Boolean,
				default: true
			},
			// 是否返回合并后的数据
			concat: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				noMore: false,
				loadStatus: 0,
				filter: {
					page: 1,
					page_size: 10
				},
				list: [],
				tips: '没有更多了',
				loadError: false,
				loading: false,
				isChangeCondition: false,
        errMsg: '',
			}
		},
		mounted() {
			if (!this.noInit) {
				this.init()
			}
		},
		methods: {
			async init() {
				this.filter.page = 1
				this.list = []
				await this.getList()
				return true
			},
			// 为了条件查询后使用的
			refresh() {
				this.filter.page = 1
				this.list = []
				// 不延迟的话，condition里面的东西拿不到
				setTimeout(() => {
					this.getList()
				},10)
			},
			reload() {
				if (this.loading || this.noMore) {
					return
				}
				this.loading = false
				this.getList()
			},
      showLoading(){
         this.loadStatus = 0
         this.loading = true
      },
			hideLoading() {
        this.loading = false
				this.loadStatus = 1
			},
      setErrMsg(msg) {
      	this.errMsg = msg
        this.loadStatus = -2
      },
			setFilters(data = {}) {
				const obj = { ...this.filter, ...data, }
				for (let a in obj) {
					if (!obj[a]) {
						delete obj[a]
					}
				}
				this.filter = obj
			},
			async getList() {
				this.setFilters(this.condition)
				const params = this.filter
				const { page, page_size } = params
				if (page === 1) {
					this.loadStatus = 0
          this.list = []
				}
				this.loading = true
				try {
					const apiUrl = this.api.split('.')
					const res = await this.$api[apiUrl[0]][apiUrl[1]](params)
					const { data: { items, totalItems } } = res
					const newList = items
					const isNoData = !newList.length && page === 1
					this.list = this.concat ? [...this.list, ...newList] : newList
					this.noMore = newList.length < page_size
					this.tips = this.noMore ? '没有更多了' : '加载中...'
					if (this.autoHideLoading) {
						this.loadStatus = isNoData ? -1 : 1
					}
					this.loadError = false
					this.$emit('load', this.list)
					// 返回所有信息但不包含items，方便获取总数
					if (page === 1) {
						const obj = { ...res.data }
						delete obj.items
						this.$emit('all', obj)
					}
				} catch(e) {
					console.log(e)
					if (page === 1) {
						this.loadStatus = -2
					}
					this.tips = '加载失败，请点击重试'
					this.loadError = true
				} finally {
					this.loading = false
				}
			},
			loadMore() {
				if (this.noMore) {
					return
				}
				if (this.loading) {
					return
				}
				this.filter.page ++
				this.getList()
			}
		},
	}
</script>

<style scoped lang="scss">
	.no-data {
	  font-size: 28upx;
	  color: #999999;
	  text-align: center;
	  padding: 20upx;
		display: flex;
		align-items: center;
		justify-content: center;
		image {
			width: 40upx;
			height: 40upx;
			display: inline-block;
			margin-left: 10upx;
		}
	}
</style>
