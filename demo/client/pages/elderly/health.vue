<template>
	<view class="container">
		<view class="header">
			<text class="title">健康历史记录</text>
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
			<view class="chart-header">
				<text class="chart-title">{{ currentType.label }}趋势</text>
				<view class="chart-actions">
					<text 
						v-for="(period, index) in chartPeriods" 
						:key="index" 
						:class="['period-btn', { active: currentPeriod === period.value }]"
						@click="setPeriod(period.value)"
					>{{ period.label }}</text>
				</view>
			</view>
			<view class="chart-wrapper">
				<qiun-data-charts 
					type="line"
					:opts="chartOpts"
					:chartData="chartData"
				/>
			</view>
			
			<view class="stats">
				<view class="stat-card">
					<text class="stat-label">平均值</text>
					<text class="stat-value">{{ stats.avg }}</text>
				</view>
				<view class="stat-card">
					<text class="stat-label">最高值</text>
					<text class="stat-value">{{ stats.max }}</text>
				</view>
				<view class="stat-card">
					<text class="stat-label">最低值</text>
					<text class="stat-value">{{ stats.min }}</text>
				</view>
			</view>
		</view>
		
		<view class="data-list">
			<view class="list-header">
				<text class="list-title">详细记录</text>
				<text class="add-record" @click="goToEntry">添加记录</text>
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
				
				<view class="load-more" v-if="hasMoreData">
					<text @click="loadMoreData">加载更多</text>
				</view>
			</view>
			
			<view v-else class="no-data">
				<image src="/static/images/no-data.png" mode="aspectFit" class="no-data-img"></image>
				<text class="no-data-text">暂无记录</text>
				<text class="no-data-tip">请选择其他日期范围或数据类型</text>
				<button class="add-data-btn" @click="goToEntry">添加记录</button>
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
						<view class="popup-item-left">
							<image :src="type.icon" mode="aspectFit" class="type-icon"></image>
							<text>{{ type.label }}</text>
						</view>
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

// 数据类型
const dataTypes = ref([
	{ 
		value: 'heart_rate', 
		label: '心率', 
		icon: '/static/images/icon-heart-rate.png',
		unit: '次/分',
		normal: { min: 60, max: 100 }
	},
	{ 
		value: 'blood_pressure', 
		label: '血压', 
		icon: '/static/images/icon-blood-pressure.png',
		unit: 'mmHg',
		normal: { 
			systolic: { min: 90, max: 140 },
			diastolic: { min: 60, max: 90 }
		}
	},
	{ 
		value: 'blood_oxygen', 
		label: '血氧', 
		icon: '/static/images/icon-blood-oxygen.png',
		unit: '%',
		normal: { min: 95, max: 100 }
	},
	{ 
		value: 'blood_glucose', 
		label: '血糖', 
		icon: '/static/images/icon-blood-glucose.png',
		unit: 'mmol/L',
		normal: { min: 3.9, max: 6.1 }
	},
	{ 
		value: 'temperature', 
		label: '体温', 
		icon: '/static/images/icon-temperature.png',
		unit: '°C',
		normal: { min: 36, max: 37.3 }
	},
	{ 
		value: 'weight', 
		label: '体重', 
		icon: '/static/images/icon-weight.png',
		unit: 'kg'
	}
]);

// 根据URL参数或默认值选择当前类型
const defaultType = dataTypes.value[0];
const currentType = ref(defaultType);

// 日期范围
const dateRanges = ref([
	{ value: 'today', label: '今天' },
	{ value: 'yesterday', label: '昨天' },
	{ value: 'week', label: '近7天' },
	{ value: 'month', label: '近30天' },
	{ value: 'custom', label: '自定义' }
]);

// 图表周期选项
const chartPeriods = ref([
	{ value: 'day', label: '日' },
	{ value: 'week', label: '周' },
	{ value: 'month', label: '月' }
]);

const currentDateRange = ref('week'); // 默认选择近7天
const currentPeriod = ref('day'); // 默认日视图
const startDate = ref('');
const endDate = ref('');

// 健康数据
const healthData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMoreData = ref(true);

