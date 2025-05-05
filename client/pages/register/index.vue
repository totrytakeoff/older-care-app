<template>
  <view class="container">
    <view class="register-box">
      <view class="title">注册账号</view>
      <view class="subtitle">加入我们，开启智能健康监护</view>

      <view class="form">
        <view class="input-group">
          <text class="label">手机号</text>
          <input class="input" type="number" v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </view>
        <view class="input-group">
          <text class="label">密码</text>
          <input class="input" type="password" v-model="form.password" placeholder="请输入密码" />
        </view>
        <view class="input-group">
          <text class="label">确认密码</text>
          <input class="input" type="password" v-model="form.confirmPassword" placeholder="请再次输入密码" />
        </view>
        <view class="input-group">
          <text class="label">角色</text>
          <picker class="picker" @change="handleRoleChange" :value="roleIndex" :range="roles">
            <view class="picker-text">{{ roles[roleIndex] }}</view>
          </picker>
        </view>

        <view class="button-group">
          <button class="register-button" @click="handleRegister">注册</button>
          <button class="back-button" @click="goToLogin">返回登录</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { register } from '@/api/user'

const form = reactive({
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'elder' // 默认角色为老人
})

const roles = ['老人', '家属', '医生']
const roleIndex = ref(0)

const handleRoleChange = (e) => {
  roleIndex.value = e.detail.value
  form.role = ['elder', 'family', 'doctor'][e.detail.value]
}

const handleRegister = async () => {
  if (!form.phone || !form.password || !form.confirmPassword) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  if (form.password !== form.confirmPassword) {
    uni.showToast({
      title: '两次输入的密码不一致',
      icon: 'none'
    })
    return
  }

  try {
    await register({
      phone: form.phone,
      password: form.password,
      role: form.role
    })
    
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('注册失败:', error)
    uni.showToast({
      title: error.message || '注册失败，请稍后重试',
      icon: 'none'
    })
  }
}

const goToLogin = () => {
  uni.navigateBack()
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
  background: #f8f8f8;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.button-group {
  margin-top: 60rpx;
}

.register-button, .back-button {
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

.back-button {
  background: #f8f8f8;
  color: #666;
}
</style> 