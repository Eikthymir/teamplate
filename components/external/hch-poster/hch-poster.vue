<!--
 * @Description: 生成海报组件
 * @Version: 1.0.0
 * @Autor: hch
 * @Date: 2020-08-07 14:48:41
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-07-31 18:11:35
 * https://ext.dcloud.net.cn/plugin?id=586
 * 保存海报按钮和关闭按钮 在html代码中写出来 绑定点击方法然后透明 再用canvas 覆盖
-->

<template>
  <view
    class="canvas-content"
    v-if="canvasShow"
    :style="{
      width: system.w + 'px',
      height: system.h + 'px',
      top: system.h < 800 ? '60rpx' : '0'
    }"
  >
    <!-- 遮罩层 -->
    <view class="canvas-mask"></view>
    <!-- 海报 -->
    <!-- :width="system.w" :height="system.h" 支付宝必须要这样设置宽高才有效果 -->
    <canvas
      class="canvas"
      canvas-id="myCanvas"
      id="myCanvas"
      :style="'width:' + system.w + 'px; height:' + system.h + 'px;'"
      :width="system.w"
      :height="system.h"
      @tap="handleCanvasCancel"
      @touchmove.stop.prevent="stopMove"
    ></canvas>
    <view class="button-wrapper" :style="{ bottom: system.h < 800 ? '66rpx' : '206rpx' }">
      <!-- 保存海报按钮 -->
      <!-- #ifndef MP-QQ -->
      <button class="save-btn cancel-btn" open-type="share" @tap="handleCanvasCancel">
        <text class="iconfont icon-fenxianghaoyou cancel-btn-icon"></text>
        分享好友
      </button>
      <!-- cover-view 标签qq小程序有问题 -->
      <!-- <cover-view class="save-btn cancel-btn">分享好友</cover-view> -->
      <view class="save-btn" @tap="handleSaveCanvasImage">
        <text class="iconfont icon-baocunxiangce save-btn-icon"></text>
        保存图片
      </view>
      <!-- #endif -->
      <!-- #ifdef MP-QQ -->
      <button class="save-btn cancel-btn" open-type="share">
        <text class="iconfont icon-fenxianghaoyou"></text>
        分享好友
      </button>
      <button class="save-btn" @tap="handleSaveCanvasImage">保存海报</button>
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
import { drawSquarePic, drawTextReturnH, getSystem } from './utils';
export default {
  data() {
    return {
      system: {},
      canvasShow: false,
      defaultData: {
        // 海报模板数据
        poster: {
          //根据屏幕大小自动生成海报背景大小
          url: '', //图片地址
          r: 12, //圆角半径
          w: 308, //海报宽度
          h: 464, //海报高度
          p: 0 //海报内边距padding
        },
        mainImg: {
          //海报主商品图
          url: '', //图片地址
          r: 12, //圆角半径
          w: 308, //宽度
          h: 230 //高度
        },
        title: {
          //商品标题
          text: '', //文本
          fontSize: 16, //字体大小
          color: '#000', //颜色
          lineHeight: 25, //行高
          mt: 30 //margin-top
        },
        count: {
          // 成团人数
          text: '', //文本
          fontSize: 14, //字体大小
          color: '#FA5539', //颜色
          lineHeight: 25, //行高
          mt: 30 //margin-top
        },
        price: {
          //商品价格
          text: '', //文本
          fontSize: 16, //字体大小
          color: '#FA5539', //颜色
          lineHeight: 25, //行高
          mt: 86 //margin-top
        },
        codeImg: {
          //小程序码
          url: '', //图片地址
          w: 100, //宽度
          h: 100, //高度
          mt: 10, //margin-top
          r: 50 //圆角半径
        },
        tips: [
          //提示信息
          {
            text: '长按图片识别小程序', //文本
            fontSize: 14, //字体大小
            color: '#9B9B9B', //字体颜色
            align: 'center', //对齐方式
            lineHeight: 25, //行高
            mt: 20 //margin-top
          }
        ]
      }
    };
  },
  props: {
    shareInfo: {
      type: Object,
      default: () => {}
    },
    wxaCode: {
      type: String,
      default: ''
    }
  },
  computed: {
    posterData() {
      return this.defaultData;
    },
    /**
     * @description: 计算海报背景数据
     * @param {*}
     * @return {*}
     * @author: hch
     */

    poster() {
      let data = this.posterData;
      let system = this.system;
      let posterBg = {
        url: data.poster.url,
        r: data.poster.r * system.scale,
        w: data.poster.w * system.scale,
        h: data.poster.h * system.scale,
        x: (system.w - data.poster.w * system.scale) / 2,
        y: (system.h - data.poster.h * system.scale - 158) / 2,
        p: data.poster.p * system.scale
      };
      return posterBg;
    },
    /**
     * @description: 计算海报头部主图
     * @param {*}
     * @return {*}
     * @author: hch
     */

    mainImg() {
      let data = this.posterData;
      let system = this.system;
      let posterMain = {
        url: data.mainImg.url,
        r: data.mainImg.r * system.scale,
        w: data.mainImg.w * system.scale,
        h: data.mainImg.h * system.scale,
        x: (system.w - data.mainImg.w * system.scale) / 2,
        y: this.poster.y + data.poster.p * system.scale
      };
      return posterMain;
    },
    /**
     * @description: 计算海报标题
     * @param {*}
     * @return {*}
     * @author: hch
     */

    title() {
      let data = this.posterData;
      let system = this.system;
      let posterTitle = data.title;
      posterTitle.x = this.mainImg.x;
      posterTitle.y = this.mainImg.y + this.mainImg.h + data.title.mt * system.scale;
      return posterTitle;
    },
    /**
     * @description: 计算成团人数
     * @param {*}
     * @return {*}
     * @author: hch
     */
    
    count() {
      let data = this.posterData;
      let system = this.system;
      let count = data.count;
      count.x = this.mainImg.x;
      count.y = this.mainImg.y + this.mainImg.h + data.count.mt * system.scale;
      return count;
    },
    /**
     * @description: 计算价格
     * @param {*}
     * @return {*}
     * @author: hch
     */

    price() {
      let data = this.posterData;
      let system = this.system;
      let price = data.price;
      price.x = this.mainImg.x;
      price.y = this.mainImg.y + this.mainImg.h + data.price.mt * system.scale;
      return price;
    },
    /**
     * @description: 计算小程序码
     * @param {*}
     * @return {*}
     * @author: hch
     */

    codeImg() {
      let data = this.posterData;
      let system = this.system;
      let posterCode = {
        url: data.codeImg.url,
        r: data.codeImg.r * system.scale,
        w: data.codeImg.w * system.scale,
        h: data.codeImg.h * system.scale,
        x: (system.w - data.codeImg.w * system.scale) / 2,
        y: data.codeImg.mt * system.scale //y需要加上绘图后文本的y
      };
      return posterCode;
    }
  },
  created() {
    // 获取设备信息
    this.system = getSystem();
  },
  methods: {
    /**
     * @description: 展示海报
     * @param {type}
     * @return {type}
     * @author: hch
     */
    posterShow() {
      this.defaultData.mainImg.url = this.shareInfo.share_cover;
      this.defaultData.title.text = this.shareInfo.goods_name;
      this.defaultData.price.text = '￥' + this.shareInfo.group_price;
      this.defaultData.count.text = this.shareInfo.group_people_count + '人团';
      this.defaultData.codeImg.url = this.wxaCode;
      this.canvasShow = true;
      this.creatPoster();
    },
    /**
     * @description: 生成海报
     * @author: hch
     */
    async creatPoster() {
      uni.showLoading({
        title: '生成海报中...'
      });
      const ctx = uni.createCanvasContext('myCanvas', this);
      this.ctx = ctx;
      ctx.clearRect(0, 0, this.system.w, this.system.h); //清空之前的海报
      ctx.draw(); //清空之前的海报
      // 根据设备屏幕大小和距离屏幕上下左右距离，及圆角绘制背景
      let poster = this.poster;
      let mainImg = this.mainImg;
      let codeImg = this.codeImg;
      let title = this.title;
      let price = this.price;
      let count = this.count
      await drawSquarePic(ctx, poster.x, poster.y, poster.w, poster.h, poster.r, poster.url);
      await drawSquarePic(ctx, mainImg.x, mainImg.y, mainImg.w, mainImg.h, mainImg.r, mainImg.url);
      // 绘制标题 textY 绘制文本的y位置
      console.log('creatPoster -> title.x', title.x);
      let textY = drawTextReturnH(ctx, title.text, title.x, title.y, mainImg.w, title.fontSize, title.color, title.lineHeight);
      // 绘制成团人数
      drawTextReturnH(ctx, count.text, count.x, count.y, mainImg.w, count.fontSize, count.color, count.lineHeight, 'right');
      // 绘制价格文本
      let priceY = drawTextReturnH(ctx, price.text, price.x, price.y, mainImg.w, price.fontSize, price.color, price.lineHeight);
      // 绘制小程序码
      await drawSquarePic(ctx, codeImg.x, codeImg.y + priceY, codeImg.w, codeImg.h, codeImg.r, codeImg.url);
      // 小程序的名称
      // 长按/扫描识别查看商品
      let y = 0;
      this.posterData.tips.forEach((element, i) => {
        if (i == 0) {
          y = codeImg.y + priceY + element.mt + codeImg.h;
        } else {
          y += element.mt;
        }
        y = drawTextReturnH(ctx, element.text, title.x, y, mainImg.w, element.fontSize, element.color, element.lineHeight, element.align);
      });
      uni.hideLoading();
    },
    /**
     * @description: 保存到系统相册
     * @param {type}
     * @return {type}
     * @author: hch
     */
    handleSaveCanvasImage() {
      uni.showLoading({
        title: '保存中...'
      });
      let _this = this;
      // 把画布转化成临时文件
      // #ifndef MP-ALIPAY
      // 支付宝小程序外，其他都是用这个方法 canvasToTempFilePath
      uni.canvasToTempFilePath(
        {
          x: this.poster.x,
          y: this.poster.y,
          width: this.poster.w, // 画布的宽
          height: this.poster.h, // 画布的高
          destWidth: this.poster.w * 5,
          destHeight: this.poster.h * 5,
          canvasId: 'myCanvas',
          success(res) {
            //保存图片至相册
            // #ifndef H5
            // 除了h5以外的其他端
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                uni.hideLoading();
                uni.showToast({
                  title: '图片保存成功，可以去分享啦~',
                  duration: 2000,
                  icon: 'none'
                });
                _this.handleCanvasCancel();
              },
              fail() {
                uni.showToast({
                  title: '保存失败，稍后再试',
                  duration: 2000,
                  icon: 'none'
                });
                uni.hideLoading();
              }
            });
            // #endif

            // #ifdef H5
            // h5的时候
            uni.showToast({
              title: '请长按保存',
              duration: 3000,
              icon: 'none'
            });
            _this.handleCanvasCancel();
            _this.$emit('previewImage', res.tempFilePath);
            // #endif
          },
          fail(res) {
            console.log('fail -> res', res);
            uni.showToast({
              title: '保存失败，稍后再试',
              duration: 2000,
              icon: 'none'
            });
            uni.hideLoading();
          }
        },
        this
      );
      // #endif
      // #ifdef MP-ALIPAY
      // 支付宝小程序条件下 toTempFilePath
      this.ctx.toTempFilePath(
        {
          x: this.poster.x,
          y: this.poster.y,
          width: this.poster.w, // 画布的宽
          height: this.poster.h, // 画布的高
          destWidth: this.poster.w * 5,
          destHeight: this.poster.h * 5,
          success(res) {
            //保存图片至相册
            my.saveImage({
              url: res.apFilePath,
              showActionSheet: true,
              success(res) {
                uni.hideLoading();
                uni.showToast({
                  title: '图片保存成功，可以去分享啦~',
                  duration: 2000,
                  icon: 'none'
                });
                _this.handleCanvasCancel();
              },
              fail() {
                uni.showToast({
                  title: '保存失败，稍后再试',
                  duration: 2000,
                  icon: 'none'
                });
                uni.hideLoading();
              }
            });
          },
          fail(res) {
            console.log('fail -> res', res);
            uni.showToast({
              title: '保存失败，稍后再试',
              duration: 2000,
              icon: 'none'
            });
            uni.hideLoading();
          }
        },
        this
      );
      // #endif
    },
    /**
     * @description: 取消海报
     * @param {type}
     * @return {type}
     * @author: hch
     */
    handleCanvasCancel() {
      this.canvasShow = false;
      this.$emit('cancel', true);
      uni.hideLoading();
      uni.showTabBar({});
    },
    stopMove() {}
  }
};
</script>

