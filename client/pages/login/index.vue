<template>
  <view class="container">
    <view class="login-box">
      <view class="title">老年人健康监测系统</view>
      <view class="subtitle">关爱老人健康，从点滴做起</view>

      <view class="form">
        <view class="input-group">
          <text class="label">手机号</text>
          <input class="input" type="number" v-model="phone" placeholder="请输入手机号" maxlength="11" />
        </view>
        <view class="input-group">
          <text class="label">密码</text>
          <input class="input" type="password" v-model="password" placeholder="请输入密码" />
        </view>

        <view class="button-group">
          <button class="login-button" @click="login">登录</button>
          <button class="register-button" @click="navigateTo('/pages/register/index')">注册账号</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phone: '',
      password: ''
    }
  },
  methods: {
    async login() {
      if (!this.phone || !this.password) {
        uni.showToast({
          title: '请输入手机号和密码',
          icon: 'none'
        })
        return
      }

      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/v1/auth/login',
          method: 'POST',
          data: {
            phone: this.phone,
            password: this.password
          }
        })

        if (response.statusCode === 200) {
          uni.setStorageSync('token', response.data.data.token)
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: response.data.message || '登录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none'
        })
      }
    },
    navigateTo(url) {
      uni.navigateTo({
        url
      })
    }
  }
}
</script>

<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx;
  width: 600rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  text-align: center;
  color: #666;
  margin-bottom: 60rpx;
}

.form {
  margin-top: 40rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.input {
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background: #f8f8f8;
}

.button-group {
  margin-top: 60rpx;
}

.login-button, .register-button {
  width: 100%;
  padding: 20rpx 0;
  border-radius: 10rpx;
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.login-button {
  background: #3cc51f;
  color: #fff;
}

.register-button {
  background: #f8f8f8;
  color: #666;
}
</style> 