const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// 生成健康报告
router.post('/report', verifyToken, async (req, res) => {
  try {
    const { userId, period } = req.body;
    
    // 模拟异步报告生成
    const reportId = Math.floor(Math.random() * 10000);
    const pdfUrl = `https://api.example.com/reports/${reportId}.pdf`;
    
    res.status(202).json({
      code: 202,
      message: '报告生成任务已启动',
      data: {
        reportId,
        pdfUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '生成报告失败',
      error: error.message
    });
  }
});

// 获取健康建议
router.get('/suggestions', verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    
    // 模拟 AI 生成的健康建议
    const suggestions = [
      '建议每天进行30分钟的有氧运动',
      '注意控制饮食，减少高盐高脂食物的摄入',
      '保持规律的作息时间，保证充足的睡眠'
    ];
    
    res.json({
      code: 200,
      message: '健康建议获取成功',
      data: {
        suggestions
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取健康建议失败',
      error: error.message
    });
  }
});

module.exports = router; 