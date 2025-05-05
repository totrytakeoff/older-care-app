const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// 添加用药记录
router.post('/medication', verifyToken, async (req, res) => {
  try {
    const { userId, drugName, dosage, frequency } = req.body;
    
    // 模拟创建用药记录
    const recordId = Math.floor(Math.random() * 10000);
    
    res.status(201).json({
      code: 201,
      message: '用药记录添加成功',
      data: {
        recordId
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '添加用药记录失败',
      error: error.message
    });
  }
});

// 上传病历
router.post('/medical-history', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        code: 400,
        message: '请上传病历文件'
      });
    }
    
    // 模拟文件上传成功
    const fileUrl = `https://api.example.com/files/${file.filename}`;
    
    res.status(201).json({
      code: 201,
      message: '病历上传成功',
      data: {
        fileUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '上传病历失败',
      error: error.message
    });
  }
});

// 开具处方
router.post('/prescription', verifyToken, async (req, res) => {
  try {
    const { userId, doctorId, content } = req.body;
    
    // 模拟处方创建
    res.status(201).json({
      code: 201,
      message: '处方开具成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '开具处方失败',
      error: error.message
    });
  }
});

module.exports = router; 