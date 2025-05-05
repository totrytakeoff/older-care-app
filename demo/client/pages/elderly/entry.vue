<template>
	<view class="container">
		<view class="header">
			<text class="title">健康数据记录</text>
		</view>
		
		<view class="data-type-selector">
			<view class="section-title">
				<text>选择数据类型</text>
			</view>
			<view class="type-list">
				<view 
					v-for="(type, index) in dataTypes" 
					:key="index" 
					class="type-item"
					:class="{'active': selectedType.value === type.value}"
					@click="selectType(type)"
				>
					<image :src="type.icon" mode="aspectFit" class="type-icon"></image>
					<text class="type-name">{{ type.label }}</text>
				</view>
			</view>
		</view>
		
		<view class="data-form">
			<view class="section-title">
				<text>{{ selectedType.label }}数据</text>
			</view>
			
			<!-- 心率输入 -->
			<view v-if="selectedType.value === 'heart_rate'" class="value-input-container">
				<uni-number-box v-model="dataValue" :min="30" :max="220" :step="1" />
				<text class="unit-text">次/分钟</text>
			</view>
			
			<!-- 血压输入 -->
			<view v-if="selectedType.value === 'blood_pressure'" class="blood-pressure-input">
				<view class="bp-row">
					<text class="bp-label">收缩压</text>
					<uni-number-box v-model="systolicValue" :min="60" :max="260" :step="1" />
					<text class="unit-text">mmHg</text>
				</view>
				<view class="bp-row">
					<text class="bp-label">舒张压</text>
					<uni-number-box v-model="diastolicValue" :min="30" :max="180" :step="1" />
					<text class="unit-text">mmHg</text>
				</view>
			</view>
			
			<!-- 血氧输入 -->
			<view v-if="selectedType.value === 'blood_oxygen'" class="value-input-container">
				<uni-number-box v-model="dataValue" :min="70" :max="100" :step="1" />
				<text class="unit-text">%</text>
			</view>
			
			<!-- 血糖输入 -->
			<view v-if="selectedType.value === 'blood_glucose'" class="value-input-container">
				<uni-number-box v-model="dataValue" :min="1" :max="30" :step="0.1" :precision="1" />
				<text class="unit-text">mmol/L</text>
			</view>
			
			<!-- 体温输入 -->
			<view v-if="selectedType.value === 'temperature'" class="value-input-container">
				<uni-number-box v-model="dataValue" :min="35" :max="42" :step="0.1" :precision="1" />
				<text class="unit-text">°C</text>
			</view>
			
			<!-- 体重输入 -->
			<view v-if="selectedType.value === 'weight'" class="value-input-container">
				<uni-number-box v-model="dataValue" :min="30" :max="200" :step="0.1" :precision="1" />
				<text class="unit-text">kg</text>
			</view>
			
			<!-- 其他健康信息 -->
			<view class="additional-info">
				<view class="form-item">
					<text class="form-label">测量时间</text>
					<picker mode="time" :value="measureTime" @change="onTimeChange">
						<view class="time-picker">
							<text>{{ measureTime }}</text>
							<text class="arrow-down">▼</text>
						</view>
					</picker>
				</view>
				
				<view class="form-item">
					<text class="form-label">备注信息</text>
					<textarea 
						v-model="notes" 
						placeholder="请输入备注信息，如：饭前/饭后，运动前/后等"
						class="notes-input"
					></textarea>
				</view>
			</view>
		</view>
		
		<!-- 健康状态反馈 -->
		<view class="health-status" v-if="showHealthStatus">
			<view class="status-icon" :class="statusClass">
				<text class="status-emoji">{{ statusEmoji }}</text>
			</view>
			<view class="status-info">
				<text class="status-text" :class="statusClass">{{ statusText }}</text>
				<text class="status-advice">{{ statusAdvice }}</text>
			</view>
		</view>
		
		<!-- 历史记录展示 -->
		<view class="history-records">
			<view class="section-title">
				<text>最近记录</text>
				<text class="view-more" @click="goToHistory">查看更多</text>
			</view>
			
			<view v-if="recentRecords.length > 0">
				<view v-for="(record, index) in recentRecords" :key="index" class="record-item">
					<view class="record-left">
						<text class="record-value">{{ formatValue(record) }}</text>
						<text class="record-time">{{ formatDateTime(record.timestamp) }}</text>
					</view>
					<view class="record-status" :class="getStatusClass(record)">
						{{ getStatusText(record) }}
					</view>
				</view>
			</view>
			
			<view v-else class="no-records">
				<text>暂无记录</text>
			</view>
		</view>
		
		<!-- 提交按钮 -->
		<view class="submit-action">
			<button class="submit-btn" @click="submitData">保存记录</button>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 定义数据类型
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

