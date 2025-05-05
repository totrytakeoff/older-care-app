<template>
	<view class="container">
		<view class="header">
			<text class="title">设备管理</text>
		</view>
		
		<view class="device-list">
			<view class="section-title">
				<text>已绑定设备</text>
			</view>
			
			<view v-if="devices.length > 0">
				<view v-for="(device, index) in devices" :key="device.id" class="device-item">
					<view class="device-icon">
						<image :src="getDeviceIcon(device.type)" mode="aspectFit"></image>
					</view>
					<view class="device-info">
						<text class="device-name">{{ device.name }}</text>
						<text class="device-status" :class="device.status === '在线' ? 'online' : 'offline'">
							{{ device.status }}
						</text>
						<text class="device-id">设备ID: {{ device.deviceId }}</text>
						<text class="last-sync" v-if="device.lastSync">
							上次同步: {{ formatTime(device.lastSync) }}
						</text>
					</view>
					<view class="device-actions">
						<button class="action-btn" @click="unbindDevice(device)">解绑</button>
					</view>
				</view>
			</view>
			
			<view v-else class="no-device">
				<image src="/static/images/no-device.png" mode="aspectFit" class="no-device-img"></image>
				<text class="no-device-text">暂无绑定设备</text>
				<text class="no-device-tip">绑定设备后可自动同步健康数据</text>
			</view>
		</view>
		
		<!-- 添加设备按钮 -->
		<view class="add-device">
			<button class="add-device-btn" @click="showDeviceTypeModal">添加设备</button>
		</view>
		
		<!-- 设备类型选择弹窗 -->
		<uni-popup ref="deviceTypePopup" type="bottom">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">选择设备类型</text>
					<text class="popup-close" @click="hideDeviceTypeModal">×</text>
				</view>
				<view class="device-type-list">
					<view 
						v-for="(type, index) in deviceTypes" 
						:key="index" 
						class="device-type-item"
						@click="selectDeviceType(type)"
					>
						<image :src="type.icon" mode="aspectFit" class="device-type-icon"></image>
						<text class="device-type-name">{{ type.name }}</text>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 绑定设备弹窗 -->
		<uni-popup ref="bindDevicePopup" type="center">
			<view class="bind-popup-content">
				<view class="popup-header">
					<text class="popup-title">绑定{{ selectedType.name }}</text>
					<text class="popup-close" @click="hideBindDeviceModal">×</text>
				</view>
				<view class="bind-form">
					<view class="form-item">
						<text class="form-label">设备名称</text>
						<input type="text" v-model="deviceName" placeholder="输入设备名称" />
					</view>
					<view class="form-item">
						<text class="form-label">设备ID</text>
						<input type="text" v-model="deviceId" placeholder="输入设备ID" />
					</view>
					<view class="form-item">
						<text class="form-label">配对码</text>
						<input type="text" v-model="pairCode" placeholder="输入配对码" />
					</view>
				</view>
				<view class="bind-actions">
					<button class="bind-cancel" @click="hideBindDeviceModal">取消</button>
					<button class="bind-confirm" @click="bindDevice">确认绑定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 设备列表
const devices = ref([]);
const deviceTypes = ref([
	{
		id: 1,
		name: '智能手环',
		icon: '/static/images/device-bracelet.png',
		code: 'bracelet'
	},
	{
		id: 2,
		name: '血压计',
		icon: '/static/images/device-bp.png',
		code: 'bp_monitor'
	},
	{
		id: 3,
		name: '血氧仪',
		icon: '/static/images/device-spo2.png',
		code: 'spo2_monitor'
	},
	{
		id: 4,
		name: '血糖仪',
		icon: '/static/images/device-glucose.png',
		code: 'glucose_monitor'
	}
]);

// 选中的设备类型
const selectedType = ref({});

// 绑定设备表单
const deviceName = ref('');
const deviceId = ref('');
const pairCode = ref('');

// 弹窗引用
const deviceTypePopup = ref(null);
const bindDevicePopup = ref(null);

// 获取设备图标
const getDeviceIcon = (type) => {
	const deviceType = deviceTypes.value.find(item => item.code === type);
	return deviceType ? deviceType.icon : '/static/images/device-default.png';
}

