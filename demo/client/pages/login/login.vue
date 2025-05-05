<template>
	<view class="container">
		<view class="logo">
			<image src="/static/logo.png" mode="aspectFit"></image>
		</view>
		<view class="form">
			<view class="form-item">
				<text class="label">手机号码</text>
				<input v-model="phone" type="number" placeholder="请输入手机号码" maxlength="11" />
			</view>
			<view class="form-item">
				<text class="label">密码</text>
				<input v-model="password" type="password" placeholder="请输入密码" />
			</view>
			<button class="login-btn" @click="handleLogin">登录</button>
			<view class="register-link">
				<text @click="goToRegister">还没有账号？去注册</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

const phone = ref('');
const password = ref('');

const handleLogin = async () => {
	// 表单验证
	if (!phone.value || !password.value) {
		uni.showToast({
			title: '手机号或密码不能为空',
			icon: 'none'
		});
		return;
	}
	
	try {
		// 调用登录接口
		const response = await uni.request({
			url: 'http://localhost:3000/api/v1/auth/login',
			method: 'POST',
			data: {
				phone: phone.value,
				password: password.value
			}
		});
		
		const result = response.data;
		
		if (result.code === 200) {
			// 保存token到本地存储
			uni.setStorageSync('token', result.data.token);
			uni.setStorageSync('role', result.data.role);
			
			// 根据角色跳转到不同页面
			const role = result.data.role;
			let targetPage = '';
			
			switch (role) {
				case 'elderly':
					targetPage = '/pages/elderly/home';
					break;
				case 'family':
					targetPage = '/pages/family/home';
					break;
				case 'doctor':
					targetPage = '/pages/doctor/home';
					break;
				default:
					targetPage = '/pages/index/index';
			}
			
			uni.switchTab({
				url: targetPage,
				success: () => {
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});
				}
			});
		} else {
			uni.showToast({
				title: '登录失败: ' + (result.message || '请检查账号密码'),
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('登录错误:', error);
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
};

const goToRegister = () => {
	uni.navigateTo({
		url: '/pages/register/register'
	});
};
</script>

<style>
.container {
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.logo {
	margin-bottom: 60rpx;
	width: 200rpx;
	height: 200rpx;
}

.logo image {
	width: 100%;
	height: 100%;
}

.form {
	width: 100%;
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

.login-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background-color: #007AFF;
	color: #fff;
	font-size: 32rpx;
	border-radius: 8rpx;
	margin-top: 40rpx;
}

.register-link {
	text-align: center;
	margin-top: 30rpx;
	font-size: 28rpx;
	color: #007AFF;
}
</style> 