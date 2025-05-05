const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock database (in a real app, this would be a database)
const users = [];

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    // Check if user already exists
    if (users.some(user => user.phone === phone)) {
      return res.status(400).json({
        code: 400,
        message: '用户已存在'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      phone,
      password: hashedPassword,
      role
    };

    users.push(newUser);

    res.status(201).json({
      code: 201,
      message: '用户注册成功',
      data: {
        userId: newUser.id
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '创建用户失败',
      error: error.message
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user
    const user = users.find(u => u.phone === phone);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '登录失败',
      error: error.message
    });
  }
});

// Token refresh endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
    
    // Generate new access token
    const token = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    res.json({
      code: 200,
      message: '令牌刷新成功',
      data: {
        token
      }
    });
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: '无效的刷新令牌'
    });
  }
});

module.exports = router; 