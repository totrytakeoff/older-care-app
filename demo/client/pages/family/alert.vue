<template>
	<view class="container">
		<view class="header">
			<text class="title">报警记录</text>
		</view>
		
		<view class="filter-bar">
			<view class="filter-item" @click="showStatusFilter">
				<text>状态: {{ statusFilterLabel }}</text>
				<text class="arrow-down">▼</text>
			</view>
			<view class="filter-item" @click="showTypeFilter">
				<text>类型: {{ typeFilterLabel }}</text>
				<text class="arrow-down">▼</text>
			</view>
		</view>
		
		<view v-if="alerts.length > 0" class="alert-list">
			<view class="alert-item" v-for="(alert, index) in filteredAlerts" :key="index">
				<view class="alert-header">
					<text :class="['alert-type', getTypeClass(alert.type)]">{{ getAlertTypeName(alert.type) }}</text>
					<text :class="['alert-status', alert.status === 'resolved' ? 'resolved' : 'pending']">
						{{ alert.status === 'resolved' ? '已处理' : '待处理' }}
					</text>
				</view>
				<view class="alert-content">
					<view class="alert-info">
						<text class="alert-label">报警位置:</text>
						<text class="alert-value">{{ alert.location || '未知' }}</text>
					</view>
					<view class="alert-info">
						<text class="alert-label">报警时间:</text>
						<text class="alert-value">{{ formatTime(alert.timestamp) }}</text>
					</view>
					<view class="alert-info" v-if="alert.notes">
						<text class="alert-label">备注:</text>
						<text class="alert-value">{{ alert.notes }}</text>
					</view>
				</view>
				<view class="alert-actions" v-if="alert.status === 'pending'">
					<button class="action-btn" @click="handleAlert(alert.id)">处理</button>
					<button class="action-btn call">通话</button>
				</view>
			</view>
		</view>
		
		<view v-else class="no-data">
			<text>暂无报警记录</text>
		</view>
		
		<!-- 状态过滤弹窗 -->
		<view class="modal" v-if="showStatusFilterModal">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">选择状态</text>
					<text class="modal-close" @click="hideStatusFilter">×</text>
				</view>
				<view class="filter-options">
					<view 
						:class="['filter-option', statusFilter === 'all' ? 'active' : '']" 
						@click="selectStatusFilter('all')"
					>全部</view>
					<view 
						:class="['filter-option', statusFilter === 'pending' ? 'active' : '']" 
						@click="selectStatusFilter('pending')"
					>待处理</view>
					<view 
						:class="['filter-option', statusFilter === 'resolved' ? 'active' : '']" 
						@click="selectStatusFilter('resolved')"
					>已处理</view>
				</view>
			</view>
		</view>
		
		<!-- 类型过滤弹窗 -->
		<view class="modal" v-if="showTypeFilterModal">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">选择类型</text>
					<text class="modal-close" @click="hideTypeFilter">×</text>
				</view>
				<view class="filter-options">
					<view 
						:class="['filter-option', typeFilter === 'all' ? 'active' : '']" 
						@click="selectTypeFilter('all')"
					>全部</view>
					<view 
						:class="['filter-option', typeFilter === 'fall' ? 'active' : '']" 
						@click="selectTypeFilter('fall')"
					>跌倒报警</view>
					<view 
						:class="['filter-option', typeFilter === 'heartRate' ? 'active' : '']" 
						@click="selectTypeFilter('heartRate')"
					>心率异常</view>
					<view 
						:class="['filter-option', typeFilter === 'bloodPressure' ? 'active' : '']" 
						@click="selectTypeFilter('bloodPressure')"
					>血压异常</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 报警记录列表
const alerts = ref([]);
// 过滤条件
const statusFilter = ref('all');
const typeFilter = ref('all');
// 弹窗控制
const showStatusFilterModal = ref(false);
const showTypeFilterModal = ref(false);

// 状态过滤器标签
const statusFilterLabel = computed(() => {
	const map = {
		'all': '全部',
		'pending': '待处理',
		'resolved': '已处理'
	};
	return map[statusFilter.value] || '全部';
});

// 类型过滤器标签
const typeFilterLabel = computed(() => {
	const map = {
		'all': '全部',
		'fall': '跌倒报警',
		'heartRate': '心率异常',
		'bloodPressure': '血压异常'
	};
	return map[typeFilter.value] || '全部';
});

// 按过滤条件筛选的报警列表
const filteredAlerts = computed(() => {
	return alerts.value.filter(alert => {
		const statusMatch = statusFilter.value === 'all' || alert.status === statusFilter.value;
		const typeMatch = typeFilter.value === 'all' || alert.type === typeFilter.value;
		return statusMatch && typeMatch;
	});
});

