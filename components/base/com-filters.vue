<!--通用的顶部筛选-->
<template>
  <view :class="{sticky: position === 'sticky'}" class="top-filter">
    <!--占位符-->
    <view v-if="position === 'fixed'" :class="{ h5Top: hasH5Head && $isH5, noNativeHead }" class="tf-space"></view>
    <view :class="{ h5Top: hasH5Head && $isH5, fixed: position === 'fixed', noNativeHead }" :style="{ top }"
      class="tf-box white-bg">

      <view v-show="mode === 'button'" class="tf-main white-bg">
        <slot name="left"></slot>
        <view v-for="(item, index) in list" :class="{ active: index === currentIndex }" :key="index"
          class="tf-item white-bg" @click.stop="onParentClick(item, index)">

          <!--按钮-->
          <view v-if="item.type === 'button'" class="tf-btns">
            <text class="tf-name">{{ index === currentIndex && condition.activeName || item.name }}</text>
            <text class="tf-arrow iconfont">&#xe607;</text>
          </view>

          <!--日期-->
          <picker v-if="item.type === 'date-no-end'" mode="date" class="tf-btns" key="date-no-end" @change="onDateChange($event, index)">
            <view class="tf-btns">
              <text class="tf-name">{{ item.name }}</text>
              <text class="tf-arrow iconfont">&#xe607;</text>
            </view>
          </picker>

          <!--搜索按钮-->
          <view v-if="item.type === 'search'" :class="{onlyicon: item.icon}" class="tf-btns search-btn">
            <text class="iconfont">&#xe604;</text>
            <text v-if="!item.icon" class="search-placeholder">{{ item.placeholder || '请输入关键字' }}</text>
          </view>

          <view v-show="currentIndex === index && showMask" class="tf-drop white-bg slideToBottom">
            <scroll-view v-if="item.children && item.children.length && !item.slot" class="drop-box">
              <view v-for="(sub, i) in item.children" :key="i" :class="{ active: sub.checked }" class="drop-item"
                @click.stop="onChildClick(index, i, sub)">
                <text class="drop-name">{{ sub.name }}</text>
                <text v-if="sub.checked" class="drop-icon iconfont">&#xe615;</text>
              </view>
            </scroll-view>
            <text v-if="(!item.children || !item.children.length) && !item.slot" class="drop-nodata">暂无选项</text>

            <!--弹窗内容自定义-->
            <slot v-if="item.slot === 'slot1' && $slots.slot1" name="slot1"></slot>
            <slot v-if="item.slot === 'slot2' && $slots.slot2" name="slot2"></slot>
            <slot v-if="item.slot === 'slot3' && $slots.slot3" name="slot3"></slot>
          </view>
          <slot name="right"></slot>
        </view>
      </view>

      <!--搜索框-->
      <view v-show="mode === 'search'" class="tf-search white-bg">
        <view class="search-box">
          <text class="search-icon iconfont">&#xe604;</text>
          <input :focus="mode === 'search' && type === 'button'" v-model="content" class="search-input" type="text"
            :placeholder="inputTips || placeholder" @input="onInput" />
          <text v-if="content" class="search-clear iconfont" @click.stop="resetInput">&#xe608;</text>
        </view>
        <text v-if="type === 'button'" class="search-cancel" @click.stop="mode = 'button'">取消</text>
      </view>
    </view>
    <!--遮罩-->
    <view v-if="showMask" @touchmove.stop.prevent @click="closeMask" class="tf-mask"></view>
  </view>
</template>