// 统计数据
const stats = ref({
	avg: '--',
	max: '--',
	min: '--'
});

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
	// 重置分页
	currentPage.value = 1;
	hasMoreData.value = true;
	// 加载新数据
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
	// 重置分页
	currentPage.value = 1;
	hasMoreData.value = true;
	// 加载新数据
	fetchHealthData();
};

// 设置图表周期
const setPeriod = (period) => {
	currentPeriod.value = period;
	// 重新计算图表数据
	processChartData();
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
		if (value.systolic > currentType.value.normal.systolic.max || 
			value.diastolic > currentType.value.normal.diastolic.max) {
			return 'status-high';
		}
		if (value.systolic < currentType.value.normal.systolic.min || 
			value.diastolic < currentType.value.normal.diastolic.min) {
			return 'status-low';
		}
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
		if (value.systolic > currentType.value.normal.systolic.max || 
			value.diastolic > currentType.value.normal.diastolic.max) {
			return '偏高';
		}
		if (value.systolic < currentType.value.normal.systolic.min || 
			value.diastolic < currentType.value.normal.diastolic.min) {
			return '偏低';
		}
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
const chartData = ref({
	categories: [],
	series: []
});

// 处理图表数据
const processChartData = () => {
	if (healthData.value.length === 0) {
		chartData.value = {
			categories: [],
			series: []
		};
		stats.value = {
			avg: '--',
			max: '--',
			min: '--'
		};
		return;
	}
	
	// 按时间排序
	const sortedData = [...healthData.value].sort((a, b) => a.timestamp - b.timestamp);
	
	// 根据选择的周期处理数据
	let processedData = [];
	
	if (currentPeriod.value === 'day') {
		// 日视图：按小时聚合
		processedData = groupDataByHour(sortedData);
	} else if (currentPeriod.value === 'week') {
		// 周视图：按天聚合
		processedData = groupDataByDay(sortedData);
	} else if (currentPeriod.value === 'month') {
		// 月视图：按天聚合
		processedData = groupDataByDay(sortedData);
	}
	
	// 计算统计数据
	calculateStats(sortedData);
	
	// 填充图表数据
	chartData.value = {
		categories: processedData.map(item => item.label),
		series: [
			{
				name: currentType.value.label,
				data: processedData.map(item => item.value)
			}
		]
	};
};

// 按小时分组数据
const groupDataByHour = (data) => {
	const hourlyData = {};
	
	data.forEach(item => {
		const date = new Date(item.timestamp);
		const day = date.getDate();
		const hour = date.getHours();
		const key = `${day}-${hour}`;
		
		if (!hourlyData[key]) {
			hourlyData[key] = {
				timestamp: date,
				values: [],
				label: `${padZero(hour)}:00`
			};
		}
		
		if (currentType.value.value === 'blood_pressure') {
			hourlyData[key].values.push(item.value.systolic); // 只用收缩压绘图
		} else {
			hourlyData[key].values.push(item.value);
		}
	});
	
	// 计算每小时平均值
	return Object.values(hourlyData)
		.sort((a, b) => a.timestamp - b.timestamp)
		.map(item => {
			return {
				label: item.label,
				value: calculateAverage(item.values)
			};
		});
};

// 按天分组数据
const groupDataByDay = (data) => {
	const dailyData = {};
	
	data.forEach(item => {
		const date = new Date(item.timestamp);
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const key = `${month}-${day}`;
		
		if (!dailyData[key]) {
			dailyData[key] = {
				timestamp: date,
				values: [],
				label: `${padZero(month)}-${padZero(day)}`
			};
		}
		
		if (currentType.value.value === 'blood_pressure') {
			dailyData[key].values.push(item.value.systolic); // 只用收缩压绘图
		} else {
			dailyData[key].values.push(item.value);
		}
	});
	
	// 计算每天平均值
	return Object.values(dailyData)
		.sort((a, b) => a.timestamp - b.timestamp)
		.map(item => {
			return {
				label: item.label,
				value: calculateAverage(item.values)
			};
		});
};

// 计算平均值
const calculateAverage = (values) => {
	if (values.length === 0) return 0;
	const sum = values.reduce((a, b) => a + b, 0);
	return Number((sum / values.length).toFixed(1));
};

// 计算统计数据
const calculateStats = (data) => {
	if (data.length === 0) {
		stats.value = {
			avg: '--',
			max: '--',
			min: '--'
		};
		return;
	}
	
	let values = [];
	
	if (currentType.value.value === 'blood_pressure') {
		// 对于血压，只统计收缩压
		values = data.map(item => item.value.systolic);
	} else {
		values = data.map(item => item.value);
	}
	
	const sum = values.reduce((a, b) => a + b, 0);
	const avg = Number((sum / values.length).toFixed(1));
	const max = Math.max(...values);
	const min = Math.min(...values);
	
	stats.value = {
		avg: `${avg} ${currentType.value.unit}`,
		max: `${max} ${currentType.value.unit}`,
		min: `${min} ${currentType.value.unit}`
	};
};

// 获取健康数据
const fetchHealthData = async () => {
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId');
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: '/api/v1/health/records',
			method: 'GET',
			header: {
				'Authorization': `Bearer ${token}`
			},
			data: {
				userId,
				type: currentType.value.value,
				startDate: startDate.value,
				endDate: endDate.value,
				page: currentPage.value,
				pageSize: pageSize.value
			}
		});
		
		const result = response.data;
		
		uni.hideLoading();
		
		if (result.code === 200) {
			// 首页直接替换，加载更多则追加
			if (currentPage.value === 1) {
				healthData.value = result.data.records || [];
			} else {
				healthData.value = [...healthData.value, ...(result.data.records || [])];
			}
			
			// 判断是否还有更多数据
			hasMoreData.value = result.data.hasMore || false;
			
			// 处理图表数据
			processChartData();
		} else {
			uni.showToast({
				title: '获取数据失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取健康数据错误:', error);
		uni.hideLoading();
		uni.showToast({
			title: '获取数据失败，请稍后重试',
			icon: 'none'
		});
	}
};

