UniApp 使用 Vue3 组合式 API 开发时，其项目结构与标准 Vue3 项目类似，但需遵循 UniApp 的跨平台规范。以下是基本结构和关键点：

---

### **1. 项目根目录结构**

```bash
├── pages/               # 页面目录（所有页面必须在此注册）
│   ├── index/             # 首页目录
│   │   ├── index.vue      # 首页 Vue 文件
│   │   └── index.js       # 可选：页面逻辑文件（组合式 API 逻辑可放此处）
│   └── logs/              # 其他页面
│       └── logs.vue
├── components/            # 自定义组件目录
│   └── MyComponent.vue    # 组件文件
├── static/                # 静态资源（图片、字体等）
├── App.vue                # 应用根组件（全局样式和生命周期）
├── main.js                # 入口文件（创建 Vue 实例）
├── pages.json             # 页面配置和全局设置
├── manifest.json          # 应用配置（名称、权限等）
└── uni.scss               # 全局样式变量（可选）
```

---

### **2. 核心文件说明**

#### **(1) `pages/index/index.vue`（页面文件）**

```vue
<script setup>  <!-- 使用组合式 API -->
import { ref, onMounted } from 'vue'
const count = ref(0)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('页面加载完成')
})
</script>

<template>
  <view class="container">
    <text>计数：{{ count }}</text>
    <button @click="increment">+1</button>
  </view>
</template>

<style scoped>
.container {
  padding: 20px;
}
</style>
```

#### **(2) `App.vue`（全局入口）**

```vue
<script setup>
// 全局逻辑（如登录状态管理）
</script>

<template>
  <router-view /> <!-- 页面渲染出口 -->
</template>
```

#### **(3) `main.js`（入口配置）**

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './uni.promisify.adaptor' // UniApp API Promise 化适配器

const app = createApp(App)
app.mount('#app')
```

#### **(4) `pages.json`（页面路由和全局样式）**

```json
{
  "pages": [
    "pages/index/index",  // 首页
    "pages/logs/logs"     // 其他页面
  ],
  "globalStyle": {
    "navigationBarTitleText": "UniApp"
  }
}
```

---

### **3. 组合式 API 的关键用法**

#### **(1) 响应式数据**

- `ref`：定义基础类型响应式数据（如 `const count = ref(0)`）。
- `reactive`：定义对象/数组响应式数据（如 `const state = reactive({ name: 'John' })`）。
- `computed`：计算属性（如 `const double = computed(() => count.value * 2)`）。

#### **(2) 生命周期钩子**

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  uni.getSystemInfoSync() // 调用 UniApp API
})
</script>
```

#### **(3) 与 UniApp API 结合**

- 使用 `uni.xxx()` 方法（如网络请求、导航栏控制）。
- 注意：部分 API 需在特定生命周期调用（如 `onMounted` 中调用 DOM 相关方法）。

---

### **4. 组件开发（`components/MyComponent.vue`）**

```vue
<script setup>
import { defineProps } from 'vue'
const props = defineProps(['title'])
</script>

<template>
  <view class="component">
    <text>{{ title }}</text>
  </view>
</template>
```

**页面中使用组件：**

```vue
<script setup>
import MyComponent from '@/components/MyComponent.vue'
</script>

<template>
  <MyComponent title="Hello Component" />
</template>
```

---

### **5. 路由跳转**

通过 `uni.navigateTo` 等方法实现导航：

```javascript
uni.navigateTo({
  url: '/pages/logs/logs'
})
```

---

### **6. 跨平台开发注意事项**

- **条件编译**：使用 `#ifdef H5` 等语法处理平台差异。
- **样式限制**：使用 `rpx` 单位适配多端。
- **API 差异**：部分浏览器 API 不可用，需用 `uni API` 替代。

---

### **7. 示例项目结构**

```
uniapp-vue3-composition-api/
├── pages/
│   ├── index/
│   │   ├── index.vue    # 首页
│   └── logs/
│       └── logs.vue
├── components/
│   └── MyComponent.vue  # 自定义组件
├── App.vue
├── main.js
├── pages.json
└── manifest.json
```

---

通过以上结构，可以快速搭建基于 Vue3 组合式 API 的 UniApp 项目，实现跨端开发（H5、小程序、App等）。实际开发中需结合 [UniApp 官方文档](https://uniapp.dcloud.io/vue3-vue2) 处理平台特性。
