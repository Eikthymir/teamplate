<template>
  <uni-popup id="popup" ref="popup" type="bottom" :animation="false">
  	<!-- <view class="popup-content">popup 内容，此示例没有动画效果</view> -->
    <view class="action-sheet">
       <view class="title" v-for="(item,index) in list" :key="index" @click="$emit(item.action)">{{item.title}}</view>
       <view class="bottom" @click="cancel">取消</view>
    </view>
  </uni-popup>
</template>

<script>
  export default {
     props:{
        list: {
           type: Array,
           default:[]//[{title:''添加会员'',action:'addMember'},{title:'分配专属',action:'setInterests'}]
        }
     },
     data(){
        return {

        }
     },
     methods:{
       open() {
          this.$refs.popup.open();
       },
       cancel() {
          this.$refs.popup.close();
       }
     }
  }
</script>

<style scoped lang="scss">
  // .popup-content {
  // 	background-color: #fff;
  // 	padding: 15px;
  // }
 .action-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 140px;
    background-color: #F0F0F0;
    .title {
       width: 100%;
       height: 40px;
       text-align: center;
       color: #333333;
       font-size: 16px;
       line-height: 40px;
       background-color: #FFFFFF;
    }
    .title:first-child {
        border: 1px solid #D8D8D8;
    }
    .bottom {
       width: 100%;
       height: 40px;
       line-height: 40;
       background-color: #FFFFFF;
       text-align: center;
       color: #333333;
       font-size: 16px;
       margin-top: 8px;
    }

 }
</style>