<style lang="scss" scoped>
.content {
  text-align: center;
  height: 100%;
}
.canvas-content {
  z-index: $canvas;
  position: fixed;
  top: 0;
  .canvas-mask {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9;
  }
  .canvas {
    z-index: 10;
  }
  .button-wrapper {
    width: 100%;
    height: 82rpx;
    position: fixed;
    bottom: 226rpx;
    box-sizing: border-box;
    padding: 0 48rpx;
    display: flex;
    justify-content: space-around;
    z-index: 16;
  }

  .save-btn {
    @include flex-center;
    font-size: 30rpx;
    line-height: 82rpx;
    background: #ffffff;
    min-width: 282rpx;
    max-width: 290rpx;
    height: 82rpx;
    border-radius: 12rpx;
    text-align: center;
    z-index: 16;
    font-weight: 500;
    font-size: 36rpx;

    &-icon {
      margin-right: 22rpx;
      font-size: 58rpx;
      color: #f0a46a;
    }
  }

  .cancel-btn {
    background: #ffffff;

    &-icon {
      margin-right: 22rpx;
      font-size: 58rpx;
      color: #41d843;
    }
  }
  .canvas-close-btn {
    position: fixed;
    width: 60rpx;
    height: 60rpx;
    padding: 20rpx;
    top: 30rpx;
    right: 0;
    z-index: 12;
  }
}
</style>
