'use strict'
const path = require('path')
const name = 'Vue Template Cli3.0'
const port = process.env.port || process.env.npm_config_port || 9527 // 开发环境接口

function resolve(dir) {
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
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    // 提高首页加载速度，建议开启预载
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

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
          .plugin('ScriptExtHtmlWebpackPlugin')
          .after('html')
          .use('script-ext-html-webpack-plugin', [{
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
