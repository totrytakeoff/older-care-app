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
			<view class="form-item">
				<text class="label">确认密码</text>
				<input v-model="confirmPassword" type="password" placeholder="请再次输入密码" />
			</view>
			<view class="form-item">
				<text class="label">角色</text>
				<picker @change="handleRoleChange" :value="roleIndex" :range="roles" range-key="label">
					<view class="picker-item">
						<text>{{ roles[roleIndex].label }}</text>
					</view>
				</picker>
			</view>
			<button class="register-btn" @click="handleRegister">注册</button>
			<view class="login-link">
				<text @click="goToLogin">已有账号？去登录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

const phone = ref('');
const password = ref('');
const confirmPassword = ref('');
const roleIndex = ref(0);
const roles = [
	{ label: '老人', value: 'elderly' },
	{ label: '家属', value: 'family' },
	{ label: '医生', value: 'doctor' }
];

const handleRoleChange = (e) => {
	roleIndex.value = e.detail.value;
};

const handleRegister = async () => {
	// 表单验证
	if (!phone.value) {
		uni.showToast({
			title: '请输入手机号码',
			icon: 'none'
		});
		return;
	}
	
	if (!password.value) {
		uni.showToast({
			title: '请输入密码',
			icon: 'none'
		});
		return;
	}
	
	if (password.value !== confirmPassword.value) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		});
		return;
	}
	
	try {
		// 调用注册接口
		const response = await uni.request({
			url: 'http://localhost:3000/api/v1/auth/register',
			method: 'POST',
			data: {
				phone: phone.value,
				password: password.value,
				role: roles[roleIndex.value].value
			}
		});
		
		const result = response.data;
		
		if (result.code === 201) {
			uni.showToast({
				title: '注册成功',
				icon: 'success',
				success: () => {
					// 延迟跳转到登录页
					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/login/login'
						});
					}, 1500);
				}
			});
		} else {
			uni.showToast({
				title: '注册失败: ' + (result.message || '请稍后重试'),
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('注册错误:', error);
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		});
	}
};

const goToLogin = () => {
	uni.navigateTo({
		url: '/pages/login/login'
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

.picker-item {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx;
	border: 1px solid #ddd;
	border-radius: 8rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	display: flex;
	align-items: center;
}

.register-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background-color: #007AFF;
	color: #fff;
	font-size: 32rpx;
	border-radius: 8rpx;
	margin-top: 40rpx;
}

.login-link {
	text-align: center;
	margin-top: 30rpx;
	font-size: 28rpx;
	color: #007AFF;
}
</style> 