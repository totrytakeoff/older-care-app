好的，我来帮你一步一步搭建这个 Node.js 项目。我会详细解释每个步骤。

### 第一步：环境准备

1. 首先确保你的电脑上安装了 Node.js。你可以通过以下命令检查：

```bash
node -v
npm -v
```

如果没有安装，请访问 Node.js 官网 (https://nodejs.org/) 下载并安装。

### 第二步：创建项目目录

1. 创建项目目录并进入：

```bash
mkdir elderly-health-monitor
cd elderly-health-monitor
```

2. 初始化 npm 项目：

```bash
npm init -y
```

这会创建一个 `package.json` 文件，记录项目信息和依赖。

### 第三步：安装依赖

根据项目需求，我们需要安装以下依赖：

```bash
npm install express jsonwebtoken bcryptjs mysql2 cors dotenv swagger-ui-express yamljs
npm install nodemon --save-dev
```

让我解释一下这些依赖的作用：

- `express`: Web 框架
- `jsonwebtoken`: 用于生成和验证 JWT 令牌
- `bcryptjs`: 用于密码加密
- `mysql2`: MySQL 数据库驱动
- `cors`: 处理跨域请求
- `dotenv`: 管理环境变量
- `swagger-ui-express`: 生成 API 文档
- `yamljs`: 解析 YAML 文件
- `nodemon`: 开发时自动重启服务器

### 第四步：创建项目结构

创建以下目录结构：

```
elderly-health-monitor/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── health.js
│   │   ├── device.js
│   │   └── alert.js
│   └── index.js
├── swagger.yaml
├── .env
└── package.json
```

### 第五步：配置环境变量

创建 `.env` 文件：

```bash
PORT=3000
JWT_SECRET=your-secret-key
```

### 第六步：编写主服务器文件

创建 `src/index.js`：

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 加载 Swagger 文档
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 路由
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/health', require('./routes/health'));
app.use('/api/v1/devices', require('./routes/device'));
app.use('/api/v1/alerts', require('./routes/alert'));

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用老人健康监测系统 API' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '服务器错误！',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
```

### 第七步：创建路由文件

1. 创建 `src/routes/auth.js`：

```javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 模拟数据库
const users = [];

// 注册接口
router.post('/register', async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    // 检查用户是否已存在
    if (users.some(user => user.phone === phone)) {
      return res.status(400).json({
        code: 400,
        message: '用户已存在'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = {
      id: users.length + 1,
      phone,
      password: hashedPassword,
      role
    };

    users.push(newUser);

    res.status(201).json({
      code: 201,
      data: {
        userId: newUser.id
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '创建用户失败'
    });
  }
});

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 查找用户
    const user = users.find(u => u.phone === phone);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 生成 JWT 令牌
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      code: 200,
      data: {
        token,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '登录失败'
    });
  }
});

module.exports = router;
```

2. 创建 `src/routes/health.js`：

```javascript
const express = require('express');
const router = express.Router();

// 模拟健康数据
const healthData = [];

// JWT 验证中间件
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供令牌'
    });
  }
  next();
};

// 获取实时健康数据
router.get('/real-time', verifyToken, (req, res) => {
  const { userId } = req.query;
  
  const userData = healthData.filter(data => data.userId === userId);
  
  res.json({
    code: 200,
    data: userData[userData.length - 1] || null
  });
});

// 添加健康数据
router.post('/data', verifyToken, (req, res) => {
  const { userId, heartRate, bloodPressure, bloodOxygen, timestamp } = req.body;
  
  const newData = {
    id: healthData.length + 1,
    userId,
    heartRate,
    bloodPressure,
    bloodOxygen,
    timestamp: timestamp || new Date().toISOString()
  };
  
  healthData.push(newData);
  
  res.status(201).json({
    code: 201,
    data: newData
  });
});

module.exports = router;
```

### 第八步：启动服务器

1. 在 `package.json` 中添加启动脚本：

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

2. 启动开发服务器：

```bash
npm run dev
```

### 第九步：测试 API

你可以使用 Postman 或 curl 测试 API：

1. 注册用户：

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "password": "123456", "role": "elderly"}'
```

2. 登录：

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "password": "123456"}'
```

3. 添加健康数据：

```bash
curl -X POST http://localhost:3000/api/v1/health/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId": 1, "heartRate": 75, "bloodPressure": {"systolic": 120, "diastolic": 80}, "bloodOxygen": 98}'
```

### 注意事项：

1. 这是一个基础实现，使用了内存存储。在实际项目中，你需要：

   - 使用真实的数据库（如 MySQL）
   - 添加输入验证
   - 实现更完善的错误处理
   - 添加日志系统
   - 实现更安全的认证机制
2. 开发建议：

   - 使用 ESLint 进行代码规范检查
   - 使用 Jest 进行单元测试
   - 使用 PM2 进行生产环境部署
   - 使用 Docker 进行容器化部署

需要我详细解释任何部分吗？或者你想了解如何添加其他功能？
