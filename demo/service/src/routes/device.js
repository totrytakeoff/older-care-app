const express = require('express');
const router = express.Router();

// Mock database for devices
const devices = [];

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

// Bind a new device
router.post('/bind', verifyToken, (req, res) => {
  const { userId, deviceId, type } = req.body;
  
  // Check if device is already bound
  if (devices.some(device => device.deviceId === deviceId)) {
    return res.status(400).json({
      code: 400,
      message: 'Device already bound'
    });
  }
  
  const newDevice = {
    id: devices.length + 1,
    userId,
    deviceId,
    type,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  devices.push(newDevice);
  
  res.status(201).json({
    code: 201,
    data: {
      deviceSN: newDevice.id
    }
  });
});

// Get device status
router.get('/:deviceSN/status', verifyToken, (req, res) => {
  const { deviceSN } = req.params;
  
  const device = devices.find(d => d.id === parseInt(deviceSN));
  if (!device) {
    return res.status(404).json({
      code: 404,
      message: 'Device not found'
    });
  }
  
  res.json({
    code: 200,
    data: {
      battery: 85, // Mock battery level
      online: true // Mock online status
    }
  });
});

// Upload device data
router.post('/data', verifyToken, (req, res) => {
  const { deviceSN, heartRate, bloodPressure, timestamp } = req.body;
  
  // In a real app, this would store in a database
  // For demo, we'll just return success
  
  res.json({
    code: 200,
    message: 'Data received successfully'
  });
});

module.exports = router; 