<template>
	<view class="container">
		<view class="header">
			<text class="welcome">您好，老人用户</text>
			<text class="date">{{ currentDate }}</text>
		</view>
		
		<view class="health-card">
			<view class="card-title">
				<text>实时健康数据</text>
				<text class="refresh" @click="fetchHealthData">刷新</text>
			</view>
			<view class="health-data" v-if="healthData">
				<view class="data-item">
					<text class="data-value">{{ healthData.heartRate }}</text>
					<text class="data-label">心率(次/分)</text>
				</view>
				<view class="data-item">
					<text class="data-value">{{ healthData.bloodPressure.systolic }}/{{ healthData.bloodPressure.diastolic }}</text>
					<text class="data-label">血压(mmHg)</text>
				</view>
				<view class="data-item">
					<text class="data-value">{{ healthData.bloodOxygen }}%</text>
					<text class="data-label">血氧</text>
				</view>
			</view>
			<view class="no-data" v-else>
				<text>暂无数据，请连接设备</text>
			</view>
		</view>
		
		<view class="device-card">
			<view class="card-title">
				<text>我的设备</text>
				<text class="more" @click="goToDevicePage">更多</text>
			</view>
			<view class="device-list" v-if="devices.length > 0">
				<view class="device-item" v-for="(device, index) in devices" :key="index">
					<view class="device-info">
						<text class="device-name">{{ getDeviceTypeName(device.type) }}</text>
						<text class="device-id">ID: {{ device.deviceId }}</text>
					</view>
					<view class="device-status">
						<text :class="['status-tag', device.online ? 'online' : 'offline']">
							{{ device.online ? '在线' : '离线' }}
						</text>
						<text class="battery">电量: {{ device.battery }}%</text>
					</view>
				</view>
			</view>
			<view class="no-data" v-else>
				<text>暂无绑定设备</text>
				<button class="add-device-btn" @click="goToDevicePage">添加设备</button>
			</view>
		</view>
		
		<view class="alert-card">
			<view class="card-title">
				<text>最近报警</text>
				<text class="more" @click="goToAlertPage">更多</text>
			</view>
			<view class="alert-list" v-if="alerts.length > 0">
				<view class="alert-item" v-for="(alert, index) in alerts" :key="index">
					<view class="alert-info">
						<text class="alert-type">{{ getAlertTypeName(alert.type) }}</text>
						<text class="alert-time">{{ formatTime(alert.timestamp) }}</text>
					</view>
					<text :class="['alert-status', alert.status === 'resolved' ? 'resolved' : 'pending']">
						{{ alert.status === 'resolved' ? '已处理' : '待处理' }}
					</text>
				</view>
			</view>
			<view class="no-data" v-else>
				<text>暂无报警记录</text>
			</view>
		</view>
		
		<view class="action-buttons">
			<button class="action-btn emergency" @click="triggerEmergencyAlert">紧急求助</button>
			<button class="action-btn health-report" @click="goToHealthReport">健康报告</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const currentDate = computed(() => {
	const date = new Date();
	return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
});

const healthData = ref(null);
const devices = ref([]);
const alerts = ref([]);

