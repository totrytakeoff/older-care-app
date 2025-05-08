import express from 'express';

import UserRoutes from './user.js';
import DeviceRoutes from './device.js';
import AlertRoutes from './alert.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('This is the API root!');
});

router.use('/users', UserRoutes);

router.use('/devices', DeviceRoutes);

router.use('/alerts', AlertRoutes);

export default router;
