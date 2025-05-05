<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{ title }}</text>
		</view>
		<view v-if="healthData" class="health-data">
			<text>实时健康数据：</text>
			<text>心率: {{ healthData.heartRate }}</text>
			<text>收缩压: {{ healthData.bloodPressure.systolic }}</text>
			<text>舒张压: {{ healthData.bloodPressure.diastolic }}</text>
			<text>血氧: {{ healthData.bloodOxygen }}</text>
		</view>
		<button @click="fetchHealthData">获取健康数据</button>
		<button @click="fetchAlerts">获取报警记录</button>
		<button @click="generateHealthReport">生成健康报告</button>
		<view v-if="alerts.length > 0" class="alerts">
			<text>报警记录：</text>
			<view v-for="alert in alerts" :key="alert.id">
				<text>类型: {{ alert.type }}</text>
				<text>状态: {{ alert.status }}</text>
			</view>
		</view>
		<view v-if="reportUrl" class="report">
			<text>健康报告：</text>
			<a :href="reportUrl" target="_blank">查看报告</a>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const title = ref('Hello');
const healthData = ref(null);
const alerts = ref([]);
const reportUrl = ref('');

const fetchHealthData = async () => {
	try {
		const response = await fetch('http://localhost:3000/api/v1/health/real-time?userId=1', {
			headers: {
				'Authorization': 'Bearer your-token-here'
			}
		});
		const data = await response.json();
		if (data.code === 200) {
			healthData.value = data.data;
		}
	} catch (error) {
		console.error('获取健康数据失败:', error);
	}
};

const fetchAlerts = async () => {
	try {
		const response = await fetch('http://localhost:3000/api/v1/alerts?userId=1', {
			headers: {
				'Authorization': 'Bearer your-token-here'
			}
		});
		const data = await response.json();
		if (data.code === 200) {
			alerts.value = data.data;
		}
	} catch (error) {
		console.error('获取报警记录失败:', error);
	}
};

const generateHealthReport = async () => {
	try {
		const response = await fetch('http://localhost:3000/api/v1/ai/report', {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer your-token-here',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ userId: 1, period: 'weekly' })
		});
		const data = await response.json();
		if (data.code === 202) {
			reportUrl.value = data.data.pdfUrl;
		}
	} catch (error) {
		console.error('生成健康报告失败:', error);
	}
};

onMounted(() => {
	// 页面加载时执行
});
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}

	.health-data {
		margin-top: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.alerts {
		margin-top: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.report {
		margin-top: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
