'use strict'
// 实际在node环境中运行路径
const path = require('path')

const name = 'Vue Template Cli3.0'

// 如果端口设置为80，使用管理员权限执行命令行
// 例如，Mac:sudo npm run
// 可以通过以下方法更改端口：
// 端口=9527 npm run dev或npm run dev --port=9527
const port = process.env.port || process.env.npm_config_port || 9527 // 开发环境接口

function resolve(dir) {
  // 合并路径
  return path.join(__dirname, dir)
}

// https://cli.vuejs.org/zh/config/
module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    before: require('./mock/mock-server.js')
  },
  configureWebpack: {
    name: name, // 往index.html注入自定义标题
    resolve: {
      alias: {
        '@': resolve('src') // 用@作为src的别名简写引入
      }
    }
  },
  chainWebpack(config) {
    // 提高首页加载速度，建议开启预载
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // 忽略runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // 移除prefetch(预先加载模块)，减少多页面时无意义的请求
    config.plugins.delete('prefetch')

    // 设置svg-sprite-loader插件(未安装)
    //   config.module
    //   .rule('svg')
    //   .exclude.add(resolve('src/icons'))
    //   .end()
    // config.module
    //   .rule('icons')
    //   .test(/\.svg$/)
    //   .include.add(resolve('src/icons'))
    //   .end()
    //   .use('svg-sprite-loader')
    //   .loader('svg-sprite-loader')
    //   .options({
    //     symbolId: 'icon-[name]'
    //   })
    //   .end()

    // 配置生产环境打包时候文件分割
    config.when(process.env.NODE_ENV !== 'development',
      config => {
        config
        // 将runtime代码内联在index.html,
        // 配合config.optimization.runtimeChunk('single')单独抽离打包runtime
        // 从而消除改动路由影响含runtime代码的app.hash.js,进而影响其它路由js文件
          .plugin('ScriptExtHtmlWebpackPlugin')
          .after('html')
          .use('script-ext-html-webpack-plugin', [{
            // 'runtime'必须和runtimeChunk名称相同
            inline: /runtime\..*\.js$/
          }])
          .end()
        config
          .optimization.splitChunks({
            chunks: 'all',
            cacheGroups: {
              libs: {
                name: 'chunk-libs',
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
                chunks: 'initial' // only package third parties that are initially dependent
              },
              commons: {
                name: 'chunk-commons',
                test: resolve('src/components'), // can customize your rules
                minChunks: 3, //  minimum common number
                priority: 5,
                reuseExistingChunk: true
              }
            }
          })
        // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
        config.optimization.runtimeChunk('single')
      }
    )
  }
}
