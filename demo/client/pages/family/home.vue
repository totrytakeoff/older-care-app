<template>
	<view class="container">
		<view class="header">
			<text class="welcome">您好，家属用户</text>
			<text class="date">{{ currentDate }}</text>
		</view>
		
		<view class="elderly-section">
			<view class="section-title">
				<text>关注的老人</text>
				<text class="more">添加</text>
			</view>
			<view class="elderly-list">
				<view class="elderly-item" @click="switchElderly(elderly)" v-for="(elderly, index) in elderlyList" :key="index">
					<view class="elderly-info">
						<view class="elderly-avatar"></view>
						<text class="elderly-name">{{ elderly.name }}</text>
					</view>
					<text :class="['elderly-status', elderly.online ? 'online' : 'offline']">
						{{ elderly.online ? '在线' : '离线' }}
					</text>
				</view>
			</view>
		</view>
		
		<view class="health-overview">
			<view class="section-title">
				<text>{{ currentElderly.name }}的健康概况</text>
				<text class="time">{{ lastUpdateTime }}</text>
			</view>
			
			<view class="health-data-cards">
				<view class="health-card">
					<text class="card-title">心率</text>
					<text class="card-value">{{ healthData.heartRate }}</text>
					<text class="card-unit">次/分</text>
				</view>
				<view class="health-card">
					<text class="card-title">血压</text>
					<text class="card-value">{{ healthData.bloodPressure.systolic }}/{{ healthData.bloodPressure.diastolic }}</text>
					<text class="card-unit">mmHg</text>
				</view>
				<view class="health-card">
					<text class="card-title">血氧</text>
					<text class="card-value">{{ healthData.bloodOxygen }}</text>
					<text class="card-unit">%</text>
				</view>
			</view>
		</view>
		
		<view class="alert-section">
			<view class="section-title">
				<text>最近报警</text>
				<text class="more" @click="goToAlertPage">更多</text>
			</view>
			
			<view v-if="alerts.length > 0" class="alert-list">
				<view class="alert-item" v-for="(alert, index) in alerts" :key="index">
					<view class="alert-info">
						<text class="alert-type">{{ getAlertTypeName(alert.type) }}</text>
						<text class="alert-location">{{ alert.location }}</text>
						<text class="alert-time">{{ formatTime(alert.timestamp) }}</text>
					</view>
					<view class="alert-action">
						<button 
							v-if="alert.status === 'pending'" 
							class="handle-btn" 
							@click="handleAlert(alert.id)"
						>处理</button>
						<text v-else class="alert-handled">已处理</text>
					</view>
				</view>
			</view>
			
			<view v-else class="no-data">
				<text>暂无报警记录</text>
			</view>
		</view>
		
		<view class="action-buttons">
			<button class="action-btn call" @click="callElderly">视频通话</button>
			<button class="action-btn report" @click="goToHealthReport">健康报告</button>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const currentDate = computed(() => {
	const date = new Date();
	return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
});

const lastUpdateTime = ref('刚刚更新');
const elderlyList = ref([
	{ id: 1, name: '张爷爷', online: true },
	{ id: 2, name: '李奶奶', online: false }
]);
const currentElderly = ref(elderlyList.value[0]);
const healthData = ref({
	heartRate: 75,
	bloodPressure: {
		systolic: 125,
		diastolic: 85
	},
	bloodOxygen: 98
});
const alerts = ref([]);

// 切换关注的老人
const switchElderly = (elderly) => {
	currentElderly.value = elderly;
	fetchHealthData(elderly.id);
	fetchAlerts(elderly.id);
};

// 获取健康数据
const fetchHealthData = async (elderlyId) => {
	try {
		const token = uni.getStorageSync('token');
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: `/api/v1/health/real-time?userId=${elderlyId}`,
			method: 'GET',
			header: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		const result = response.data;
		if (result.code === 200) {
			healthData.value = result;
			lastUpdateTime.value = '刚刚更新';
		} else {
			console.error('获取健康数据失败:', result.message);
		}
	} catch (error) {
		console.error('获取健康数据错误:', error);
	}
};

// 获取报警记录
const fetchAlerts = async (elderlyId) => {
	try {
		const token = uni.getStorageSync('token');
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: `/api/v1/alerts?userId=${elderlyId}&pageSize=3`,
			method: 'GET',
			header: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		const result = response.data;
		if (result.code === 200) {
			alerts.value = result.data || [];
		} else {
			console.error('获取报警记录失败:', result.message);
		}
	} catch (error) {
		console.error('获取报警记录错误:', error);
	}
};

// 获取报警类型名称
const getAlertTypeName = (type) => {
	const typeMap = {
		'fall': '跌倒报警',
		'heartRate': '心率异常',
		'bloodPressure': '血压异常'
	};
	return typeMap[type] || '未知报警';
};

