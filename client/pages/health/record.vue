<template>
  <view class="container">
    <view class="header">
      <view class="title">健康档案</view>
      <view class="date-picker">
        <picker mode="date" :value="currentDate" @change="handleDateChange">
          <view class="picker-text">{{ currentDate }}</view>
        </picker>
      </view>
    </view>

    <view class="content">
      <!-- 健康数据概览 -->
      <view class="overview-card">
        <view class="card-title">健康数据概览</view>
        <view class="data-grid">
          <view class="data-item">
            <text class="label">平均心率</text>
            <text class="value">{{ overview.avgHeartRate || '--' }} BPM</text>
          </view>
          <view class="data-item">
            <text class="label">平均血氧</text>
            <text class="value">{{ overview.avgBloodOxygen || '--' }}%</text>
          </view>
          <view class="data-item">
            <text class="label">平均体温</text>
            <text class="value">{{ overview.avgTemperature || '--' }}°C</text>
          </view>
          <view class="data-item">
            <text class="label">平均血压</text>
            <text class="value">{{ overview.avgBloodPressure || '--' }}/{{ overview.avgBloodPressureLow || '--' }}</text>
          </view>
        </view>
      </view>

      <!-- 健康数据趋势图 -->
      <view class="chart-card">
        <view class="card-title">健康数据趋势</view>
        <view class="chart-container">
          <canvas canvas-id="healthChart" class="chart"></canvas>
        </view>
      </view>

      <!-- 异常记录 -->
      <view class="alert-card">
        <view class="card-title">异常记录</view>
        <view class="alert-list">
          <view class="alert-item" v-for="(alert, index) in alerts" :key="index">
            <view class="alert-time">{{ formatTime(alert.time) }}</view>
            <view class="alert-content">
              <view class="alert-type">{{ alert.type }}</view>
              <view class="alert-desc">{{ alert.description }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

const userStore = useUserStore()
const currentDate = ref(dayjs().format('YYYY-MM-DD'))
const overview = ref({})
const alerts = ref([])
let chart = null

const formatTime = (time) => {
  return dayjs(time).format('HH:mm:ss')
}

const handleDateChange = (e) => {
  currentDate.value = e.detail.value
  loadHealthData()
}

const loadHealthData = async () => {
  try {
    const res = await uni.request({
      url: `http://localhost:3000/api/v1/health/statistics`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`
      },
      data: {
        date: currentDate.value
      }
    })
    if (res.statusCode === 200) {
      overview.value = res.data.data.overview
      alerts.value = res.data.data.alerts
      initChart(res.data.data.trend)
    }
  } catch (error) {
    console.error('获取健康数据失败:', error)
    uni.showToast({
      title: '获取健康数据失败',
      icon: 'none'
    })
  }
}

const initChart = (data) => {
  const ctx = uni.createCanvasContext('healthChart')
  chart = echarts.init(ctx)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['心率', '血氧', '体温']
    },
    xAxis: {
      type: 'category',
      data: data.times
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '心率',
        type: 'line',
        data: data.heartRate
      },
      {
        name: '血氧',
        type: 'line',
        data: data.bloodOxygen
      },
      {
        name: '体温',
        type: 'line',
        data: data.temperature
      }
    ]
  }
  
  chart.setOption(option)
}

onMounted(() => {
  loadHealthData()
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

.date-picker {
  background: #fff;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.content {
  margin-top: 20rpx;
}

.overview-card, .chart-card, .alert-card {
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

.chart-container {
  width: 100%;
  height: 400rpx;
}

.chart {
  width: 100%;
  height: 100%;
}

.alert-list {
  margin-top: 20rpx;
}

.alert-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-time {
  font-size: 24rpx;
  color: #999;
  margin-right: 20rpx;
}

.alert-content {
  flex: 1;
}

.alert-type {
  font-size: 28rpx;
  color: #ff4d4f;
  margin-bottom: 10rpx;
}

.alert-desc {
  font-size: 26rpx;
  color: #666;
}
</style> 