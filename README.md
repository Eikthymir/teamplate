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
├── pages                      # views 所有页面
├── static                     # 静态资源 图片 图标等
├── store                      # 全局 store管理
├── .gitignore                 # git提交时忽略文件
├── apiconfig.js               # api配置
├── App.vue                    # 入口页面
├── main.js                    # 入口文件 加载组件 初始化等
├── mainfest.json              # app配置
├── pages.json                 # 路由配置
├── uni.scss                   # uni-app内置的常用样式
```