// 获取报警记录
const fetchAlerts = async () => {
	try {
		const token = uni.getStorageSync('token');
		const elderId = uni.getStorageSync('currentElderId') || 1;
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: `/api/v1/alerts?userId=${elderId}`,
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
			uni.showToast({
				title: '获取报警记录失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取报警记录错误:', error);
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
};

// 显示状态过滤弹窗
const showStatusFilter = () => {
	showStatusFilterModal.value = true;
};

// 隐藏状态过滤弹窗
const hideStatusFilter = () => {
	showStatusFilterModal.value = false;
};

// 选择状态过滤器
const selectStatusFilter = (status) => {
	statusFilter.value = status;
	hideStatusFilter();
};

// 显示类型过滤弹窗
const showTypeFilter = () => {
	showTypeFilterModal.value = true;
};

// 隐藏类型过滤弹窗
const hideTypeFilter = () => {
	showTypeFilterModal.value = false;
};

// 选择类型过滤器
const selectTypeFilter = (type) => {
	typeFilter.value = type;
	hideTypeFilter();
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
					// 输入备注
					uni.showModal({
						title: '添加备注',
						editable: true,
						placeholderText: '请输入处理备注（可选）',
						success: async (noteRes) => {
							const notes = noteRes.content || '家属已确认处理';
							
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
									notes: notes
								}
							});
							
							const result = response.data;
							if (result.code === 200) {
								uni.showToast({
									title: '处理成功',
									icon: 'success'
								});
								
								// 更新报警状态
								const alertIndex = alerts.value.findIndex(a => a.id === alertId);
								if (alertIndex !== -1) {
									alerts.value[alertIndex].status = 'resolved';
									alerts.value[alertIndex].notes = notes;
								}
							} else {
								uni.showToast({
									title: '处理失败',
									icon: 'none'
								});
							}
						}
					});
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

// 获取报警类型名称
const getAlertTypeName = (type) => {
	const typeMap = {
		'fall': '跌倒报警',
		'heartRate': '心率异常',
		'bloodPressure': '血压异常'
	};
	return typeMap[type] || '未知报警';
};

// 获取报警类型的样式类名
const getTypeClass = (type) => {
	const classMap = {
		'fall': 'fall',
		'heartRate': 'heart',
		'bloodPressure': 'blood'
	};
	return classMap[type] || '';
};

// 格式化时间
const formatTime = (timeString) => {
	const date = new Date(timeString);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	
	return `${year}年${month}月${day}日 ${hours}:${minutes}`;
};

// 模拟数据功能注释掉，因为已经使用Mock.js
// const mockAlerts = () => {
//     alerts.value = [
//         {
//             id: 1,
//             type: 'fall',
//             status: 'pending',
//             location: '卧室',
//             timestamp: '2023-06-01T08:30:00Z'
//         },
//         {
//             id: 2,
//             type: 'heartRate',
//             status: 'resolved',
//             location: '客厅',
//             timestamp: '2023-05-28T15:20:00Z',
//             notes: '已联系老人确认，属误报'
//         },
//         {
//             id: 3,
//             type: 'bloodPressure',
//             status: 'pending',
//             location: '卫生间',
//             timestamp: '2023-05-25T22:10:00Z'
//         }
//     ];
// };

onMounted(() => {
	// 获取报警记录
	fetchAlerts();
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

.filter-bar {
	display: flex;
	background-color: #fff;
	border-radius: 8rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.filter-item {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20rpx 0;
	font-size: 28rpx;
	position: relative;
}

.filter-item:first-child::after {
	content: '';
	position: absolute;
	right: 0;
	top: 20%;
	height: 60%;
	width: 1px;
	background-color: #eee;
}

.arrow-down {
	font-size: 20rpx;
	margin-left: 10rpx;
	color: #999;
}

.alert-list {
	margin-top: 20rpx;
}

.alert-item {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.alert-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.alert-type {
	font-size: 32rpx;
	font-weight: bold;
	padding: 10rpx 20rpx;
	border-radius: 8rpx;
}

.alert-type.fall {
	background-color: #ffe8e8;
	color: #ff3b30;
}

.alert-type.heart {
	background-color: #fff5e6;
	color: #ff9500;
}

.alert-type.blood {
	background-color: #e6f2ff;
	color: #007aff;
}

.alert-status {
	font-size: 24rpx;
	padding: 6rpx 16rpx;
	border-radius: 30rpx;
}

.pending {
	background-color: #fff0e6;
	color: #ff9500;
}

.resolved {
	background-color: #e6f7e6;
	color: #36b336;
}

.alert-content {
	margin-bottom: 20rpx;
}

.alert-info {
	display: flex;
	margin-bottom: 10rpx;
}

.alert-label {
	font-size: 28rpx;
	color: #666;
	width: 180rpx;
}

.alert-value {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}

.alert-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 20rpx;
}

.action-btn {
	margin-left: 20rpx;
	font-size: 28rpx;
	padding: 8rpx 30rpx;
	background-color: #007AFF;
	color: #fff;
	border-radius: 30rpx;
	line-height: 1.8;
}

.action-btn.call {
	background-color: #4cd964;
}

.no-data {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
}

/* 弹窗样式 */
.modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 999;
	display: flex;
	justify-content: center;
	align-items: center;
}

.modal-content {
	width: 80%;
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
}

.modal-close {
	font-size: 40rpx;
	color: #999;
}

.filter-options {
	display: flex;
	flex-direction: column;
}

.filter-option {
	padding: 20rpx 0;
	font-size: 28rpx;
	border-bottom: 1px solid #f0f0f0;
}

.filter-option:last-child {
	border-bottom: none;
}

.filter-option.active {
	color: #007AFF;
}
</style> 