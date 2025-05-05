import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

// 导入并应用mock数据
import './utils/mock'

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'

// 导入uni-ui组件
// import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue'

export function createApp() {
  const app = createSSRApp(App)
  
  // 全局注册uni-ui组件
  // app.component('uni-popup', uniPopup)
  
  // 请求拦截器
  const oriRequest = uni.request
  uni.request = (options) => {
    // 添加baseUrl
    const baseUrl = 'http://localhost:3000'
    if (options.url.indexOf('http') !== 0) {
      options.url = baseUrl + options.url
    }
    
    // 添加token
    const token = uni.getStorageSync('token')
    if (token && !options.header?.Authorization) {
      options.header = {
        ...options.header,
        'Authorization': `Bearer ${token}`
      }
    }
    
    // 响应拦截
    const oriSuccess = options.success
    const oriFail = options.fail
    
    options.success = (res) => {
      // 401未授权处理
      if (res.statusCode === 401) {
        uni.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none'
        })
        // 清除token并跳转到登录页
        uni.removeStorageSync('token')
        uni.navigateTo({
          url: '/pages/login/login'
        })
        return
      }
      
      oriSuccess && oriSuccess(res)
    }
    
    options.fail = (err) => {
      uni.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      })
      oriFail && oriFail(err)
    }
    
    return oriRequest(options)
  }
  
  return {
    app
  }
}
// #endif