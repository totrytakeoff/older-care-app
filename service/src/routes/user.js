import express from 'express';

import UserController from '../controllers/user.js';

const router = express.Router();

router.post('/', UserController.createUser);


 
export default router;