// 选中的数据类型
const selectedType = ref(dataTypes.value[0]);

// 数据值
const dataValue = ref(75); // 默认心率值
const systolicValue = ref(120); // 默认收缩压
const diastolicValue = ref(80); // 默认舒张压
const measureTime = ref('12:00');
const notes = ref('');

// 最近记录
const recentRecords = ref([]);

// 选择数据类型
const selectType = (type) => {
	selectedType.value = type;
	
	// 根据类型设置默认值
	if (type.value === 'heart_rate') {
		dataValue.value = 75;
	} else if (type.value === 'blood_oxygen') {
		dataValue.value = 98;
	} else if (type.value === 'blood_glucose') {
		dataValue.value = 5.0;
	} else if (type.value === 'temperature') {
		dataValue.value = 36.5;
	} else if (type.value === 'weight') {
		dataValue.value = 65.0;
	}
	
	// 获取该类型的最近记录
	fetchRecentRecords(type.value);
};

// 修改测量时间
const onTimeChange = (e) => {
	measureTime.value = e.detail.value;
};

// 获取健康状态
const showHealthStatus = computed(() => {
	// 对于体重，不显示健康状态
	if (selectedType.value.value === 'weight') {
		return false;
	}
	return true;
});

// 健康状态CSS类
const statusClass = computed(() => {
	if (selectedType.value.value === 'blood_pressure') {
		if (systolicValue.value > selectedType.value.normal.systolic.max || 
			diastolicValue.value > selectedType.value.normal.diastolic.max) {
			return 'status-high';
		}
		if (systolicValue.value < selectedType.value.normal.systolic.min || 
			diastolicValue.value < selectedType.value.normal.diastolic.min) {
			return 'status-low';
		}
		return 'status-normal';
	} else {
		if (dataValue.value > selectedType.value.normal?.max) {
			return 'status-high';
		}
		if (dataValue.value < selectedType.value.normal?.min) {
			return 'status-low';
		}
		return 'status-normal';
	}
});

// 状态表情
const statusEmoji = computed(() => {
	if (statusClass.value === 'status-high') {
		return '⚠️';
	} else if (statusClass.value === 'status-low') {
		return '⚠️';
	} else {
		return '👍';
	}
});

// 状态文本
const statusText = computed(() => {
	if (statusClass.value === 'status-high') {
		return '偏高';
	} else if (statusClass.value === 'status-low') {
		return '偏低';
	} else {
		return '正常';
	}
});

// 状态建议
const statusAdvice = computed(() => {
	if (selectedType.value.value === 'heart_rate') {
		if (statusClass.value === 'status-high') {
			return '心率偏高，建议放松休息，避免剧烈活动';
		} else if (statusClass.value === 'status-low') {
			return '心率偏低，注意保暖，如有不适请咨询医生';
		} else {
			return '心率正常，继续保持良好的生活习惯';
		}
	} else if (selectedType.value.value === 'blood_pressure') {
		if (statusClass.value === 'status-high') {
			return '血压偏高，注意休息，避免劳累，减少盐分摄入';
		} else if (statusClass.value === 'status-low') {
			return '血压偏低，注意补充水分，避免长时间站立';
		} else {
			return '血压正常，坚持适量运动和健康饮食';
		}
	} else if (selectedType.value.value === 'blood_oxygen') {
		if (statusClass.value === 'status-low') {
			return '血氧偏低，注意休息，保持室内通风，如持续偏低请就医';
		} else {
			return '血氧正常，继续保持良好的呼吸习惯';
		}
	} else if (selectedType.value.value === 'blood_glucose') {
		if (statusClass.value === 'status-high') {
			return '血糖偏高，注意控制碳水化合物摄入，避免甜食';
		} else if (statusClass.value === 'status-low') {
			return '血糖偏低，可适量补充含糖食物，避免空腹';
		} else {
			return '血糖正常，继续保持健康饮食习惯';
		}
	} else if (selectedType.value.value === 'temperature') {
		if (statusClass.value === 'status-high') {
			return '体温偏高，建议休息，多喝水，如持续发热请就医';
		} else if (statusClass.value === 'status-low') {
			return '体温偏低，注意保暖，避免受凉';
		} else {
			return '体温正常，继续保持良好的生活习惯';
		}
	}
	return '';
});

