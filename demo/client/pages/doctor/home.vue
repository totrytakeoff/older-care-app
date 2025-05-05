<template>
	<view class="container">
		<view class="header">
			<text class="welcome">您好，医生</text>
			<text class="date">{{ currentDate }}</text>
		</view>
		
		<view class="search-bar">
			<input type="text" v-model="searchKeyword" placeholder="搜索患者姓名或ID" />
			<button class="search-btn">搜索</button>
		</view>
		
		<view class="patient-section">
			<view class="section-title">
				<text>患者列表</text>
			</view>
			
			<view v-if="patients.length > 0" class="patient-list">
				<view 
					class="patient-item" 
					v-for="(patient, index) in filteredPatients" 
					:key="index"
					@click="selectPatient(patient)"
				>
					<view class="patient-avatar"></view>
					<view class="patient-info">
						<text class="patient-name">{{ patient.name }}</text>
						<text class="patient-id">ID: {{ patient.id }}</text>
						<text class="patient-age">{{ patient.age }}岁 {{ patient.gender === 'male' ? '男' : '女' }}</text>
					</view>
					<text :class="['health-status', patient.status]">{{ getStatusText(patient.status) }}</text>
				</view>
			</view>
			
			<view v-else class="no-data">
				<text>暂无患者</text>
			</view>
		</view>
		
		<view v-if="selectedPatient" class="health-analysis">
			<view class="section-title">
				<text>{{ selectedPatient.name }}的健康分析</text>
			</view>
			
			<view class="health-chart">
				<view class="chart-header">
					<text class="chart-title">最近7天心率变化</text>
					<view class="chart-tabs">
						<text 
							:class="['chart-tab', chartType === 'heartRate' ? 'active' : '']" 
							@click="switchChartType('heartRate')"
						>心率</text>
						<text 
							:class="['chart-tab', chartType === 'bloodPressure' ? 'active' : '']" 
							@click="switchChartType('bloodPressure')"
						>血压</text>
						<text 
							:class="['chart-tab', chartType === 'bloodOxygen' ? 'active' : '']" 
							@click="switchChartType('bloodOxygen')"
						>血氧</text>
					</view>
				</view>
				
				<view class="chart-placeholder">
					<text>此处应显示{{ getChartTitle() }}图表</text>
				</view>
			</view>
			
			<view class="health-suggestions">
				<view class="section-subtitle">
					<text>健康建议</text>
				</view>
				<view class="suggestion-list">
					<view class="suggestion-item" v-for="(suggestion, index) in healthSuggestions" :key="index">
						<text class="suggestion-text">{{ suggestion }}</text>
					</view>
				</view>
			</view>
			
			<view class="action-buttons">
				<button class="action-btn history" @click="viewHealthHistory(selectedPatient)">查看健康档案</button>
				<button class="action-btn prescription" @click="gotoPrescription(selectedPatient)">开具处方</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const currentDate = computed(() => {
	const date = new Date();
	return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
});

// 搜索关键字
const searchKeyword = ref('');

// 患者数据
const patients = ref([]);
const selectedPatient = ref(null);

// 图表类型
const chartType = ref('heartRate');

// 健康建议
const healthSuggestions = ref([
	'建议每天定时测量血压，记录数据',
	'近期血压波动较大，注意饮食清淡',
	'增加适量运动，每周至少3次有氧运动',
	'避免情绪激动，保持心情平静'
]);

// 根据搜索关键字过滤患者
const filteredPatients = computed(() => {
	if (!searchKeyword.value) {
		return patients.value;
	}
	
	const keyword = searchKeyword.value.toLowerCase();
	return patients.value.filter(patient => {
		return (
			patient.name.toLowerCase().includes(keyword) ||
			patient.id.toString().includes(keyword)
		);
	});
});

// 获取患者列表
const fetchPatients = async () => {
	// 模拟数据，实际项目中应该调用API
	patients.value = [
		{
			id: 1001,
			name: '张大爷',
			age: 75,
			gender: 'male',
			status: 'normal'
		},
		{
			id: 1002,
			name: '李奶奶',
			age: 68,
			gender: 'female',
			status: 'warning'
		},
		{
			id: 1003,
			name: '王伯伯',
			age: 82,
			gender: 'male',
			status: 'alert'
		}
	];
};