// 加载更多数据
const loadMoreData = () => {
	if (hasMoreData.value) {
		currentPage.value++;
		fetchHealthData();
	}
};

// 跳转到健康数据录入页面
const goToEntry = () => {
	uni.navigateTo({
		url: '/pages/elderly/entry'
	});
};

// 从URL参数获取类型
const getTypeFromParams = () => {
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	const options = currentPage.options;
	
	if (options && options.type) {
		const typeFromUrl = dataTypes.value.find(t => t.value === options.type);
		if (typeFromUrl) {
			currentType.value = typeFromUrl;
		}
	}
};

onMounted(() => {
	// 获取URL参数中的类型
	getTypeFromParams();
	
	// 初始化日期范围
	initDateRange();
	
	// 获取健康数据
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

.chart-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.chart-title {
	font-size: 28rpx;
	font-weight: bold;
}

.chart-actions {
	display: flex;
}

.period-btn {
	font-size: 24rpx;
	color: #666;
	padding: 4rpx 16rpx;
	margin-left: 10rpx;
	border-radius: 20rpx;
	background-color: #f5f5f5;
}

.period-btn.active {
	color: #fff;
	background-color: #007AFF;
}

.chart-wrapper {
	height: 400rpx;
	width: 100%;
}

.stats {
	display: flex;
	margin-top: 20rpx;
}

.stat-card {
	flex: 1;
	text-align: center;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 8rpx;
	display: block;
}

.stat-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.data-list {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 30rpx;
}

.list-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.list-title {
	font-size: 28rpx;
	font-weight: bold;
}

.add-record {
	font-size: 26rpx;
	color: #007AFF;
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

.load-more {
	text-align: center;
	padding: 20rpx 0;
	color: #007AFF;
	font-size: 28rpx;
}

.no-data {
	text-align: center;
	padding: 40rpx 0;
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
	margin-bottom: 30rpx;
}

.add-data-btn {
	width: 300rpx;
	height: 80rpx;
	line-height: 80rpx;
	background-color: #007AFF;
	color: #fff;
	border-radius: 40rpx;
	font-size: 28rpx;
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

.popup-item-left {
	display: flex;
	align-items: center;
}

.type-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 20rpx;
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