<template>
  <view class="container">
    <!-- 健康数据卡片 -->
    <view class="health-card">
      <view class="card-title">实时健康数据</view>
      <view class="data-grid">
        <view class="data-item">
          <text class="label">心率</text>
          <text class="value">{{ healthData.heartRate || '--' }}</text>
          <text class="unit">bpm</text>
        </view>
        <view class="data-item">
          <text class="label">血氧</text>
          <text class="value">{{ healthData.spo2 || '--' }}</text>
          <text class="unit">%</text>
        </view>
        <view class="data-item">
          <text class="label">血压</text>
          <text class="value">{{ healthData.bloodPressure || '--' }}</text>
          <text class="unit">mmHg</text>
        </view>
        <view class="data-item">
          <text class="label">体温</text>
          <text class="value">{{ healthData.temperature || '--' }}</text>
          <text class="unit">°C</text>
        </view>
      </view>
    </view>

    <!-- 健康趋势图表 -->
    <view class="chart-card">
      <view class="card-title">健康趋势</view>
      <view class="chart-container">
        <canvas canvas-id="healthChart" class="chart"></canvas>
      </view>
    </view>

    <!-- 异常提醒 -->
    <view class="alert-card" v-if="hasAlerts">
      <view class="card-title">异常提醒</view>
      <view class="alert-list">
        <view class="alert-item" v-for="(alert, index) in alerts" :key="index">
          <text class="alert-time">{{ alert.time }}</text>
          <text class="alert-content">{{ alert.content }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      healthData: {
        heartRate: null,
        spo2: null,
        bloodPressure: null,
        temperature: null
      },
      alerts: [],
      hasAlerts: false
    }
  },
  onLoad() {
    this.fetchHealthData()
    this.fetchAlerts()
  },
  methods: {
    async fetchHealthData() {
      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/v1/health/real-time',
          method: 'GET',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        })
        if (response.statusCode === 200) {
          this.healthData = response.data.data
        }
      } catch (error) {
        console.error('获取健康数据失败:', error)
        uni.showToast({
          title: '获取健康数据失败',
          icon: 'none'
        })
      }
    },
    async fetchAlerts() {
      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/v1/alerts',
          method: 'GET',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        })
        if (response.statusCode === 200) {
          this.alerts = response.data.data
          this.hasAlerts = this.alerts.length > 0
        }
      } catch (error) {
        console.error('获取异常提醒失败:', error)
      }
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
}

.health-card, .chart-card, .alert-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
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
  border-radius: 15rpx;
  text-align: center;
}

.label {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin: 10rpx 0;
}

.unit {
  font-size: 24rpx;
  color: #999;
}

.chart-container {
  height: 400rpx;
}

.alert-list {
  margin-top: 20rpx;
}

.alert-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.alert-time {
  font-size: 24rpx;
  color: #999;
  margin-right: 20rpx;
}

.alert-content {
  font-size: 28rpx;
  color: #333;
}
</style> 