// 格式化时间
const formatTime = (timestamp) => {
	const date = new Date(timestamp);
	return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

// 补零
const padZero = (num) => {
	return num < 10 ? '0' + num : num;
}

// 显示设备类型选择弹窗
const showDeviceTypeModal = () => {
	deviceTypePopup.value.open();
}

// 隐藏设备类型选择弹窗
const hideDeviceTypeModal = () => {
	deviceTypePopup.value.close();
}

// 选择设备类型
const selectDeviceType = (type) => {
	selectedType.value = type;
	hideDeviceTypeModal();
	showBindDeviceModal();
}

// 显示绑定设备弹窗
const showBindDeviceModal = () => {
	// 重置表单
	deviceName.value = '';
	deviceId.value = '';
	pairCode.value = '';
	bindDevicePopup.value.open();
}

// 隐藏绑定设备弹窗
const hideBindDeviceModal = () => {
	bindDevicePopup.value.close();
}

// 绑定设备
const bindDevice = async () => {
	// 表单验证
	if (!deviceName.value) {
		uni.showToast({
			title: '请输入设备名称',
			icon: 'none'
		});
		return;
	}
	
	if (!deviceId.value) {
		uni.showToast({
			title: '请输入设备ID',
			icon: 'none'
		});
		return;
	}
	
	if (!pairCode.value) {
		uni.showToast({
			title: '请输入配对码',
			icon: 'none'
		});
		return;
	}
	
	try {
		uni.showLoading({
			title: '绑定中...'
		});
		
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId');
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: '/api/v1/devices/bind',
			method: 'POST',
			header: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			data: {
				userId,
				deviceType: selectedType.value.code,
				deviceName: deviceName.value,
				deviceId: deviceId.value,
				pairCode: pairCode.value
			}
		});
		
		const result = response.data;
		
		uni.hideLoading();
		
		if (result.code === 200) {
			uni.showToast({
				title: '设备绑定成功',
				icon: 'success'
			});
			
			hideBindDeviceModal();
			fetchDevices();
		} else {
			uni.showToast({
				title: result.message || '绑定失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('绑定设备错误:', error);
		uni.hideLoading();
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
}

// 解绑设备
const unbindDevice = (device) => {
	uni.showModal({
		title: '解绑设备',
		content: `确定要解绑"${device.name}"吗？`,
		success: async (res) => {
			if (res.confirm) {
				try {
					uni.showLoading({
						title: '解绑中...'
					});
					
					const token = uni.getStorageSync('token');
					
					// 使用mock请求替代真实API
					const response = await uni.request({
						url: '/api/v1/devices/unbind',
						method: 'POST',
						header: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
						},
						data: {
							deviceId: device.id
						}
					});
					
					const result = response.data;
					
					uni.hideLoading();
					
					if (result.code === 200) {
						uni.showToast({
							title: '设备解绑成功',
							icon: 'success'
						});
						
						fetchDevices();
					} else {
						uni.showToast({
							title: result.message || '解绑失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('解绑设备错误:', error);
					uni.hideLoading();
					uni.showToast({
						title: '网络错误，请稍后重试',
						icon: 'none'
					});
				}
			}
		}
	});
}

// 获取已绑定设备列表
const fetchDevices = async () => {
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId');
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: `/api/v1/devices?userId=${userId}`,
			method: 'GET',
			header: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		const result = response.data;
		
		uni.hideLoading();
		
		if (result.code === 200) {
			devices.value = result.data || [];
		} else {
			uni.showToast({
				title: result.message || '获取设备列表失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取设备列表错误:', error);
		uni.hideLoading();
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
}

// 模拟数据功能注释掉，因为已经使用Mock.js
// const loadMockData = () => {
//     devices.value = [
//         {
//             id: 1,
//             name: '我的手环',
//             deviceId: 'BR-10086',
//             type: 'bracelet',
//             status: '在线',
//             lastSync: Date.now() - 3600000 // 1小时前
//         },
//         {
//             id: 2,
//             name: '家用血压计',
//             deviceId: 'BP-20220',
//             type: 'bp_monitor',
//             status: '离线',
//             lastSync: Date.now() - 86400000 * 2 // 2天前
//         }
//     ];
// }

onMounted(() => {
	// 直接调用fetchDevices，不再使用try-catch和备用模拟数据
	fetchDevices();
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
}

.device-list {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.device-item {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #eee;
}

.device-item:last-child {
	border-bottom: none;
}

.device-icon {
	width: 100rpx;
	height: 100rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 20rpx;
}

.device-icon image {
	width: 80rpx;
	height: 80rpx;
}

.device-info {
	flex: 1;
}

.device-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 6rpx;
}

.device-status {
	font-size: 24rpx;
	margin-bottom: 6rpx;
}

.online {
	color: #4cd964;
}

.offline {
	color: #999;
}

.device-id {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 6rpx;
}

.last-sync {
	font-size: 24rpx;
	color: #999;
}

.device-actions {
	padding-left: 20rpx;
}

.action-btn {
	font-size: 24rpx;
	padding: 6rpx 20rpx;
	background-color: #f5f5f5;
	color: #666;
	border-radius: 30rpx;
}

.no-device {
	padding: 60rpx 0;
	text-align: center;
}

.no-device-img {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 20rpx;
}

.no-device-text {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.no-device-tip {
	font-size: 24rpx;
	color: #999;
}

.add-device {
	margin-top: 40rpx;
	padding: 0 30rpx;
}

.add-device-btn {
	background-color: #007AFF;
	color: #fff;
	height: 90rpx;
	line-height: 90rpx;
	border-radius: 45rpx;
	font-size: 32rpx;
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

.device-type-list {
	display: flex;
	flex-wrap: wrap;
}

.device-type-item {
	width: 25%;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 30rpx;
}

.device-type-icon {
	width: 80rpx;
	height: 80rpx;
	margin-bottom: 10rpx;
}

.device-type-name {
	font-size: 24rpx;
	color: #333;
}

.bind-popup-content {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	width: 560rpx;
}

.bind-form {
	margin-top: 20rpx;
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

input {
	width: 100%;
	height: 80rpx;
	border: 1px solid #eee;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.bind-actions {
	display: flex;
	justify-content: space-between;
	margin-top: 30rpx;
}

.bind-cancel, .bind-confirm {
	width: 240rpx;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
}

.bind-cancel {
	background-color: #f5f5f5;
	color: #666;
}

.bind-confirm {
	background-color: #007AFF;
	color: #fff;
}
</style> 