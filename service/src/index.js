import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';


import routes from './routes/index.js';


import 'reflect-metadata'; // 确保引入 reflect-metadata
import sequelize from './config/db.js'; // 确保路径正确
import UserService from './services/user.js';

dotenv.config();

// 初始化数据库连接
async function bootstrap() {
  try {
    // 1️⃣ 测试连接
    console.log('⏳ 正在测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 2️⃣ 同步所有模型到数据库
    await sequelize.sync({ force: false }); // force: true 会清空已有表
    console.log('✅ 数据库表已同步');

    // 3️⃣ 测试数据操作
    // await testdb();

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  }
}

const testdb = async () => {
   // // 3️⃣ 测试数据操作
    const user = await UserService.createUser({
      //注意手机号唯一
      phone: '13800010086',
      password: 'abc123',
      role: 'doctor',
      name: '张三',
      age: 35,
      sex: 'male',

    });
    console.log('✅ 测试数据操作成功:', user.toJSON());
}


bootstrap();

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(`/api`, routes);

app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});

export default app;
