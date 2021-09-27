<!--简易的数字递增组件，没有动画效果，纯粹递增-->
<template>
  <view class="conut-number">
    <template v-if="value">
      <text v-for="(item, index) in splitNumber" :key="index" class="number-item">{{ item }}</text>
    </template>
    <text v-else>0</text>
  </view>
</template>

<script>
  export default {
    props: {
      value: {
        type: [String, Number],
        default: ''
      }
    },
    data() {
      return {
        splitNumber: [],
        timer: ''
      }
    },
    watch: {
      value(v) {
        this.startCount(v)
      }
    },
    mounted() {
      this.startCount(this.value)
    },
    destroyed() {
      clearTimeout(this.timer)
      this.timer = ''
    },
    methods: {
      startCount(value) {
        if (!value) {
          return
        }
        clearTimeout(this.timer)
        this.timer = ''
        const target = String(value).split('').map(e => {
          if (e !== '.') {
            e = +e
          }
          return e
        })
        const start = target.map(e => {
          if (e !== '.') {
            e = 0
          }
          return e
        })
        const len = start.length - 1
        const last = []
        // 递归循环
        const loop = (index) => {
          this.timer = setTimeout(() => {

            if (start[index] >= target[index]) {
              if (index <= 0) {
                clearTimeout(this.timer)
                this.timer = ''
                return
              }
              index --
            }

            if (target[index] === 0 || target[index] === '.') {
              index --
            }

            if (target[index] !== 0 && target[index] !== '.') {
              start[index] ++
            }

            loop(index)
          }, 50)
          this.splitNumber = [...start]
        }
        loop(len)
      },
    }
  }
</script>

<style scoped lang="scss">
  .number-item {
    color: inherit;
  }
</style>
