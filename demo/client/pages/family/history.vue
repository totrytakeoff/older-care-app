<template>
	<view class="container">
		<view class="header">
			<text class="title">健康记录</text>
		</view>
		
		<view class="elderly-info-card">
			<view class="elderly-info">
				<text class="elderly-name">{{ elderlyName }}</text>
				<text class="elderly-id">ID: {{ elderlyId }}</text>
			</view>
		</view>
		
		<view class="data-filter">
			<view class="filter-item" @click="showTypeModal">
				<text>数据类型: {{ currentType.label }}</text>
				<text class="arrow-down">▼</text>
			</view>
			<view class="filter-item" @click="showDatePicker">
				<text>日期范围: {{ formatDateRange() }}</text>
				<text class="arrow-down">▼</text>
			</view>
		</view>
		
		<view class="chart-container" v-if="healthData.length > 0">
			<view class="chart-title">
				<text>{{ currentType.label }}趋势</text>
			</view>
			<view class="chart-wrapper">
				<qiun-data-charts 
					type="line"
					:opts="chartOpts"
					:chartData="chartData"
				/>
			</view>
		</view>
		
		<view class="data-list">
			<view class="section-title">
				<text>详细记录</text>
			</view>
			
			<view v-if="healthData.length > 0">
				<view v-for="(item, index) in healthData" :key="index" class="data-item">
					<view class="data-left">
						<text class="data-time">{{ formatTime(item.timestamp) }}</text>
						<text class="data-source">来源: {{ item.source }}</text>
					</view>
					<view class="data-right">
						<text class="data-value">{{ formatValue(item.value) }}</text>
						<text class="data-status" :class="getStatusClass(item.value)">
							{{ getStatusText(item.value) }}
						</text>
					</view>
				</view>
			</view>
			
			<view v-else class="no-data">
				<image src="/static/images/no-data.png" mode="aspectFit" class="no-data-img"></image>
				<text class="no-data-text">暂无记录</text>
				<text class="no-data-tip">请选择其他日期范围或数据类型</text>
			</view>
		</view>
		
		<!-- 类型选择弹窗 -->
		<uni-popup ref="typePopup" type="bottom">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">选择数据类型</text>
					<text class="popup-close" @click="hideTypeModal">×</text>
				</view>
				<view class="popup-list">
					<view 
						v-for="(type, index) in dataTypes" 
						:key="index" 
						class="popup-item"
						:class="{'selected': currentType.value === type.value}"
						@click="selectType(type)"
					>
						<text>{{ type.label }}</text>
						<text v-if="currentType.value === type.value" class="selected-icon">✓</text>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 日期选择弹窗 -->
		<uni-popup ref="datePopup" type="bottom">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">选择日期范围</text>
					<text class="popup-close" @click="hideDatePicker">×</text>
				</view>
				<view class="date-ranges">
					<view 
						v-for="(range, index) in dateRanges" 
						:key="index" 
						class="date-range-item"
						:class="{'selected': currentDateRange === range.value}"
						@click="selectDateRange(range.value)"
					>
						<text>{{ range.label }}</text>
						<text v-if="currentDateRange === range.value" class="selected-icon">✓</text>
					</view>
				</view>
				<view class="custom-date" v-if="currentDateRange === 'custom'">
					<view class="date-picker-item">
						<text class="date-label">开始日期</text>
						<picker mode="date" :value="startDate" @change="onStartDateChange">
							<view class="date-value">{{ startDate }}</view>
						</picker>
					</view>
					<view class="date-picker-item">
						<text class="date-label">结束日期</text>
						<picker mode="date" :value="endDate" @change="onEndDateChange">
							<view class="date-value">{{ endDate }}</view>
						</picker>
					</view>
				</view>
				<view class="popup-actions">
					<button class="popup-btn confirm" @click="applyDateFilter">确认</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 老人信息
const elderlyId = ref('');
const elderlyName = ref('');

// 数据类型
const dataTypes = ref([
	{ value: 'heart_rate', label: '心率', unit: '次/分', normal: { min: 60, max: 100 } },
	{ value: 'blood_pressure', label: '血压', unit: 'mmHg', normal: { min: 90, max: 140 } },
	{ value: 'blood_oxygen', label: '血氧', unit: '%', normal: { min: 95, max: 100 } },
	{ value: 'blood_glucose', label: '血糖', unit: 'mmol/L', normal: { min: 3.9, max: 6.1 } },
	{ value: 'temperature', label: '体温', unit: '°C', normal: { min: 36, max: 37.3 } },
	{ value: 'weight', label: '体重', unit: 'kg' }
]);

const currentType = ref(dataTypes.value[0]); // 默认选择心率

