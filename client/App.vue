<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style>
/* 引入 uview-ui 样式 */
@import 'uview-ui/index.scss';

/* 全局样式 */
page {
  background-color: #f8f8f8;
  font-size: 28rpx;
  color: #333;
}

.container {
  padding: 20rpx;
}

/* 通用卡片样式 */
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 通用按钮样式 */
.button {
  width: 100%;
  padding: 20rpx 0;
  border-radius: 10rpx;
  font-size: 32rpx;
  text-align: center;
}

.primary-button {
  background: #3cc51f;
  color: #fff;
}

.secondary-button {
  background: #f8f8f8;
  color: #666;
}

/* 通用输入框样式 */
.input {
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background: #f8f8f8;
}

/* 通用标题样式 */
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
}
</style> 