// 处理报警
const handleAlert = async (alertId) => {
	try {
		const token = uni.getStorageSync('token');
		
		uni.showModal({
			title: '处理报警',
			content: '确认已联系老人处理此报警？',
			success: async (res) => {
				if (res.confirm) {
					// 使用mock请求替代真实API
					const response = await uni.request({
						url: `/api/v1/alerts/${alertId}`,
						method: 'PUT',
						header: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
						},
						data: {
							status: 'resolved',
							notes: '家属已确认处理'
						}
					});
					
					const result = response.data;
					if (result.code === 200) {
						uni.showToast({
							title: '处理成功',
							icon: 'success'
						});
						
						// 更新报警列表中的状态
						const alertIndex = alerts.value.findIndex(alert => alert.id === alertId);
						if (alertIndex !== -1) {
							alerts.value[alertIndex].status = 'resolved';
						}
					} else {
						uni.showToast({
							title: '处理失败',
							icon: 'none'
						});
					}
				}
			}
		});
	} catch (error) {
		console.error('处理报警错误:', error);
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
};

// 视频通话
const callElderly = () => {
	uni.showModal({
		title: '视频通话',
		content: `是否发起与${currentElderly.value.name}的视频通话？`,
		success: (res) => {
			if (res.confirm) {
				uni.showToast({
					title: '正在连接...',
					icon: 'loading',
					duration: 2000
				});
				
				// 模拟通话连接
				setTimeout(() => {
					uni.showToast({
						title: '连接失败，请稍后重试',
						icon: 'none'
					});
				}, 2000);
			}
		}
	});
};

// 格式化时间
const formatTime = (timeString) => {
	const date = new Date(timeString);
	return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`;
};

// 跳转到报警记录页面
const goToAlertPage = () => {
	uni.navigateTo({
		url: '/pages/family/alert'
	});
};

// 跳转到健康报告页面
const goToHealthReport = () => {
	// 获取当前选中老人的ID，用于传递参数
	uni.navigateTo({
		url: `/pages/family/history?userId=${currentElderly.value.id}&name=${encodeURIComponent(currentElderly.value.name)}`
	});
};

onMounted(() => {
	// 保存当前选中的老人ID到本地存储，用于其他页面获取
	if (elderlyList.value.length > 0) {
		uni.setStorageSync('currentElderId', elderlyList.value[0].id);
		
		// 默认获取第一个老人的数据
		fetchHealthData(elderlyList.value[0].id);
		fetchAlerts(elderlyList.value[0].id);
		
		// 设置定时刷新数据
		setInterval(() => {
			fetchHealthData(currentElderly.value.id);
		}, 30000); // 每30秒刷新一次
	}
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

.section-title {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	font-size: 32rpx;
	font-weight: bold;
}

.more {
	font-size: 28rpx;
	color: #007AFF;
	font-weight: normal;
}

.time {
	font-size: 24rpx;
	color: #999;
	font-weight: normal;
}

.elderly-section {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.elderly-list {
	display: flex;
	overflow-x: auto;
	padding: 10rpx 0;
}

.elderly-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-right: 30rpx;
	padding: 20rpx;
	min-width: 120rpx;
	border-radius: 8rpx;
	background-color: #f8f8f8;
}

.elderly-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background-color: #ddd;
	margin-bottom: 10rpx;
}

.elderly-name {
	font-size: 28rpx;
	margin-bottom: 5rpx;
}

.elderly-status {
	font-size: 24rpx;
	padding: 2rpx 10rpx;
	border-radius: 20rpx;
}

.online {
	background-color: #e6f7e6;
	color: #36b336;
}

.offline {
	background-color: #f7e6e6;
	color: #b33636;
}

.health-overview {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.health-data-cards {
	display: flex;
	justify-content: space-between;
}

.health-card {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;
}

.card-title {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.card-value {
	font-size: 36rpx;
	font-weight: bold;
	color: #007AFF;
	margin-bottom: 5rpx;
}

.card-unit {
	font-size: 24rpx;
	color: #999;
}

.alert-section {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.alert-list {
	margin-top: 10rpx;
}

.alert-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.alert-item:last-child {
	border-bottom: none;
}

.alert-type {
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 5rpx;
	display: block;
}

.alert-location {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 5rpx;
	display: block;
}

.alert-time {
	font-size: 24rpx;
	color: #999;
}

.handle-btn {
	font-size: 24rpx;
	padding: 6rpx 20rpx;
	background-color: #007AFF;
	color: #fff;
	border-radius: 30rpx;
	line-height: 1.5;
}

.alert-handled {
	font-size: 24rpx;
	color: #36b336;
}

.no-data {
	text-align: center;
	padding: 40rpx 0;
	color: #999;
}

.action-buttons {
	display: flex;
	justify-content: space-between;
}

.action-btn {
	width: 48%;
	height: 90rpx;
	line-height: 90rpx;
	border-radius: 45rpx;
	font-size: 32rpx;
}

.call {
	background-color: #007AFF;
	color: #fff;
}

.report {
	background-color: #f0f0f0;
	color: #333;
}
</style> 