// 日期范围
const dateRanges = ref([
	{ value: 'today', label: '今天' },
	{ value: 'yesterday', label: '昨天' },
	{ value: 'week', label: '近7天' },
	{ value: 'month', label: '近30天' },
	{ value: 'custom', label: '自定义' }
]);

const currentDateRange = ref('week'); // 默认选择近7天
const startDate = ref('');
const endDate = ref('');

// 设置默认日期范围
const initDateRange = () => {
	const today = new Date();
	endDate.value = formatDate(today);
	
	const weekAgo = new Date();
	weekAgo.setDate(today.getDate() - 6);
	startDate.value = formatDate(weekAgo);
};

// 格式化日期为YYYY-MM-DD
const formatDate = (date) => {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
};

// 健康数据
const healthData = ref([]);

// 显示类型选择弹窗
const typePopup = ref(null);
const showTypeModal = () => {
	typePopup.value.open();
};
const hideTypeModal = () => {
	typePopup.value.close();
};

// 选择数据类型
const selectType = (type) => {
	currentType.value = type;
	hideTypeModal();
	fetchHealthData();
};

// 显示日期选择弹窗
const datePopup = ref(null);
const showDatePicker = () => {
	datePopup.value.open();
};
const hideDatePicker = () => {
	datePopup.value.close();
};

// 选择日期范围
const selectDateRange = (range) => {
	currentDateRange.value = range;
	
	const today = new Date();
	endDate.value = formatDate(today);
	
	if (range === 'today') {
		startDate.value = formatDate(today);
	} else if (range === 'yesterday') {
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);
		startDate.value = formatDate(yesterday);
		endDate.value = formatDate(yesterday);
	} else if (range === 'week') {
		const weekAgo = new Date();
		weekAgo.setDate(today.getDate() - 6);
		startDate.value = formatDate(weekAgo);
	} else if (range === 'month') {
		const monthAgo = new Date();
		monthAgo.setDate(today.getDate() - 29);
		startDate.value = formatDate(monthAgo);
	}
};

// 修改开始日期
const onStartDateChange = (e) => {
	startDate.value = e.detail.value;
};

// 修改结束日期
const onEndDateChange = (e) => {
	endDate.value = e.detail.value;
};

// 应用日期筛选
const applyDateFilter = () => {
	// 验证日期范围
	if (new Date(startDate.value) > new Date(endDate.value)) {
		uni.showToast({
			title: '开始日期不能大于结束日期',
			icon: 'none'
		});
		return;
	}
	
	hideDatePicker();
	fetchHealthData();
};

// 格式化日期范围显示
const formatDateRange = () => {
	if (currentDateRange.value === 'today') {
		return '今天';
	} else if (currentDateRange.value === 'yesterday') {
		return '昨天';
	} else if (currentDateRange.value === 'week') {
		return '近7天';
	} else if (currentDateRange.value === 'month') {
		return '近30天';
	} else {
		return `${startDate.value} 至 ${endDate.value}`;
	}
};

