<template>
  <div>
    <el-upload
      v-if="type === 'avatar'"
      class="avatar-uploader"
      action="https://jsonplaceholder.typicode.com/posts/"
      :show-file-list="false"
      :http-request="upLoadRequest"
      :accept="Accept"
    >
      <!-- 点击编辑赋值进来回显 -->
      <el-image
        v-if="Url && !upUrl"
        :src="Url"
        class="avatar"
        fit="cover"
        :style="{ width: w, height: h, lineHeight: h }"
      />
      <!-- 上传图片后更新 -->
      <el-image
        v-else-if="upUrl"
        :src="upUrl"
        class="avatar"
        fit="cover"
        :style="{ width: w, height: h, lineHeight: h }"
      />
      <!-- 点击添加 -->
      <i v-else class="el-icon-plus avatar-uploader-icon" :style="{ width: w, height: h, lineHeight: h }" />
    </el-upload>
    <el-upload
      v-else
      drag
      action="https://jsonplaceholder.typicode.com/posts/"
      :accept="Accept"
      :multiple="type === 'drag'"
      :http-request="upLoadRequest"
      :limit="limit"
      style="max-width: 400px"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div
        v-if="type === 'drag'"
        slot="tip"
        style="color: #a7a7a7"
      >
        tips: 可一次性选择多张图片，选择后将直接上传
      </div>
    </el-upload>
    <el-progress :percentage="progress" :style="{width: l}" />
    <video
      v-if="type === 'video' && progress === 100"
      id="video"
      :src="localUrl"
      controls="controls"
      @canplay="getDuration"
    />
    <audio
      v-if="type === 'media' && progress === 100"
      id="media"
      :src="localUrl"
      controls="controls"
      @canplay="getDuration"
    />
  </div>
</template>

<script>
import { upLoad } from './upload'

export default {
  name: 'MUpload',
  props: {
    w: {
      type: String,
      default: '178px'
    },
    h: {
      type: String,
      default: '178px'
    },
    l: {
      type: String,
      default: '400px'
    },
    // type: avatar video media
    type: {
      type: String,
      default: 'avatar'
    },
    src: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: 1
    },
    accept: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      upUrl: '', // 上传后路径
      localUrl: '', // 本地路径
      progress: 0 // 进度条
    }
  },
  computed: {
    Url () {
      if (this.src !== '') return this.src
      else return false
    },
    Accept () {
      if (this.type === 'avatar') return 'image/jpeg,image/jpg,image/gif,image/png'
      else if (this.type === 'video') return 'video/mp4,video/rmvb,video/avi,video/mov,video/flv'
      else if (this.type === 'media') return 'audio/mp3,audio/wav,audio/flac,audio/wma,audio/aac,audio/ape,audio/ogg,audio/cd'
      else return this.accept
    },
    BucketType () {
      switch (this.type) {
        case 'media':
          return 'music-app-media-in'
        case 'video':
          return 'music-app-video-in'
        default:
          return 'music-app-pic'
      }
    }
  },
  created () {
    if (this.src !== '') {
      this.localUrl = this.src
      this.progress = 100
    }
  },
  methods: {
    upLoadRequest (file) {
      upLoad(file.file, this.BucketType, (res) => {
        if (res < 100) this.progress = parseInt(res)
        if (res.url) {
          this.progress = 100
          this.upUrl = res.url
          if (this.type === 'video' || this.type === 'media') {
            const read = new FileReader()
            read.readAsDataURL(file.file)
            read.onload = e => {
              this.localUrl = e.target.result
            }
            this.$emit('getUrl', res.name)
          } else if (this.type === 'avatar' || this.type === 'drag') {
            this.$emit('getUrl', res.url, res.name)
          }
        }
      })
    },
    getDuration () {
      const duration = document.getElementById(this.type).duration
      // const hour = parseInt((duration) / 3600)
      // const minute = parseInt((duration % 3600) / 60)
      // const second = Math.ceil(duration % 60)
      // const time = hour + ':' + minute + ':' + second
      this.$emit('getTime', duration)
    }
  }
}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
