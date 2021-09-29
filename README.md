### 目录结构
```bash
├── build                      # 构建相关
├── mock                       # 项目mock 模拟数据
├── public                     # 静态资源
│   │── favicon.ico            # favicon图标
│   └── index.html             # html模板
├── src                        # 源代码
│   ├── api                    # 所有请求
│   ├── assets                 # 主题 字体等静态资源
│   ├── components             # 全局公用组件
│   ├── router                 # 路由
│   ├── store                  # 全局 store管理
│   ├── styles                 # 全局样式
│   ├── utils                  # 全局公用方法
│   ├── pages                  # pages 所有页面
│   ├── App.vue                # 入口页面
│   ├── main.js                # 入口文件 加载组件 初始化等
│   └── permission.js          # 权限管理
├── tests                      # 测试
├── .editorconfig              # 编辑器配置
├── .env.xxx                   # 环境变量配置
├── .eslintignore              # eslint 忽略
├── .eslintrc.js               # eslint 配置项
├── .gitignore                 # git提交时忽略文件
├── .babel.config.js           # babel 配置
├── .jest.config.js            # jest测试 配置
├── .jsconfig.js               # js 配置指定根目录功能选项
├── postcss.config.js          # postcss 配置 
└── package.json               # package.json
├── vue.config.js              # vue-cli 配置
```

### 项目引导
```bash
# 项目运行
-> 查看package.json(自定义script查看build/index.js)
-> 查看vue.config.js(基本配置如端口，路径配置，webpack配置)
-> 查看main.js(引入样式表src/styles，路由拦截src/permission等)
-> 查看router(页面路由配置，如果多页面可以在module下面按需分离)
-> 查看pages

# 请求
-> 查看mock
-> 查看api
-> 查看store
```

## 开发

```bash
# 克隆项目
git clone -b i18n git@github.com:PanJiaChen/vue-element-admin.git

# 进入项目目录
cd vue-element-admin

# 安装依赖,建议不要直接使用 cnpm 安装依赖
npm/cnpm/yarn install

# 启动服务
npm run serve
```

浏览器访问 http://localhost:9527

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

## 其它

```bash
# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```