// 格式化时间显示
const formatTime = (timestamp) => {
	const date = new Date(timestamp);
	return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

// 补零
const padZero = (num) => {
	return num < 10 ? '0' + num : num;
};

// 格式化数值显示
const formatValue = (value) => {
	// 对于血压特殊处理
	if (currentType.value.value === 'blood_pressure' && typeof value === 'object') {
		return `${value.systolic}/${value.diastolic} ${currentType.value.unit}`;
	}
	return `${value} ${currentType.value.unit}`;
};

// 获取状态样式
const getStatusClass = (value) => {
	if (!currentType.value.normal) return '';
	
	// 血压特殊处理
	if (currentType.value.value === 'blood_pressure' && typeof value === 'object') {
		if (value.systolic > 140 || value.diastolic > 90) return 'status-high';
		if (value.systolic < 90 || value.diastolic < 60) return 'status-low';
		return 'status-normal';
	}
	
	if (value > currentType.value.normal.max) return 'status-high';
	if (value < currentType.value.normal.min) return 'status-low';
	return 'status-normal';
};

// 获取状态文本
const getStatusText = (value) => {
	if (!currentType.value.normal) return '';
	
	// 血压特殊处理
	if (currentType.value.value === 'blood_pressure' && typeof value === 'object') {
		if (value.systolic > 140 || value.diastolic > 90) return '偏高';
		if (value.systolic < 90 || value.diastolic < 60) return '偏低';
		return '正常';
	}
	
	if (value > currentType.value.normal.max) return '偏高';
	if (value < currentType.value.normal.min) return '偏低';
	return '正常';
};

// 图表配置
const chartOpts = {
	color: ["#1890FF"],
	padding: [15, 15, 0, 15],
	enableScroll: true,
	legend: {
		show: false
	},
	xAxis: {
		disableGrid: true
	},
	yAxis: {
		gridType: "dash",
		dashLength: 2
	},
	extra: {
		line: {
			type: "curve",
			width: 2
		}
	}
};

// 图表数据
const chartData = computed(() => {
	if (healthData.value.length === 0) {
		return {
			categories: [],
			series: []
		};
	}
	
	// 按时间排序
	const sortedData = [...healthData.value].sort((a, b) => a.timestamp - b.timestamp);
	
	// 取最新的20条数据
	const recentData = sortedData.slice(-20);
	
	// 根据数据类型处理值
	let values = [];
	if (currentType.value.value === 'blood_pressure') {
		values = recentData.map(item => item.value.systolic); // 只显示收缩压
	} else {
		values = recentData.map(item => item.value);
	}
	
	return {
		categories: recentData.map(item => {
			const date = new Date(item.timestamp);
			return `${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
		}),
		series: [
			{
				name: currentType.value.label,
				data: values
			}
		]
	};
});

// 获取健康数据
const fetchHealthData = async () => {
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		const token = uni.getStorageSync('token');
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: '/api/v1/health/records',
			method: 'GET',
			header: {
				'Authorization': `Bearer ${token}`
			},
			data: {
				userId: elderlyId.value,
				type: currentType.value.value,
				startDate: startDate.value,
				endDate: endDate.value
			}
		});
		
		const result = response.data;
		
		uni.hideLoading();
		
		if (result.code === 200) {
			healthData.value = result.data.records || [];
		} else {
			uni.showToast({
				title: '获取数据失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取健康数据错误:', error);
		uni.hideLoading();
		// 即使出错也不需要调用loadMockData，因为Mock.js会拦截请求
	}
};

// 获取URL参数
const getParams = () => {
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	const options = currentPage.options;
	
	if (options) {
		elderlyId.value = options.userId || '';
		elderlyName.value = options.name ? decodeURIComponent(options.name) : '';
	} else {
		// 模拟数据
		elderlyId.value = '1001';
		elderlyName.value = '张大爷';
	}
};

onMounted(() => {
	getParams();
	initDateRange();
	fetchHealthData();
});
</script>

<style>
.container {
	padding: 30rpx;
}

.header {
	margin-bottom: 30rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
}

.elderly-info-card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.elderly-info {
	display: flex;
	align-items: center;
}

.elderly-name {
	font-size: 32rpx;
	font-weight: bold;
	margin-right: 20rpx;
}

.elderly-id {
	font-size: 24rpx;
	color: #999;
}

.data-filter {
	display: flex;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.filter-item {
	background-color: #fff;
	border-radius: 12rpx;
	padding: 15rpx 20rpx;
	font-size: 28rpx;
	color: #333;
	flex: 1;
	margin: 0 10rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.filter-item:first-child {
	margin-left: 0;
}

.filter-item:last-child {
	margin-right: 0;
}

.arrow-down {
	font-size: 20rpx;
	color: #999;
}

.chart-container {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.chart-title {
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.chart-wrapper {
	height: 400rpx;
	width: 100%;
}

.data-list {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.data-item {
	display: flex;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.data-item:last-child {
	border-bottom: none;
}

.data-left {
	display: flex;
	flex-direction: column;
}

.data-time {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 8rpx;
}

.data-source {
	font-size: 24rpx;
	color: #999;
}

.data-right {
	text-align: right;
}

.data-value {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
}

.data-status {
	font-size: 24rpx;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
}

.status-normal {
	background-color: #e6f7e6;
	color: #36b336;
}

.status-high {
	background-color: #f7e6e6;
	color: #b33636;
}

.status-low {
	background-color: #e6f0f7;
	color: #3670b3;
}

.no-data {
	text-align: center;
	padding: 60rpx 0;
}

.no-data-img {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 20rpx;
}

.no-data-text {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.no-data-tip {
	font-size: 24rpx;
	color: #999;
}

.popup-content {
	background-color: #fff;
	border-radius: 16rpx 16rpx 0 0;
	padding: 30rpx;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.popup-title {
	font-size: 32rpx;
	font-weight: bold;
}

.popup-close {
	font-size: 40rpx;
	color: #999;
}

.popup-list, .date-ranges {
	margin-bottom: 30rpx;
}

.popup-item, .date-range-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.popup-item:last-child, .date-range-item:last-child {
	border-bottom: none;
}

.selected {
	color: #007AFF;
}

.selected-icon {
	color: #007AFF;
}

.custom-date {
	margin-bottom: 30rpx;
}

.date-picker-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.date-label {
	font-size: 28rpx;
	color: #333;
}

.date-value {
	font-size: 28rpx;
	color: #007AFF;
}

.popup-actions {
	margin-top: 20rpx;
}

.popup-btn {
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 40rpx;
}

.confirm {
	background-color: #007AFF;
	color: #fff;
}
</style> 