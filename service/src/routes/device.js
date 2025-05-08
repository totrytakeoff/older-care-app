import express from "express";
import deviceController from "../controllers/device.js";


const router = express.Router();

router.get('/:userid', deviceController.getDeviceList);

router.get('/:userid/getDeviceList', deviceController.getDeviceList);

router.get('/:deviceSN/status', deviceController.getDeviceStatus);

router.post('/bind', deviceController.bindDevice);

router.post('/unbind', deviceController.unbindDevice);



export default router;
