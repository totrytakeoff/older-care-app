<template>
	<view class="container">
		<view class="header">
			<text class="title">健康档案</text>
		</view>
		
		<view class="tab-container">
			<view :class="['tab-item', activeTab === 'medication' ? 'active' : '']" @click="switchTab('medication')">
				<text>用药记录</text>
			</view>
			<view :class="['tab-item', activeTab === 'history' ? 'active' : '']" @click="switchTab('history')">
				<text>病历记录</text>
			</view>
		</view>
		
		<!-- 用药记录 -->
		<view v-if="activeTab === 'medication'" class="tab-content">
			<view class="add-record" @click="showAddMedicationModal">
				<text class="add-icon">+</text>
				<text>添加用药记录</text>
			</view>
			
			<view v-if="medicationRecords.length > 0" class="record-list">
				<view class="record-item" v-for="(record, index) in medicationRecords" :key="index">
					<view class="record-info">
						<text class="record-name">{{ record.drugName }}</text>
						<text class="record-detail">剂量: {{ record.dosage }}</text>
						<text class="record-detail">频率: {{ record.frequency }}</text>
						<text class="record-time">{{ formatTime(record.timestamp) }}</text>
					</view>
				</view>
			</view>
			
			<view v-else class="no-data">
				<text>暂无用药记录</text>
			</view>
		</view>
		
		<!-- 病历记录 -->
		<view v-if="activeTab === 'history'" class="tab-content">
			<view class="add-record" @click="showUploadHistoryModal">
				<text class="add-icon">+</text>
				<text>上传病历</text>
			</view>
			
			<view v-if="medicalHistories.length > 0" class="record-list">
				<view class="record-item" v-for="(history, index) in medicalHistories" :key="index">
					<view class="record-info">
						<text class="record-name">病历文件</text>
						<text class="record-time">{{ formatTime(history.timestamp) }}</text>
					</view>
					<view class="record-action">
						<text class="view-btn" @click="viewMedicalHistory(history)">查看</text>
					</view>
				</view>
			</view>
			
			<view v-else class="no-data">
				<text>暂无病历记录</text>
			</view>
		</view>
		
		<!-- 添加用药记录弹窗 -->
		<uni-popup ref="addMedicationPopup" type="bottom">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">添加用药记录</text>
					<text class="popup-close" @click="closeAddMedicationModal">×</text>
				</view>
				<view class="form-item">
					<text class="label">药品名称</text>
					<input v-model="medicationForm.drugName" placeholder="请输入药品名称" />
				</view>
				<view class="form-item">
					<text class="label">用药剂量</text>
					<input v-model="medicationForm.dosage" placeholder="请输入用药剂量" />
				</view>
				<view class="form-item">
					<text class="label">用药频率</text>
					<input v-model="medicationForm.frequency" placeholder="请输入用药频率，如每日3次" />
				</view>
				<button class="submit-btn" @click="submitMedicationRecord">保存</button>
			</view>
		</uni-popup>
		
		<!-- 上传病历弹窗 -->
		<uni-popup ref="uploadHistoryPopup" type="bottom">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">上传病历</text>
					<text class="popup-close" @click="closeUploadHistoryModal">×</text>
				</view>
				<view class="upload-area" @click="chooseFile">
					<text class="upload-icon">+</text>
					<text>选择文件</text>
					<text v-if="selectedFile" class="selected-file">已选择: {{ selectedFile }}</text>
				</view>
				<button class="submit-btn" @click="submitMedicalHistory">上传</button>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const activeTab = ref('medication');
const medicationRecords = ref([]);
const medicalHistories = ref([]);
const medicationForm = ref({
	drugName: '',
	dosage: '',
	frequency: ''
});
const selectedFile = ref('');

// 打开添加用药记录弹窗
const addMedicationPopup = ref(null);
const showAddMedicationModal = () => {
	addMedicationPopup.value.open('bottom');
};

const closeAddMedicationModal = () => {
	addMedicationPopup.value.close();
	// 重置表单
	medicationForm.value = {
		drugName: '',
		dosage: '',
		frequency: ''
	};
};

// 打开上传病历弹窗
const uploadHistoryPopup = ref(null);
const showUploadHistoryModal = () => {
	uploadHistoryPopup.value.open('bottom');
};

const closeUploadHistoryModal = () => {
	uploadHistoryPopup.value.close();
	selectedFile.value = '';
};

// 切换标签
const switchTab = (tab) => {
	activeTab.value = tab;
};

// 选择文件
const chooseFile = () => {
	uni.chooseFile({
		count: 1,
		extension: ['.pdf', '.jpg', '.png', '.jpeg'],
		success: (res) => {
			const tempFilePaths = res.tempFilePaths;
			if (tempFilePaths && tempFilePaths.length > 0) {
				// 获取文件名
				const filePath = tempFilePaths[0];
				const fileNameWithExt = filePath.substring(filePath.lastIndexOf('/') + 1);
				selectedFile.value = fileNameWithExt;
			}
		}
	});
};

