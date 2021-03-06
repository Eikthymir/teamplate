import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

Vue.use(Vuex)

// 通过指定目录搜索目录下的.js文件
// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFile = require.context('./modules', true, /\.js/)

// 自动引入所有modules下的文件
const modules = modulesFile.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFile(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

const store = new Vuex.Store({
  modules,
  getters
})

export default store



