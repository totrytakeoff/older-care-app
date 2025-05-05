<template>
  <view class="container">
    <view class="header">
      <view class="title">设备管理</view>
      <button class="add-button" @click="showAddDevice = true">添加设备</button>
    </view>

    <view class="device-list">
      <view class="device-card" v-for="device in devices" :key="device.id">
        <view class="device-info">
          <view class="device-name">{{ device.name }}</view>
          <view class="device-type">{{ device.type }}</view>
          <view class="device-status" :class="{ 'online': device.online }">
            {{ device.online ? '在线' : '离线' }}
          </view>
        </view>
        <view class="device-actions">
          <button class="action-button" @click="handleDeviceDetail(device)">详情</button>
          <button class="action-button delete" @click="handleUnbindDevice(device)">解绑</button>
        </view>
      </view>
    </view>

    <!-- 添加设备弹窗 -->
    <u-popup v-model="showAddDevice" mode="center" width="80%">
      <view class="popup-content">
        <view class="popup-title">添加设备</view>
        <view class="form">
          <view class="input-group">
            <text class="label">设备类型</text>
            <picker class="picker" @change="handleTypeChange" :value="typeIndex" :range="deviceTypes">
              <view class="picker-text">{{ deviceTypes[typeIndex] }}</view>
            </picker>
          </view>
          <view class="input-group">
            <text class="label">设备序列号</text>
            <input class="input" v-model="newDevice.sn" placeholder="请输入设备序列号" />
          </view>
          <view class="button-group">
            <button class="confirm-button" @click="handleAddDevice">确认添加</button>
            <button class="cancel-button" @click="showAddDevice = false">取消</button>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const devices = ref([])
const showAddDevice = ref(false)
const deviceTypes = ['智能手环', '毫米波雷达', '环境传感器']
const typeIndex = ref(0)

const newDevice = reactive({
  type: 'band',
  sn: ''
})

const handleTypeChange = (e) => {
  typeIndex.value = e.detail.value
  newDevice.type = ['band', 'radar', 'sensor'][e.detail.value]
}

const loadDevices = async () => {
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/api/v1/devices',
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    if (res.statusCode === 200) {
      devices.value = res.data.data
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
    uni.showToast({
      title: '获取设备列表失败',
      icon: 'none'
    })
  }
}

const handleAddDevice = async () => {
  if (!newDevice.sn) {
    uni.showToast({
      title: '请输入设备序列号',
      icon: 'none'
    })
    return
  }

  try {
    const res = await uni.request({
      url: 'http://localhost:3000/api/v1/devices/bind',
      method: 'POST',
      header: {
        Authorization: `Bearer ${userStore.token}`
      },
      data: newDevice
    })

    if (res.statusCode === 200) {
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })
      showAddDevice.value = false
      loadDevices()
    }
  } catch (error) {
    console.error('添加设备失败:', error)
    uni.showToast({
      title: error.message || '添加设备失败',
      icon: 'none'
    })
  }
}

const handleUnbindDevice = async (device) => {
  try {
    const res = await uni.request({
      url: `http://localhost:3000/api/v1/devices/${device.id}/unbind`,
      method: 'POST',
      header: {
        Authorization: `Bearer ${userStore.token}`
      }
    })

    if (res.statusCode === 200) {
      uni.showToast({
        title: '解绑成功',
        icon: 'success'
      })
      loadDevices()
    }
  } catch (error) {
    console.error('解绑设备失败:', error)
    uni.showToast({
      title: error.message || '解绑设备失败',
      icon: 'none'
    })
  }
}

const handleDeviceDetail = (device) => {
  uni.navigateTo({
    url: `/pages/device/detail?id=${device.id}`
  })
}

onMounted(() => {
  loadDevices()
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

.add-button {
  background: #3cc51f;
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
}

.device-list {
  margin-top: 20rpx;
}

.device-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.device-info {
  margin-bottom: 20rpx;
}

.device-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.device-type {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
}

.device-status {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.device-status.online {
  color: #3cc51f;
}

.device-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.action-button {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  background: #f8f8f8;
  color: #333;
}

.action-button.delete {
  background: #ff4d4f;
  color: #fff;
}

.popup-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.form {
  margin-top: 20rpx;
}

.input-group {
  margin-bottom: 20rpx;
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
  margin-top: 30rpx;
  display: flex;
  gap: 20rpx;
}

.confirm-button, .cancel-button {
  flex: 1;
  padding: 20rpx 0;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.confirm-button {
  background: #3cc51f;
  color: #fff;
}

.cancel-button {
  background: #f8f8f8;
  color: #666;
}
</style> 