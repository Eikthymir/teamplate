/// 自定义npm run
//  实现项目打包时自定预览或者进行项目包大小分析
//  配合package.json的script对象使用

// runjs插件实现各种自定义下的npm run build
const { run } = require('runjs')
// chalk插件实现控制台带颜色打印
const chalk = require('chalk')
const config = require('../vue.config.js')
// process.argv提供node.js进程信息数组，rawArgv从下标为2开始截取
const rawArgv = process.argv.slice(2)
const args = rawArgv.join(' ')

// 检查运行命令是否包含--previwe
// 自定义预览地址
if (process.env.npm_config_preview || rawArgv.includes('--preview')) {
  // 检查是否previe同时report：npm run preview -- --report
  const report = rawArgv.includes('--report')

  // 关于vue-cli-service：https://cli.vuejs.org/zh/guide/cli-service.html#vue-cli-service-serve
  run(`vue-cli-service build ${args}`)

  const port = 9526
  const publicPath = config.publicPath

  // connect是一个基于HTTP服务器的工具集，它提供了一种新的组织代码的方式来和请求、响应对象进行交互，即中间件
  var connect = require('connect')
  // serve-static搭建静态服务器，将下面配置的文件夹下的内容放到服务器中
  var serveStatic = require('serve-static')
  const app = connect()

  // 将publicPath/dist目录下的文件定义为静态资源文件
  app.use(
    publicPath,
    serveStatic('./dist', {
      index: ['index.html', '/']
    })
  )

  app.listen(port, function () {
    console.log(chalk.green(`> Preview at http://localhost:${port}${publicPath}`))
    if (report) {
      console.log(chalk.green(`> Report at http://localhost:${port}${publicPath}report.html`))
    }
  })
} else {
  run(`vue-cli-service build ${args}`)
}