// 选择患者
const selectPatient = (patient) => {
	selectedPatient.value = patient;
	fetchHealthData(patient.id);
};

// 获取健康数据
const fetchHealthData = async (patientId) => {
	// 模拟数据，实际项目中应该调用API获取患者的健康数据
	console.log('获取患者ID为', patientId, '的健康数据');
};

// 切换图表类型
const switchChartType = (type) => {
	chartType.value = type;
};

// 获取图表标题
const getChartTitle = () => {
	const titleMap = {
		'heartRate': '心率',
		'bloodPressure': '血压',
		'bloodOxygen': '血氧'
	};
	return titleMap[chartType.value] || '健康数据';
};

// 获取健康状态文本
const getStatusText = (status) => {
	const statusMap = {
		'normal': '正常',
		'warning': '注意',
		'alert': '异常'
	};
	return statusMap[status] || '未知';
};

// 查看健康档案
const viewHealthHistory = (patient) => {
	uni.navigateTo({
		url: `/pages/common/health-record?userId=${patient.id}&name=${encodeURIComponent(patient.name)}`
	});
};

// 前往开具处方页面
const gotoPrescription = (patient) => {
	uni.navigateTo({
		url: `/pages/doctor/prescription?userId=${patient.id}&name=${encodeURIComponent(patient.name)}`
	});
};

onMounted(() => {
	fetchPatients();
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

.search-bar {
	display: flex;
	margin-bottom: 30rpx;
}

.search-bar input {
	flex: 1;
	height: 80rpx;
	border: 1px solid #eee;
	border-radius: 40rpx;
	padding: 0 30rpx;
	font-size: 28rpx;
}

.search-btn {
	width: 160rpx;
	height: 80rpx;
	line-height: 80rpx;
	background-color: #007AFF;
	color: #fff;
	border-radius: 40rpx;
	margin-left: 20rpx;
	font-size: 28rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.patient-section {
	margin-bottom: 30rpx;
}

.patient-list {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.patient-item {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.patient-item:last-child {
	border-bottom: none;
}

.patient-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background-color: #ddd;
	margin-right: 20rpx;
}

.patient-info {
	flex: 1;
}

.patient-name {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 5rpx;
	display: block;
}

.patient-id {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 5rpx;
	display: block;
}

.patient-age {
	font-size: 24rpx;
	color: #666;
}

.health-status {
	padding: 4rpx 16rpx;
	border-radius: 30rpx;
	font-size: 24rpx;
}

.health-status.normal {
	background-color: #e6f7e6;
	color: #36b336;
}

.health-status.warning {
	background-color: #fff5e6;
	color: #ff9500;
}

.health-status.alert {
	background-color: #ffe8e8;
	color: #ff3b30;
}

.no-data {
	text-align: center;
	padding: 60rpx 0;
	color: #999;
}

.health-analysis {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.health-chart {
	margin-bottom: 30rpx;
}

.chart-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.chart-title {
	font-size: 28rpx;
	color: #666;
}

.chart-tabs {
	display: flex;
}

.chart-tab {
	font-size: 24rpx;
	color: #999;
	padding: 0 20rpx;
	position: relative;
}

.chart-tab.active {
	color: #007AFF;
}

.chart-tab.active::after {
	content: '';
	position: absolute;
	bottom: -10rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 20rpx;
	height: 4rpx;
	background-color: #007AFF;
	border-radius: 2rpx;
}

.chart-placeholder {
	height: 300rpx;
	background-color: #f8f8f8;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 8rpx;
}

.section-subtitle {
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.suggestion-list {
	margin-bottom: 30rpx;
}

.suggestion-item {
	margin-bottom: 15rpx;
	padding-left: 20rpx;
	position: relative;
}

.suggestion-item::before {
	content: '';
	position: absolute;
	left: 0;
	top: 12rpx;
	width: 10rpx;
	height: 10rpx;
	background-color: #007AFF;
	border-radius: 50%;
}

.suggestion-text {
	font-size: 28rpx;
	color: #333;
	line-height: 1.6;
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
	font-size: 28rpx;
}

.history {
	background-color: #f0f0f0;
	color: #333;
}

.prescription {
	background-color: #007AFF;
	color: #fff;
}
</style> 