<script>
  export default {
    props: {
      /**
       *  options 参数
       * @param { String } Object.name 按钮名称
       * @param { String } Object.type 按钮类型  button => 常规按钮，date => 时间筛选，input => 搜索框, custom: 弹窗自定义
       * @param { String } Object.field 需要发送到后端的字段名称
       * @param { String } Object.children 弹出的子项选择，key, value 一般是name和id
       * @param { String } Object.placeholder 搜索的提示文字
       * @param { String } Object.slot 插槽名称
       */
      options: {
        type: Array,
        default: () => []
      },
      // button: 按钮类型筛选，search: 搜索框
      type: {
        type: String,
        default: 'button'
      },
      // 是否有自定义头部
      hasH5Head: {
        type: Boolean,
        default: false,
      },
      value: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: '请输入关键字'
      },
      // sticky: 粘性定位，relative： 相对定位, fixed：固定定位
      position: {
        type: String,
        default: 'fixed'
      },

      // 没有原生导航栏的时候
      noNativeHead: {
        type: Boolean,
        default: false,
      },

      // 带上原有的默认的参数，方便返回值
      condition: {
        type: Object,
        default: () => {}
      },

      // 距离顶部高度，例如100rpx
      top: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        list: [],
        currentIndex: -1,
        content: '',
        timer: null,
        mode: 'button',
        showMask: false,
        inputTips: '',
      }
    },
    mounted() {
      this.list = this.options
      this.mode = this.type || 'button'
    },
    watch: {
      value(val) {
        this.content = val
      },
      options(v) {
        this.list = v
      },
      showMask(v) {
        this.$emit('show', v)
      },
    },
    methods: {
      closeMask(resetIndex) {
        if (resetIndex) {
          this.currentIndex = -1
        }
        this.showMask = false
      },
      onParentClick(item, index) {
        if (item.type === 'date' || item.type === 'date-no-end' ) {
           if(this.showMask)this.showMask = false;
           this.currentIndex = -1
           return
        }
        if (item.type === 'search') {
          this.mode = 'search'
          this.currentIndex = index
          this.inputTips = this.options[index].placeholder
          this.showMask = false
          return
        }
        this.showMask = true
        this.currentIndex = index
        this.$emit('tabChange', index)
      },
      onChildClick(parentIndex, subIndex, sub) {
        const arr = JSON.parse(JSON.stringify(this.list))
        const currParent = arr[parentIndex]
        let child = currParent.children
        child = child.map((e, i) => {
          e.checked = i === subIndex
          return e
        })
        currParent.name = sub.name
        child[subIndex] = sub
        this.list = arr
        this.sendData(sub.id, true)
        this.showMask = false

      },
      onDateChange({
        detail
      }, index) {
        const arr = JSON.parse(JSON.stringify(this.list))
        const currParent = arr[index]
        const val = detail.value.replace(/-/g, '/')
        currParent.name = val
        this.currentIndex = index
        this.list = arr
        this.sendData(new Date(val).getTime(), true)
      },
      sendData(val, resetIndex) {
        const field = this.list[this.currentIndex].field
        const obj = {
          ...this.condition
        }
        obj[field] = val
        this.$emit('change', obj)
        if (resetIndex) {
          this.currentIndex = -1
        }
      },
      // 重置为button类型
      resetToButton() {
        this.mode = 'button'
        this.content = ''
      },
      resetInput() {
        this.content = ''
        this.sednInputVal('input', '')
      },
      onInput({
        detail
      }) {
        if (this.timer) clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.sednInputVal('input', detail.value)
        }, 500)
      },
      onConfirm({
        detail
      }) {
        this.sednInputVal('input', detail.value)
        uni.hideKeyboard()
      },
      sednInputVal(eventName, v) {
        if (this.type === 'button') {
          this.sendData(v)
        } else {
          this.$emit(eventName, v)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  $height: 90rpx;

  .sticky {
    position: sticky;
    top: 0;
    z-index: 9;
  }

  .tf-space {
    height: $height;

    &.noNativeHead {
      padding-top: var(--status-bar-height);
    }

    &.h5Top {
      padding-top: 0;
    }
  }

  .tf-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }

  .tf-box {
    height: $height;
    position: relative;
    z-index: 2;

    &.fixed {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      z-index: 9;
    }

    &.h5Top {
      top: 44px;
    }

    &.noNativeHead {
      padding-top: var(--status-bar-height);
    }

    .tf-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      position: relative;
      z-index: 2;

      .tf-item {
        display: flex;
        align-items: center;
        height: 100%;
        flex: 1;
        justify-content: center;

        .tf-name {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        &.active {
          .tf-btns {

            .tf-arrow,
            .tf-name {
              color: $theme_color;
            }

            .tf-arrow {
              transform: rotate(180deg);
            }
          }
        }

        .tf-btns {
          display: flex;
          align-items: center;
          height: 100%;
          flex: 1;
          justify-content: center;
          position: relative;
          z-index: 1;

          &:active {
            background: $app-bg;
          }

          .tf-arrow {
            display: inline-block;
            margin-left: 12rpx;
            color: #999999;
            transition: all 0.3s;
          }
        }

        .tf-drop {
          position: absolute;
          top: $height;
          left: 0;
          right: 0;
          box-sizing: border-box;
          max-height: 50vh;
          overflow-y: auto;
          z-index: 0;

          .drop-item {
            padding: 0 24rpx;
            position: relative;
            display: flex;
            align-items: center;

            &:last-child {
              .drop-name {
                border-bottom: 0;
              }
            }

            &:active {
              background: $app-bg;
            }

            &.active {

              .drop-name,
              .drop-icon {
                color: $theme_color;
              }
            }

            .drop-name {
              display: block;
              border-bottom: 1px solid #eeeeee;
              padding: 24rpx 0;
              flex: 1;
            }

            .drop-icon {
              display: block;
              position: absolute;
              right: 24rpx;
            }
          }

          .drop-nodata {
            display: block;
            height: 200rpx;
            text-align: center;
            line-height: 200rpx;
            color: #999999;
          }
        }

        .search-btn {
          margin-right: 24rpx;
          height: 60rpx;
          background: $app-bg;
          flex: 1;
          border-radius: 45rpx;
          display: flex;
          align-items: center;
          justify-content: flex-start;

          &.onlyicon {
            flex: none;
            width: 60rpx;
            border-radius: 50%;
            justify-content: center;
          }

          .search-placeholder {
            font-size: 24rpx;
            color: #cccccc;
          }

          .iconfont {
            display: inline-block;
            margin: 0 24rpx;
            font-size: 24rpx;
            color: #999999;
          }
        }
      }
    }

    .tf-search {
      height: 100%;
      padding: 0 32rpx;
      display: flex;
      align-items: center;

      .search-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 70rpx;
        background: $app-bg;
        flex: 1;
        border-radius: 45rpx;
        padding: 0 32rpx;
        transition: all 0.3s;
      }

      .search-input {
        flex: 1;
        margin: 0 24rpx;
      }

      .iconfont {
        font-size: 26rpx;
        color: #999999;
      }

      .search-clear {
        transform: rotate(45deg);
      }

      .search-cancel {
        display: inline-block;
        margin-left: 24rpx;
        color: #666666;
        font-size: 24rpx;
      }
    }
  }
</style>
