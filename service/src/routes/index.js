import express from 'express';

import UserRoutes from './user.js';
import DeviceRoutes from './device.js';


const router = express.Router();

router.get('/', (req, res) => {
  res.send('This is the API root!');
});

router.use('/users', UserRoutes);

router.use('/devices', DeviceRoutes);

export default router;
