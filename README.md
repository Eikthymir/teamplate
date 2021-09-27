## 简介
[vue-template-cli4.0](https://github.com/Eikthymir/vue-my-teamplate-cli3.0)提供request封装，store分离，样式表分离帮助快速你快速搭建uni-app原型
更多信息请参考 [使用文档](https://uniapp.dcloud.io)

## 前序准备
你需要用HbuildX等IDE创建项目，然后将项目文件复制至新项目

### 目录结构
```bash
├── common                     # 公共文件
│   ├── api                    # 所有请求
│   ├── css                    # css文件
│   ├── scss                   # scss文件
│   ├── utils                  # 全局公用方法 请求封装等
├── components                 # 全局公用组件
│   ├── base                   # 基础组件，可通过easycom方式引入
│   ├── common                 # 页面公用组件
│   ├── external               # 第三方组件
├── pages                      # views 所有页面
├── static                     # 静态资源 图片 图标等
│   ├── certificate            # 证书
│   ├── font                   # 阿里图标
│   ├── icon                   # 本地icon
│   ├── image                  # 图片
│   ├── splash                 # 苹果splash启动图
├── store                      # 全局 store管理
├── .gitignore                 # git提交时忽略文件
├── config.js               # api配置
├── App.vue                    # 入口页面
├── main.js                    # 入口文件 加载组件 初始化等
├── mainfest.json              # app配置
├── pages.json                 # 路由配置
├── uni.scss                   # uni-app内置的常用样式
```
