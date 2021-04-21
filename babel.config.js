module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  'env': {
    'development': {
      // 安装babel-plugin-dynamic-import-node插件，提高页面热更新速度
      // https://panjiachen.github.io/vue-element-admin-site/zh/guide/advanced/lazy-loading.html
      'plugins': ['dynamic-import-node']
    }
  }
}
