<template>
  <view class="container">
    <view class="register-box">
      <view class="title">注册账号</view>
      <view class="subtitle">请填写以下信息完成注册</view>

      <view class="form">
        <view class="input-group">
          <text class="label">手机号</text>
          <input class="input" type="number" v-model="phone" placeholder="请输入手机号" maxlength="11" />
        </view>
        <view class="input-group">
          <text class="label">密码</text>
          <input class="input" type="password" v-model="password" placeholder="请输入密码" />
        </view>
        <view class="input-group">
          <text class="label">确认密码</text>
          <input class="input" type="password" v-model="confirmPassword" placeholder="请再次输入密码" />
        </view>
        <view class="input-group">
          <text class="label">用户角色</text>
          <picker @change="bindPickerChange" :value="roleIndex" :range="roles">
            <view class="picker">
              {{roles[roleIndex]}}
            </view>
          </picker>
        </view>

        <view class="button-group">
          <button class="register-button" @click="register">注册</button>
          <button class="login-button" @click="navigateTo('/pages/login/index')">已有账号？去登录</button>
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
      password: '',
      confirmPassword: '',
      roleIndex: 0,
      roles: ['老人', '家属', '医生']
    }
  },
  methods: {
    bindPickerChange(e) {
      this.roleIndex = e.detail.value
    },
    async register() {
      if (!this.phone || !this.password || !this.confirmPassword) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      if (this.password !== this.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        })
        return
      }

      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/v1/auth/register',
          method: 'POST',
          data: {
            phone: this.phone,
            password: this.password,
            role: this.roles[this.roleIndex]
          }
        })

        if (response.statusCode === 200) {
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.data.message || '注册失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('注册失败:', error)
        uni.showToast({
          title: '注册失败，请稍后重试',
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

.register-box {
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

.picker {
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background: #f8f8f8;
  color: #333;
}

.button-group {
  margin-top: 60rpx;
}

.register-button, .login-button {
  width: 100%;
  padding: 20rpx 0;
  border-radius: 10rpx;
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.register-button {
  background: #3cc51f;
  color: #fff;
}

.login-button {
  background: #f8f8f8;
  color: #666;
}
</style> 