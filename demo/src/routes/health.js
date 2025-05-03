const express = require('express');
const router = express.Router();

// Mock database for health data
const healthData = [];

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: 'No token provided'
    });
  }
  // In a real app, verify the JWT token here
  next();
};

// Get real-time health data
router.get('/real-time', verifyToken, (req, res) => {
  const { userId } = req.query;
  
  // In a real app, this would fetch from a database
  const userData = healthData.filter(data => data.userId === userId);
  
  res.json({
    code: 200,
    data: userData[userData.length - 1] || null
  });
});

// Get historical health data
router.get('/history', verifyToken, (req, res) => {
  const { userId, startTime, endTime, type } = req.query;
  
  // In a real app, this would query a database
  const filteredData = healthData.filter(data => {
    return data.userId === userId &&
           data.timestamp >= startTime &&
           data.timestamp <= endTime &&
           (!type || data.type === type);
  });
  
  res.json({
    code: 200,
    data: filteredData
  });
});

// Add new health data
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