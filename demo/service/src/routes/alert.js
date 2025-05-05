const express = require('express');
const router = express.Router();

// Mock database for alerts
const alerts = [];

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

// Trigger an alert
router.post('/trigger', verifyToken, (req, res) => {
  const { userId, type, location } = req.body;
  
  const newAlert = {
    id: alerts.length + 1,
    userId,
    type,
    location,
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  
  alerts.push(newAlert);
  
  // In a real app, this would trigger notifications to family members
  // and emergency services if needed
  
  res.status(201).json({
    code: 201,
    data: {
      alertId: newAlert.id
    }
  });
});

// Get alerts
router.get('/', verifyToken, (req, res) => {
  const { userId, status } = req.query;
  
  let filteredAlerts = alerts;
  
  if (userId) {
    filteredAlerts = filteredAlerts.filter(alert => alert.userId === userId);
  }
  
  if (status) {
    filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
  }
  
  res.json({
    code: 200,
    data: filteredAlerts
  });
});

// Update alert status
router.put('/:alertId', verifyToken, (req, res) => {
  const { alertId } = req.params;
  const { status, notes } = req.body;
  
  const alert = alerts.find(a => a.id === parseInt(alertId));
  if (!alert) {
    return res.status(404).json({
      code: 404,
      message: 'Alert not found'
    });
  }
  
  alert.status = status;
  if (notes) {
    alert.notes = notes;
  }
  
  res.json({
    code: 200,
    message: 'Alert updated successfully'
  });
});

module.exports = router; 