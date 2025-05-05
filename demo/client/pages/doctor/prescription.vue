<template>
	<view class="container">
		<view class="header">
			<text class="title">开具处方</text>
		</view>
		
		<view class="patient-info-card">
			<view class="section-title">
				<text>患者信息</text>
			</view>
			<view class="patient-info">
				<view class="info-item">
					<text class="info-label">姓名：</text>
					<text class="info-value">{{ patientName }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">ID：</text>
					<text class="info-value">{{ patientId }}</text>
				</view>
			</view>
		</view>
		
		<view class="prescription-form">
			<view class="section-title">
				<text>处方内容</text>
			</view>
			
			<view class="form-item">
				<text class="form-label">诊断</text>
				<textarea v-model="diagnosis" placeholder="请输入诊断结果" />
			</view>
			
			<view class="medication-section">
				<view class="section-subtitle">
					<text>药品</text>
					<text class="add-btn" @click="addMedication">+ 添加药品</text>
				</view>
				
				<view v-for="(med, index) in medications" :key="index" class="medication-item">
					<view class="medication-header">
						<text class="medication-index">药品 {{ index + 1 }}</text>
						<text class="delete-btn" @click="removeMedication(index)">删除</text>
					</view>
					
					<view class="form-item">
						<text class="form-label">药品名称</text>
						<input type="text" v-model="med.name" placeholder="请输入药品名称" />
					</view>
					
					<view class="form-item">
						<text class="form-label">规格</text>
						<input type="text" v-model="med.specification" placeholder="请输入药品规格" />
					</view>
					
					<view class="form-item">
						<text class="form-label">用法用量</text>
						<input type="text" v-model="med.dosage" placeholder="请输入用法用量" />
					</view>
					
					<view class="form-item">
						<text class="form-label">数量</text>
						<input type="number" v-model="med.quantity" placeholder="请输入数量" />
					</view>
				</view>
				
				<view v-if="medications.length === 0" class="no-data">
					<text>请添加药品</text>
				</view>
			</view>
			
			<view class="form-item">
				<text class="form-label">医嘱</text>
				<textarea v-model="instructions" placeholder="请输入医嘱内容" />
			</view>
		</view>
		
		<view class="action-buttons">
			<button class="action-btn preview" @click="previewPrescription">预览</button>
			<button class="action-btn submit" @click="submitPrescription">开具处方</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const patientId = ref('');
const patientName = ref('');
const diagnosis = ref('');
const medications = ref([]);
const instructions = ref('');

// 添加药品
const addMedication = () => {
	medications.value.push({
		name: '',
		specification: '',
		dosage: '',
		quantity: 1
	});
};

// 删除药品
const removeMedication = (index) => {
	medications.value.splice(index, 1);
};

// 预览处方
const previewPrescription = () => {
	// 检查必填项
	if (!diagnosis.value) {
		uni.showToast({
			title: '请输入诊断结果',
			icon: 'none'
		});
		return;
	}
	
	if (medications.value.length === 0) {
		uni.showToast({
			title: '请添加至少一种药品',
			icon: 'none'
		});
		return;
	}
	
	// 检查药品信息是否完整
	for (let i = 0; i < medications.value.length; i++) {
		const med = medications.value[i];
		if (!med.name || !med.dosage) {
			uni.showToast({
				title: `请完善药品${i + 1}的信息`,
				icon: 'none'
			});
			return;
		}
	}
	
	// 生成预览内容
	let content = `患者：${patientName.value}\n`;
	content += `诊断：${diagnosis.value}\n\n`;
	content += `药品：\n`;
	
	medications.value.forEach((med, index) => {
		content += `${index + 1}. ${med.name} ${med.specification || ''}\n`;
		content += `   用法用量：${med.dosage}\n`;
		content += `   数量：${med.quantity}\n\n`;
	});
	
	if (instructions.value) {
		content += `医嘱：${instructions.value}\n`;
	}
	
	// 显示预览
	uni.showModal({
		title: '处方预览',
		content: content,
		showCancel: true,
		confirmText: '确认',
		cancelText: '返回编辑'
	});
};

// 提交处方
const submitPrescription = async () => {
	// 检查必填项
	if (!diagnosis.value) {
		uni.showToast({
			title: '请输入诊断结果',
			icon: 'none'
		});
		return;
	}
	
	if (medications.value.length === 0) {
		uni.showToast({
			title: '请添加至少一种药品',
			icon: 'none'
		});
		return;
	}
	
	// 检查药品信息是否完整
	for (let i = 0; i < medications.value.length; i++) {
		const med = medications.value[i];
		if (!med.name || !med.dosage) {
			uni.showToast({
				title: `请完善药品${i + 1}的信息`,
				icon: 'none'
			});
			return;
		}
	}
	
	// 构建处方内容
	const prescriptionContent = {
		diagnosis: diagnosis.value,
		medications: medications.value,
		instructions: instructions.value
	};
	
	try {
		const token = uni.getStorageSync('token');
		const doctorId = uni.getStorageSync('userId');
		
		uni.showLoading({
			title: '提交中...'
		});
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: '/api/v1/records/prescription',
			method: 'POST',
			header: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			data: {
				userId: patientId.value,
				doctorId: doctorId,
				content: JSON.stringify(prescriptionContent)
			}
		});
		
		uni.hideLoading();
		
		const result = response.data;
		
		if (result.code === 201) {
			uni.showToast({
				title: '处方开具成功',
				icon: 'success'
			});
			
			// 延迟返回到上一页
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		} else {
			uni.showToast({
				title: '处方开具失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('处方提交错误:', error);
		uni.hideLoading();
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
};

// 获取URL参数
const getParams = () => {
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	const options = currentPage.options;
	
	if (options) {
		patientId.value = options.userId || '';
		patientName.value = decodeURIComponent(options.name || '');
	} else {
		// 模拟数据
		patientId.value = '1001';
		patientName.value = '张大爷';
	}
};

onMounted(() => {
	getParams();
	// 默认添加一个空药品项
	addMedication();
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

.section-subtitle {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 28rpx;
	font-weight: bold;
	margin: 30rpx 0 20rpx;
}

.add-btn {
	font-size: 26rpx;
	color: #007AFF;
	font-weight: normal;
}

.patient-info-card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.patient-info {
	display: flex;
	flex-wrap: wrap;
}

.info-item {
	width: 50%;
	margin-bottom: 10rpx;
	display: flex;
}

.info-label {
	font-size: 28rpx;
	color: #666;
}

.info-value {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
}

.prescription-form {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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

textarea {
	width: 100%;
	height: 160rpx;
	border: 1px solid #eee;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.medication-item {
	border: 1px solid #eee;
	border-radius: 8rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.medication-header {
	display: flex;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.medication-index {
	font-size: 28rpx;
	font-weight: bold;
}

.delete-btn {
	font-size: 26rpx;
	color: #ff3b30;
}

.no-data {
	text-align: center;
	padding: 40rpx 0;
	color: #999;
	border: 1px dashed #ddd;
	border-radius: 8rpx;
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

.preview {
	background-color: #f0f0f0;
	color: #333;
}

.submit {
	background-color: #007AFF;
	color: #fff;
}
</style> 