// 格式化数据值显示
const formatValue = (record) => {
	if (!record) return '';
	
	// 根据数据类型格式化
	if (record.type === 'blood_pressure') {
		return `${record.value.systolic}/${record.value.diastolic} mmHg`;
	} else {
		const type = dataTypes.value.find(t => t.value === record.type);
		return `${record.value} ${type?.unit || ''}`;
	}
};

// 格式化日期时间
const formatDateTime = (timestamp) => {
	const date = new Date(timestamp);
	return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

// 补零
const padZero = (num) => {
	return num < 10 ? '0' + num : num;
};

// 获取状态样式
const getStatusClass = (record) => {
	const type = dataTypes.value.find(t => t.value === record.type);
	if (!type || !type.normal) return '';
	
	if (record.type === 'blood_pressure') {
		if (record.value.systolic > type.normal.systolic.max || 
			record.value.diastolic > type.normal.diastolic.max) {
			return 'status-high';
		}
		if (record.value.systolic < type.normal.systolic.min || 
			record.value.diastolic < type.normal.diastolic.min) {
			return 'status-low';
		}
		return 'status-normal';
	} else {
		if (record.value > type.normal.max) return 'status-high';
		if (record.value < type.normal.min) return 'status-low';
		return 'status-normal';
	}
};

// 获取状态文本
const getStatusText = (record) => {
	const statusClass = getStatusClass(record);
	if (statusClass === 'status-high') return '偏高';
	if (statusClass === 'status-low') return '偏低';
	return '正常';
};

// 获取最近记录
const fetchRecentRecords = async (type) => {
	try {
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId');
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: '/api/v1/health/records/recent',
			method: 'GET',
			header: {
				'Authorization': `Bearer ${token}`
			},
			data: {
				userId,
				type,
				limit: 3
			}
		});
		
		const result = response.data;
		
		if (result.code === 200) {
			recentRecords.value = result.data || [];
		} else {
			console.error('获取最近记录失败:', result.message);
		}
	} catch (error) {
		console.error('获取最近记录错误:', error);
	}
};

// 加载模拟数据功能注释掉，因为已经使用Mock.js
// const loadMockRecentRecords = (type) => {
//     const mockRecords = [];
//     const now = new Date();
//     
//     // 生成随机值
//     const generateRandomValue = (type) => {
//         if (type === 'heart_rate') {
//             return Math.floor(Math.random() * 40) + 60; // 60-100
//         } else if (type === 'blood_pressure') {
//             return {
//                 systolic: Math.floor(Math.random() * 50) + 100, // 100-150
//                 diastolic: Math.floor(Math.random() * 30) + 60 // 60-90
//             };
//         } else if (type === 'blood_oxygen') {
//             return Math.floor(Math.random() * 5) + 95; // 95-100
//         } else if (type === 'blood_glucose') {
//             return (Math.random() * 3 + 3.9).toFixed(1); // 3.9-6.9
//         } else if (type === 'temperature') {
//             return (Math.random() * 1.5 + 36).toFixed(1); // 36-37.5
//         } else if (type === 'weight') {
//             return Math.floor(Math.random() * 20) + 60; // 60-80
//         }
//     };
//     
//     // 生成3条最近记录
//     for (let i = 0; i < 3; i++) {
//         const recordTime = new Date(now);
//         recordTime.setHours(now.getHours() - i * 8);
//         
//         mockRecords.push({
//             type,
//             value: generateRandomValue(type),
//             timestamp: recordTime.getTime(),
//             source: '手动录入'
//         });
//     }
//     
//     recentRecords.value = mockRecords;
// };

