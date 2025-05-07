import { Router } from "express";
import deviceController from "../controllers/device";


const router = express.Router();

router.get('/:userid', deviceController.getDeviceList);

router.get('/:userid/getDeviceList', deviceController.getDeviceList);

router.post('/bind', deviceController.bindDevice);

router.post('/unbind', deviceController.unbindDevice);

router.get('/{deviceSN}/status', deviceController.getDeviceStatus);


export default router;
