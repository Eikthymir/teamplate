<template>
	<view :class="{ fixed, iphonex: $safeBottom > 0, icon: hasIcon }" id="tab-parent" class="tab-components">
		<view class="tab-box">
			<view
				v-for="(tab, i) in menu"
				:style="{ color: activeColor && i === tabIndex ? activeColor : color }"
				:key="i"
				:class="{ active: i === tabIndex, icon: tab.icon }"
				:id="'tab_'+i"
				class="tab-item"
				@click="onTabClick(tab, i)"
      >
        <text v-if="tab.icon" class="tab-icon iconfont">{{ tab.icon }}</text>
        <text class="tab-text">{{ tab.name }}</text>
      </view>
		</view>
		<view
			v-if="tabItemWidth > 0 && !hasIcon"
			:style="{ left: tabItemOffsetLeft + 'px', width:  tabItemWidth + 'px', 'background-color': activeColor }"
			class="tab-slider"
		>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
      // 显示字体图标传入icon: '\'
			menu: {
				type: Array,
				default: () => [],
				required: true
			},
			index: {
				type: Number,
				default: 0
			},
			activeColor: {
				type: String,
			},
			color: {
				type: String,
			},

      // 是否固定在底部
      fixed: {
        type: Boolean,
        default: false
      }
		},
		data() {
			return {
				tabItemOffsetLeft: 0,
				tabItemWidth: 0,
				tabIndex: 0
			}
		},
    computed: {
      hasIcon() {
        return this.menu.find(e => e.icon)
      },
      $safeBottom() {
      	return uni.getSystemInfoSync().safeAreaInsets.bottom
      }
    },
		mounted() {
			// console.log(this.index)
      if (!this.hasIcon) {
        this.$nextTick(function(){
        	this.onTabClick(this.menu[this.index], this.index)
        })
      } else {
        this.tabIndex = this.index
      }
		},
		methods: {
			onTabClick(item, index) {
        if (this.hasIcon) {
          this.tabIndex = index
          this.$emit('change', index)
          return
        }
				const query = uni.createSelectorQuery().in(this)
				const parent = query.select('#tab-parent')
				const view = query.select(`#tab_${index}`)
				let parentLeft = 0
				parent.boundingClientRect(res => {
					parentLeft = res.left
				}).exec()
				view.boundingClientRect(data => {
					//console.log('data==',data)
					this.tabItemOffsetLeft = data.left - parentLeft // 减去父级的左边距
					this.tabItemWidth = data.width
					if (this.tabIndex === index) {
						return
					}
					this.tabIndex = index
					this.$emit('change', index)
				}).exec()
			}
		}
	}
</script>

<style scoped lang="scss">
	.tab-components {
		position: relative;
		padding: 24rpx 0;
		z-index: 1;
		background: #ffffff;
    &.icon {
      padding: 12rpx 24rpx;
    }
    &.fixed {
      position: fixed;
      z-index: 9;
      left: 0;
      right: 0;
      bottom: 0;
      &.iphonex {
        padding-bottom: 50rpx;
      }
    }
		.tab-box {
			display: flex;
			justify-content: space-around;
			.tab-item {
				transition: all 0.3s;
				color: #999999;
				&.active {
					font-weight: bold;
					color: $theme_color;
				}
        &.icon {
          font-weight: normal;
          .tab-text {
            font-size: 22rpx;
          }
        }
        .tab-icon, .tab-text {
          display: block;
          text-align: center;
          color: inherit;
        }
        .tab-icon {
          font-size: 48rpx;
        }
			}
		}
		.tab-slider {
			position: absolute;
			background-color: $theme_color;
			height: 6rpx;
			border-radius: 6rpx;
			width: 50rpx;
			left: 15%;
			bottom: 0;
			transition: all 0.3s;
		}
	}
</style>
