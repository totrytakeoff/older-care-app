<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
        <view class="user-details">
          <text class="username">{{ userInfo.name || '未设置' }}</text>
          <text class="phone">{{ userInfo.phone }}</text>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('/pages/user/profile')">
        <text class="menu-icon">👤</text>
        <text class="menu-text">个人信息</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/user/health-records')">
        <text class="menu-icon">📊</text>
        <text class="menu-text">健康记录</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/user/emergency-contacts')">
        <text class="menu-icon">📞</text>
        <text class="menu-text">紧急联系人</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/user/settings')">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">系统设置</text>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-button">
      <button @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        name: '',
        phone: '',
        avatar: ''
      }
    }
  },
  onLoad() {
    this.fetchUserInfo()
  },
  methods: {
    async fetchUserInfo() {
      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/v1/user/info',
          method: 'GET',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        })
        if (response.statusCode === 200) {
          this.userInfo = response.data.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    },
    navigateTo(url) {
      uni.navigateTo({
        url
      })
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            uni.reLaunch({
              url: '/pages/login/index'
            })
          }
        }
      })
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
}

.user-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.phone {
  font-size: 28rpx;
  color: #666;
}

.menu-list {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.menu-arrow {
  font-size: 32rpx;
  color: #999;
}

.logout-button {
  padding: 0 40rpx;
}

.logout-button button {
  background: #ff3b30;
  color: #fff;
  border-radius: 50rpx;
  padding: 20rpx 0;
  font-size: 32rpx;
}
</style> 