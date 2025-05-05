<template>
  <view class="container">
    <view class="header">
      <view class="title">设备详情</view>
      <view class="device-status" :class="{ 'online': device.online }">
        {{ device.online ? '在线' : '离线' }}
      </view>
    </view>

    <view class="content">
      <view class="info-card">
        <view class="info-item">
          <text class="label">设备名称</text>
          <text class="value">{{ device.name }}</text>
        </view>
        <view class="info-item">
          <text class="label">设备类型</text>
          <text class="value">{{ device.type }}</text>
        </view>
        <view class="info-item">
          <text class="label">设备序列号</text>
          <text class="value">{{ device.sn }}</text>
        </view>
        <view class="info-item">
          <text class="label">绑定时间</text>
          <text class="value">{{ formatDate(device.bindTime) }}</text>
        </view>
      </view>

      <!-- 实时数据 -->
      <view class="data-card" v-if="device.type === 'band'">
        <view class="card-title">实时数据</view>
        <view class="data-grid">
          <view class="data-item">
            <text class="label">心率</text>
            <text class="value">{{ realTimeData.heartRate || '--' }} BPM</text>
          </view>
          <view class="data-item">
            <text class="label">血氧</text>
            <text class="value">{{ realTimeData.bloodOxygen || '--' }}%</text>
          </view>
          <view class="data-item">
            <text class="label">体温</text>
            <text class="value">{{ realTimeData.temperature || '--' }}°C</text>
          </view>
          <view class="data-item">
            <text class="label">血压</text>
            <text class="value">{{ realTimeData.bloodPressure || '--' }}/{{ realTimeData.bloodPressureLow || '--' }}</text>
          </view>
        </view>
      </view>

      <!-- 环境数据 -->
      <view class="data-card" v-if="device.type === 'sensor'">
        <view class="card-title">环境数据</view>
        <view class="data-grid">
          <view class="data-item">
            <text class="label">温度</text>
            <text class="value">{{ realTimeData.temperature || '--' }}°C</text>
          </view>
          <view class="data-item">
            <text class="label">湿度</text>
            <text class="value">{{ realTimeData.humidity || '--' }}%</text>
          </view>
          <view class="data-item">
            <text class="label">空气质量</text>
            <text class="value">{{ realTimeData.airQuality || '--' }}</text>
          </view>
        </view>
      </view>

      <!-- 雷达数据 -->
      <view class="data-card" v-if="device.type === 'radar'">
        <view class="card-title">监测数据</view>
        <view class="data-grid">
          <view class="data-item">
            <text class="label">呼吸频率</text>
            <text class="value">{{ realTimeData.breathingRate || '--' }} 次/分</text>
          </view>
          <view class="data-item">
            <text class="label">体动状态</text>
            <text class="value">{{ realTimeData.movementStatus || '--' }}</text>
          </view>
          <view class="data-item">
            <text class="label">离床状态</text>
            <text class="value">{{ realTimeData.bedStatus || '--' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import dayjs from 'dayjs'

const userStore = useUserStore()
const device = ref({})
const realTimeData = ref({})
let timer = null

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadDeviceDetail = async (id) => {
  try {
    const res = await uni.request({
      url: `http://localhost:3000/api/v1/devices/${id}`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    if (res.statusCode === 200) {
      device.value = res.data.data
    }
  } catch (error) {
    console.error('获取设备详情失败:', error)
    uni.showToast({
      title: '获取设备详情失败',
      icon: 'none'
    })
  }
}

const loadRealTimeData = async () => {
  try {
    const res = await uni.request({
      url: `http://localhost:3000/api/v1/devices/${device.value.id}/data`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    if (res.statusCode === 200) {
      realTimeData.value = res.data.data
    }
  } catch (error) {
    console.error('获取实时数据失败:', error)
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const deviceId = currentPage.$page?.options?.id

  if (deviceId) {
    loadDeviceDetail(deviceId)
    // 每5秒更新一次实时数据
    timer = setInterval(loadRealTimeData, 5000)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.device-status {
  font-size: 24rpx;
  color: #999;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  background: #f8f8f8;
}

.device-status.online {
  color: #3cc51f;
  background: rgba(60, 197, 31, 0.1);
}

.content {
  margin-top: 20rpx;
}

.info-card, .data-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 28rpx;
  color: #333;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.data-item {
  background: #f8f8f8;
  padding: 20rpx;
  border-radius: 10rpx;
  text-align: center;
}

.data-item .label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.data-item .value {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}
</style> 