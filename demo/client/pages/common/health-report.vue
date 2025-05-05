<template>
	<view class="container">
		<view class="header">
			<text class="title">健康报告</text>
		</view>
		
		<view class="report-options">
			<view class="option-title">
				<text>生成报告周期</text>
			</view>
			<view class="option-buttons">
				<button :class="['option-btn', period === 'weekly' ? 'active' : '']" @click="setPeriod('weekly')">周报</button>
				<button :class="['option-btn', period === 'monthly' ? 'active' : '']" @click="setPeriod('monthly')">月报</button>
			</view>
		</view>
		
		<button class="generate-btn" @click="generateReport">生成健康报告</button>
		
		<view v-if="isGenerating" class="loading">
			<text>正在生成报告，请稍候...</text>
		</view>
		
		<view v-if="reports.length > 0" class="report-list">
			<view class="list-title">
				<text>历史报告</text>
			</view>
			<view class="report-item" v-for="(report, index) in reports" :key="index" @click="viewReport(report)">
				<view class="report-info">
					<text class="report-name">{{ report.period === 'weekly' ? '周健康报告' : '月健康报告' }}</text>
					<text class="report-date">{{ formatDate(report.timestamp) }}</text>
				</view>
				<view class="report-action">
					<text class="view-btn">查看</text>
				</view>
			</view>
		</view>
		
		<view v-else-if="!isGenerating" class="no-reports">
			<text>暂无健康报告，请点击"生成健康报告"按钮</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const period = ref('weekly');
const isGenerating = ref(false);
const reports = ref([]);

// 设置报告周期
const setPeriod = (newPeriod) => {
	period.value = newPeriod;
};

// 生成健康报告
const generateReport = async () => {
	try {
		isGenerating.value = true;
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId') || 1;
		
		// 使用mock请求替代真实API
		const response = await uni.request({
			url: '/api/v1/health/report',
			method: 'GET',
			header: {
				'Authorization': `Bearer ${token}`
			},
			data: {
				userId: userId,
				period: period.value
			}
		});
		
		const result = response.data;
		
		if (result.code === 200) {
			// 添加到报告列表
			const newReport = {
				id: new Date().getTime(),
				period: period.value,
				pdfUrl: 'https://example.com/reports/report.pdf',
				timestamp: new Date().toISOString()
			};
			
			reports.value.unshift(newReport);
			
			uni.showToast({
				title: '报告生成成功',
				icon: 'success'
			});
		} else {
			uni.showToast({
				title: '报告生成失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('生成报告错误:', error);
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	} finally {
		isGenerating.value = false;
	}
};

// 查看报告
const viewReport = (report) => {
	// 打开PDF查看器或者使用系统浏览器打开
	uni.showModal({
		title: '查看报告',
		content: '是否下载并查看该健康报告？',
		success: (res) => {
			if (res.confirm) {
				// 下载报告
				uni.downloadFile({
					url: report.pdfUrl,
					success: (downloadRes) => {
						const filePath = downloadRes.tempFilePath;
						// 打开文件
						uni.openDocument({
							filePath: filePath,
							success: () => {
								console.log('打开报告成功');
							},
							fail: () => {
								uni.showToast({
									title: '打开文件失败',
									icon: 'none'
								});
							}
						});
					},
					fail: () => {
						uni.showToast({
							title: '下载报告失败',
							icon: 'none'
						});
					}
				});
			}
		}
	});
};

// 格式化日期
const formatDate = (dateString) => {
	const date = new Date(dateString);
	return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 获取历史报告
const fetchReports = async () => {
	try {
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId') || 1;
		
		// 使用mock数据，实际项目中应该调用API
		reports.value = [
			{
				id: 101,
				period: 'weekly',
				pdfUrl: 'https://example.com/reports/weekly-101.pdf',
				timestamp: '2023-06-01T08:30:00Z'
			},
			{
				id: 102,
				period: 'monthly',
				pdfUrl: 'https://example.com/reports/monthly-102.pdf',
				timestamp: '2023-05-15T10:20:00Z'
			}
		];
	} catch (error) {
		console.error('获取报告列表错误:', error);
	}
};

onMounted(() => {
	fetchReports();
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

.report-options {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.option-title {
	margin-bottom: 20rpx;
	font-size: 32rpx;
}

.option-buttons {
	display: flex;
	justify-content: space-between;
}

.option-btn {
	width: 48%;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
	background-color: #f5f5f5;
	color: #666;
}

.option-btn.active {
	background-color: #007AFF;
	color: #fff;
}

.generate-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background-color: #007AFF;
	color: #fff;
	font-size: 32rpx;
	border-radius: 8rpx;
	margin-bottom: 40rpx;
}

.loading {
	text-align: center;
	padding: 40rpx 0;
	color: #666;
}

.report-list {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.list-title {
	margin-bottom: 20rpx;
	font-size: 32rpx;
	font-weight: bold;
}

.report-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1px solid #f0f0f0;
}

.report-item:last-child {
	border-bottom: none;
}

.report-name {
	font-size: 32rpx;
	margin-bottom: 10rpx;
}

.report-date {
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

.no-reports {
	text-align: center;
	padding: 60rpx 0;
	color: #999;
}
</style> 