// 提交用药记录
const submitMedicationRecord = async () => {
	// 表单验证
	if (!medicationForm.value.drugName || !medicationForm.value.dosage || !medicationForm.value.frequency) {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none'
		});
		return;
	}
	
	try {
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId') || 1;
		
		const response = await uni.request({
			url: 'http://localhost:3000/api/v1/records/medication',
			method: 'POST',
			header: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			data: {
				userId: userId,
				drugName: medicationForm.value.drugName,
				dosage: medicationForm.value.dosage,
				frequency: medicationForm.value.frequency
			}
		});
		
		const result = response.data;
		
		if (result.code === 201) {
			uni.showToast({
				title: '添加成功',
				icon: 'success'
			});
			
			// 关闭弹窗并重新获取用药记录
			closeAddMedicationModal();
			fetchMedicationRecords();
		} else {
			uni.showToast({
				title: '添加失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('添加用药记录错误:', error);
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
};

// 提交病历
const submitMedicalHistory = async () => {
	if (!selectedFile.value) {
		uni.showToast({
			title: '请选择文件',
			icon: 'none'
		});
		return;
	}
	
	uni.showToast({
		title: '上传成功',
		icon: 'success'
	});
	
	// 关闭弹窗
	closeUploadHistoryModal();
	
	// 模拟上传成功后添加记录
	medicalHistories.value.unshift({
		id: Math.floor(Math.random() * 1000),
		fileName: selectedFile.value,
		fileUrl: 'https://example.com/files/' + selectedFile.value,
		timestamp: new Date().toISOString()
	});
};

// 查看病历
const viewMedicalHistory = (history) => {
	uni.showModal({
		title: '查看病历',
		content: '是否下载并查看该病历文件？',
		success: (res) => {
			if (res.confirm) {
				uni.showToast({
					title: '开始下载',
					icon: 'loading'
				});
				
				// 实际项目中应该调用下载API
				setTimeout(() => {
					uni.showToast({
						title: '文件已打开',
						icon: 'success'
					});
				}, 2000);
			}
		}
	});
};

// 格式化时间
const formatTime = (timeString) => {
	const date = new Date(timeString);
	return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
};

// 获取用药记录
const fetchMedicationRecords = async () => {
	// 模拟数据，实际项目中应该调用API
	medicationRecords.value = [
		{
			id: 1,
			drugName: '阿司匹林',
			dosage: '100mg',
			frequency: '每日1次',
			timestamp: '2023-06-01T08:30:00Z'
		},
		{
			id: 2,
			drugName: '降压药',
			dosage: '10mg',
			frequency: '每日2次',
			timestamp: '2023-05-28T10:20:00Z'
		}
	];
};

// 获取病历记录
const fetchMedicalHistories = async () => {
	// 模拟数据，实际项目中应该调用API
	medicalHistories.value = [
		{
			id: 1,
			fileName: '2023年体检报告.pdf',
			fileUrl: 'https://example.com/files/checkup-2023.pdf',
			timestamp: '2023-05-15T09:30:00Z'
		},
		{
			id: 2,
			fileName: '心电图检查.jpg',
			fileUrl: 'https://example.com/files/ecg.jpg',
			timestamp: '2023-04-20T14:15:00Z'
		}
	];
};

onMounted(() => {
	fetchMedicationRecords();
	fetchMedicalHistories();
});
</script>

<style>
.container {
	padding: 30rpx;
}

.header {
	margin-bottom: 40rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
}

.tab-container {
	display: flex;
	border-bottom: 1px solid #eee;
	margin-bottom: 30rpx;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 20rpx 0;
	font-size: 28rpx;
	color: #666;
}

.tab-item.active {
	color: #007AFF;
	border-bottom: 2px solid #007AFF;
}

.add-record {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background-color: #f8f8f8;
	border-radius: 8rpx;
	margin-bottom: 30rpx;
}

.add-icon {
	font-size: 40rpx;
	margin-right: 10rpx;
	color: #007AFF;
}

.record-list {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
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

.record-name {
	font-size: 32rpx;
	margin-bottom: 10rpx;
	font-weight: bold;
}

.record-detail {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 5rpx;
}

.record-time {
	font-size: 24rpx;
	color: #999;
}

.view-btn {
	padding: 10rpx 30rpx;
	background-color: #f0f0f0;
	color: #007AFF;
	border-radius: 30rpx;
	font-size: 28rpx;
}

.no-data {
	text-align: center;
	padding: 60rpx 0;
	color: #999;
}

/* 弹窗样式 */
.popup-content {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	padding: 30rpx;
	position: relative;
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

.form-item {
	margin-bottom: 30rpx;
}

.label {
	display: block;
	margin-bottom: 10rpx;
	font-size: 28rpx;
	color: #333;
}

input {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx;
	border: 1px solid #ddd;
	border-radius: 8rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.submit-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background-color: #007AFF;
	color: #fff;
	font-size: 32rpx;
	border-radius: 8rpx;
	margin-top: 20rpx;
}

.upload-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 200rpx;
	border: 1px dashed #ddd;
	border-radius: 8rpx;
	margin-bottom: 30rpx;
}

.upload-icon {
	font-size: 60rpx;
	color: #ccc;
	margin-bottom: 10rpx;
}

.selected-file {
	margin-top: 20rpx;
	font-size: 24rpx;
	color: #007AFF;
}
</style> 