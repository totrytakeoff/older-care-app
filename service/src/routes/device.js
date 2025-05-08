import express from "express";
import deviceController from "../controllers/device.js";
import { de } from "@faker-js/faker";


const router = express.Router();

router.get('/:userId', deviceController.getDeviceList);

router.get('/:userId/getDeviceList', deviceController.getDeviceList);

router.get('/:deviceSN/status', deviceController.getDeviceStatus);

router.get('/:deviceSN/getDeviceInfo',deviceController.getDeviceInfo);

router.post('/bind', deviceController.bindDevice);

router.post('/unbind', deviceController.unbindDevice);

router.get('/:userId/getDeviceData',deviceController.getDeviceData);

export default router;
