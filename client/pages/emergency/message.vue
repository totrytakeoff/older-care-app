<template>
  <view class="container">
    <view class="header">
      <view class="title">发送求助短信</view>
    </view>

    <view class="content">
      <view class="message-card">
        <view class="form-item">
          <view class="label">接收人</view>
          <input class="input" v-model="phone" disabled />
        </view>

        <view class="form-item">
          <view class="label">短信内容</view>
          <textarea
            class="textarea"
            v-model="content"
            placeholder="请输入短信内容"
            :maxlength="200"
          />
          <view class="word-count">{{ content.length }}/200</view>
        </view>

        <view class="form-item">
          <view class="label">位置信息</view>
          <view class="location-info">
            <text class="location-text">{{ location || '未获取位置信息' }}</text>
            <button class="location-button" @click="getLocation">获取位置</button>
          </view>
        </view>

        <view class="form-item">
          <view class="label">健康数据</view>
          <view class="health-data">
            <view class="health-item">
              <text class="label">心率</text>
              <text class="value">{{ healthData.heartRate || '--' }} bpm</text>
            </view>
            <view class="health-item">
              <text class="label">血氧</text>
              <text class="value">{{ healthData.bloodOxygen || '--' }}%</text>
            </view>
            <view class="health-item">
              <text class="label">体温</text>
              <text class="value">{{ healthData.temperature || '--' }}°C</text>
            </view>
          </view>
        </view>

        <button class="submit-button" @click="handleSubmit">发送短信</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const phone = ref('')
const content = ref('')
const location = ref('')
const healthData = ref({})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.$page?.options
  if (options?.phone) {
    phone.value = options.phone
  }
  loadHealthData()
})

const loadHealthData = async () => {
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/api/v1/health/realtime',
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    if (res.statusCode === 200) {
      healthData.value = res.data.data
    }
  } catch (error) {
    console.error('获取健康数据失败:', error)
  }
}

const getLocation = () => {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      const { latitude, longitude } = res
      location.value = `${latitude},${longitude}`
    },
    fail: () => {
      uni.showToast({
        title: '获取位置失败',
        icon: 'none'
      })
    }
  })
}

const handleSubmit = async () => {
  if (!content.value) {
    uni.showToast({
      title: '请输入短信内容',
      icon: 'none'
    })
    return
  }

  try {
    const res = await uni.request({
      url: 'http://localhost:3000/api/v1/emergency/message',
      method: 'POST',
      header: {
        Authorization: `Bearer ${userStore.token}`
      },
      data: {
        phone: phone.value,
        content: content.value,
        location: location.value,
        healthData: healthData.value
      }
    })
    if (res.statusCode === 200) {
      uni.showToast({
        title: '发送成功',
        icon: 'success'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('发送短信失败:', error)
    uni.showToast({
      title: error.message || '发送失败',
      icon: 'none'
    })
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
}

.header {
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.content {
  margin-top: 20rpx;
}

.message-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.textarea {
  width: 100%;
  height: 200rpx;
  background: #f8f8f8;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.word-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f8f8;
  border-radius: 10rpx;
  padding: 20rpx;
}

.location-text {
  font-size: 28rpx;
  color: #666;
  flex: 1;
}

.location-button {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  background: #3cc51f;
  color: #fff;
  border-radius: 30rpx;
  margin-left: 20rpx;
}

.health-data {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  background: #f8f8f8;
  border-radius: 10rpx;
  padding: 20rpx;
}

.health-item {
  text-align: center;
}

.health-item .label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.health-item .value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.submit-button {
  width: 100%;
  height: 88rpx;
  background: #3cc51f;
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
  margin-top: 40rpx;
}
</style> 