// 获取健康数据
const fetchHealthData = async () => {
	try {
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId') || 1; // 默认用户ID为1
		
		const response = await uni.request({
			url: `http://localhost:3000/api/v1/health/real-time?userId=${userId}`,
			method: 'GET',
			header: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		const result = response.data;
		if (result.code === 200) {
			healthData.value = result;
		} else {
			console.error('获取健康数据失败:', result.message);
		}
	} catch (error) {
		console.error('获取健康数据错误:', error);
	}
};

// 获取设备列表
const fetchDevices = async () => {
	// 模拟数据，实际项目中应该调用API
	devices.value = [
		{
			deviceId: 'DW2023001',
			type: 'watch',
			online: true,
			battery: 85
		},
		{
			deviceId: 'DR2023002',
			type: 'radar',
			online: false,
			battery: 60
		}
	];
};

// 获取报警记录
const fetchAlerts = async () => {
	try {
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId') || 1;
		
		const response = await uni.request({
			url: `http://localhost:3000/api/v1/alerts?userId=${userId}&pageSize=3`,
			method: 'GET',
			header: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		const result = response.data;
		if (result.code === 200) {
			alerts.value = result.data;
		} else {
			console.error('获取报警记录失败:', result.message);
		}
	} catch (error) {
		console.error('获取报警记录错误:', error);
	}
};

// 触发紧急求助
const triggerEmergencyAlert = async () => {
	try {
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId') || 1;
		
		uni.showModal({
			title: '紧急求助',
			content: '确定发送紧急求助信息吗？',
			success: async (res) => {
				if (res.confirm) {
					const response = await uni.request({
						url: 'http://localhost:3000/api/v1/alerts/trigger',
						method: 'POST',
						header: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
						},
						data: {
							userId: userId,
							type: 'heartRate',
							location: '卧室'
						}
					});
					
					const result = response.data;
					if (result.code === 201) {
						uni.showToast({
							title: '已发送紧急求助',
							icon: 'success'
						});
						// 重新获取报警记录
						fetchAlerts();
					} else {
						uni.showToast({
							title: '发送求助失败',
							icon: 'none'
						});
					}
				}
			}
		});
	} catch (error) {
		console.error('紧急求助错误:', error);
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
};

// 设备类型名称
const getDeviceTypeName = (type) => {
	const typeMap = {
		'watch': '智能手表',
		'radar': '毫米波雷达',
		'sensor': '环境传感器'
	};
	return typeMap[type] || '未知设备';
};

// 报警类型名称
const getAlertTypeName = (type) => {
	const typeMap = {
		'fall': '跌倒报警',
		'heartRate': '心率异常',
		'bloodPressure': '血压异常'
	};
	return typeMap[type] || '未知报警';
};

// 格式化时间
const formatTime = (timeString) => {
	const date = new Date(timeString);
	return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`;
};

// 页面导航
const goToDevicePage = () => {
	uni.navigateTo({
		url: '/pages/elderly/device'
	});
};

const goToAlertPage = () => {
	uni.navigateTo({
		url: '/pages/family/alert'
	});
};

const goToHealthReport = () => {
	uni.navigateTo({
		url: '/pages/common/health-report'
	});
};

onMounted(() => {
	fetchHealthData();
	fetchDevices();
	fetchAlerts();
});
</script>

<style>
.container {
	padding: 30rpx;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.welcome {
	font-size: 36rpx;
	font-weight: bold;
}

.date {
	font-size: 28rpx;
	color: #666;
}

.health-card, .device-card, .alert-card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-title {
	display: flex;
	justify-content: space-between;
	margin-bottom: 20rpx;
	font-size: 32rpx;
	font-weight: bold;
}

.refresh, .more {
	font-size: 28rpx;
	color: #007AFF;
	font-weight: normal;
}

.health-data {
	display: flex;
	justify-content: space-between;
}

.data-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.data-value {
	font-size: 42rpx;
	font-weight: bold;
	color: #007AFF;
	margin-bottom: 10rpx;
}

.data-label {
	font-size: 24rpx;
	color: #666;
}

.device-list, .alert-list {
	margin-top: 20rpx;
}

.device-item, .alert-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.device-item:last-child, .alert-item:last-child {
	border-bottom: none;
}

.device-name {
	font-size: 32rpx;
	margin-bottom: 10rpx;
}

.device-id {
	font-size: 24rpx;
	color: #999;
}

.status-tag {
	padding: 4rpx 16rpx;
	border-radius: 30rpx;
	font-size: 24rpx;
	margin-bottom: 10rpx;
}

.online {
	background-color: #e6f7e6;
	color: #36b336;
}

.offline {
	background-color: #f7e6e6;
	color: #b33636;
}

.battery {
	font-size: 24rpx;
	color: #666;
}

.alert-type {
	font-size: 32rpx;
	margin-bottom: 10rpx;
}

.alert-time {
	font-size: 24rpx;
	color: #999;
}

.alert-status {
	padding: 4rpx 16rpx;
	border-radius: 30rpx;
	font-size: 24rpx;
}

.pending {
	background-color: #fff0e6;
	color: #ff9500;
}

.resolved {
	background-color: #e6f7e6;
	color: #36b336;
}

.no-data {
	text-align: center;
	padding: 40rpx 0;
	color: #999;
}

.add-device-btn {
	margin-top: 20rpx;
	background-color: #f0f0f0;
	color: #666;
	font-size: 28rpx;
	height: 70rpx;
	line-height: 70rpx;
}

.action-buttons {
	display: flex;
	justify-content: space-between;
	margin-top: 20rpx;
}

.action-btn {
	width: 48%;
	height: 100rpx;
	line-height: 100rpx;
	border-radius: 16rpx;
	font-size: 32rpx;
}

.emergency {
	background-color: #ff3b30;
	color: #fff;
}

.health-report {
	background-color: #007AFF;
	color: #fff;
}
</style> 