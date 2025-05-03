<template>
  <view class="container">
    <!-- 设备列表 -->
    <view class="device-list">
      <view class="device-item" v-for="(device, index) in devices" :key="index">
        <view class="device-info">
          <image class="device-icon" :src="device.icon" mode="aspectFit"></image>
          <view class="device-details">
            <text class="device-name">{{ device.name }}</text>
            <text class="device-status" :class="device.status">{{ device.statusText }}</text>
          </view>
        </view>
        <view class="device-controls">
          <switch :checked="device.isActive" @change="toggleDevice(device)" />
        </view>
      </view>
    </view>

    <!-- 添加设备按钮 -->
    <view class="add-device">
      <button class="add-button" @click="showAddDeviceModal">添加新设备</button>
    </view>

    <!-- 添加设备弹窗 -->
    <uni-popup ref="popup" type="center">
      <view class="add-device-modal">
        <view class="modal-title">添加新设备</view>
        <view class="modal-content">
          <input class="input" v-model="newDevice.name" placeholder="设备名称" />
          <input class="input" v-model="newDevice.type" placeholder="设备类型" />
          <input class="input" v-model="newDevice.mac" placeholder="设备MAC地址" />
        </view>
        <view class="modal-buttons">
          <button class="cancel-button" @click="closeModal">取消</button>
          <button class="confirm-button" @click="addDevice">确认</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      devices: [],
      newDevice: {
        name: '',
        type: '',
        mac: ''
      }
    }
  },
  onLoad() {
    this.fetchDevices()
  },
  methods: {
    async fetchDevices() {
      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/v1/devices',
          method: 'GET',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        })
        if (response.statusCode === 200) {
          this.devices = response.data.data.map(device => ({
            ...device,
            statusText: device.isActive ? '已连接' : '未连接',
            icon: this.getDeviceIcon(device.type)
          }))
        }
      } catch (error) {
        console.error('获取设备列表失败:', error)
        uni.showToast({
          title: '获取设备列表失败',
          icon: 'none'
        })
      }
    },
    async toggleDevice(device) {
      try {
        const response = await uni.request({
          url: `http://localhost:3000/api/v1/devices/${device.id}/toggle`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        })
        if (response.statusCode === 200) {
          device.isActive = !device.isActive
          device.statusText = device.isActive ? '已连接' : '未连接'
          uni.showToast({
            title: device.isActive ? '设备已连接' : '设备已断开',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('切换设备状态失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    showAddDeviceModal() {
      this.$refs.popup.open()
    },
    closeModal() {
      this.$refs.popup.close()
      this.newDevice = {
        name: '',
        type: '',
        mac: ''
      }
    },
    async addDevice() {
      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/v1/devices',
          method: 'POST',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          },
          data: this.newDevice
        })
        if (response.statusCode === 200) {
          uni.showToast({
            title: '设备添加成功',
            icon: 'success'
          })
          this.closeModal()
          this.fetchDevices()
        }
      } catch (error) {
        console.error('添加设备失败:', error)
        uni.showToast({
          title: '添加设备失败',
          icon: 'none'
        })
      }
    },
    getDeviceIcon(type) {
      const icons = {
        'heart_rate': '/static/images/heart-rate.png',
        'blood_pressure': '/static/images/blood-pressure.png',
        'temperature': '/static/images/temperature.png',
        'default': '/static/images/device.png'
      }
      return icons[type] || icons.default
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
}

.device-list {
  margin-bottom: 100rpx;
}

.device-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.device-info {
  display: flex;
  align-items: center;
}

.device-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
}

.device-details {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.device-status {
  font-size: 24rpx;
  color: #999;
}

.device-status.已连接 {
  color: #3cc51f;
}

.device-status.未连接 {
  color: #ff3b30;
}

.add-device {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 40rpx;
}

.add-button {
  background: #3cc51f;
  color: #fff;
  border-radius: 50rpx;
  padding: 20rpx 0;
  font-size: 32rpx;
}

.add-device-modal {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  width: 600rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
}

.modal-content {
  margin-bottom: 40rpx;
}

.input {
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
}

.cancel-button, .confirm-button {
  width: 45%;
  padding: 20rpx 0;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.cancel-button {
  background: #f8f8f8;
  color: #666;
}

.confirm-button {
  background: #3cc51f;
  color: #fff;
}
</style> 