// 提交数据
const submitData = async () => {
	// 构建数据对象
	let value;
	if (selectedType.value.value === 'blood_pressure') {
		value = {
			systolic: systolicValue.value,
			diastolic: diastolicValue.value
		};
	} else {
		value = dataValue.value;
	}
	
	// 构建测量时间
	const now = new Date();
	const [hours, minutes] = measureTime.value.split(':');
	now.setHours(parseInt(hours));
	now.setMinutes(parseInt(minutes));
	
	// 构建提交的数据
	const healthData = {
		type: selectedType.value.value,
		value,
		timestamp: now.getTime(),
		notes: notes.value,
		source: '手动录入'
	};
	
	try {
		uni.showLoading({
			title: '保存中...'
		});
		
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId');
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: '/api/v1/health/records',
			method: 'POST',
			header: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			data: {
				userId,
				record: healthData
			}
		});
		
		const result = response.data;
		
		uni.hideLoading();
		
		if (result.code === 201) {
			uni.showToast({
				title: '记录保存成功',
				icon: 'success'
			});
			
			// 重置表单
			notes.value = '';
			
			// 刷新最近记录
			fetchRecentRecords(selectedType.value.value);
		} else {
			uni.showToast({
				title: '保存失败: ' + (result.message || '未知错误'),
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('保存健康数据错误:', error);
		uni.hideLoading();
		
		// 显示错误信息
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
};

// 跳转到健康历史页面
const goToHistory = () => {
	uni.navigateTo({
		url: `/pages/elderly/health?type=${selectedType.value.value}`
	});
};

onMounted(() => {
	// 获取当前时间
	const now = new Date();
	measureTime.value = `${padZero(now.getHours())}:${padZero(now.getMinutes())}`;
	
	// 获取最近记录
	fetchRecentRecords(selectedType.value.value);
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

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.view-more {
	font-size: 26rpx;
	color: #007AFF;
	font-weight: normal;
}

.data-type-selector {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.type-list {
	display: flex;
	flex-wrap: wrap;
}

.type-item {
	width: 33.33%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 0;
}

.type-icon {
	width: 80rpx;
	height: 80rpx;
	margin-bottom: 10rpx;
}

.type-name {
	font-size: 28rpx;
	color: #333;
}

.active {
	color: #007AFF;
}

.active .type-icon {
	border: 2rpx solid #007AFF;
	border-radius: 50%;
	padding: 5rpx;
}

.data-form {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.value-input-container {
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 30rpx 0;
}

.unit-text {
	margin-left: 20rpx;
	font-size: 28rpx;
	color: #666;
}

.blood-pressure-input {
	margin: 30rpx 0;
}

.bp-row {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.bp-label {
	width: 100rpx;
	font-size: 28rpx;
	color: #333;
	margin-right: 20rpx;
}

.additional-info {
	margin-top: 40rpx;
}

.form-item {
	margin-bottom: 20rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.time-picker {
	height: 80rpx;
	border: 1px solid #eee;
	border-radius: 8rpx;
	padding: 0 20rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.arrow-down {
	font-size: 24rpx;
	color: #999;
}

.notes-input {
	width: 100%;
	height: 160rpx;
	border: 1px solid #eee;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.health-status {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: center;
}

.status-icon {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 20rpx;
}

.status-emoji {
	font-size: 60rpx;
}

.status-info {
	flex: 1;
}

.status-text {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
}

.status-advice {
	font-size: 26rpx;
	color: #666;
}

.status-normal {
	color: #36b336;
}

.status-high {
	color: #b33636;
}

.status-low {
	color: #3670b3;
}

.history-records {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.record-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.record-item:last-child {
	border-bottom: none;
}

.record-left {
	display: flex;
	flex-direction: column;
}

.record-value {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
}

.record-time {
	font-size: 24rpx;
	color: #999;
}

.record-status {
	font-size: 24rpx;
	padding: 4rpx 16rpx;
	border-radius: 30rpx;
	text-align: center;
}

.no-records {
	text-align: center;
	padding: 40rpx 0;
	color: #999;
}

.submit-action {
	margin-top: 40rpx;
	padding-bottom: 40rpx;
}

.submit-btn {
	background-color: #007AFF;
	color: #fff;
	height: 90rpx;
	line-height: 90rpx;
	border-radius: 45rpx;
	font-size: 32rpx;
}
</style> 