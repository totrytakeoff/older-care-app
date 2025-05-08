import DeviceService from "../services/device.js";
import { devlists } from "../services/device.js";

const deviceController = {
    async getDeviceList (req, res) {
        // 从url参数中获取userid
        const { userid } = req.params;
        try {
            const devices = await DeviceService.getDeviceList(userid);
            res.status(200).json(devices);
        } catch (error) {
            console.log('getDeviceListError:',error);
            res.status(500).json({ error: error.message });
        }   


    },

    async bindDevice (req, res) {
        try {
            // 从body中获取userId和deviceId
            const { userId, deviceSN,type } = req.body;            

            if(!devlists.includes(type) ){
                return res.status(400).json({ error: '设备类型错误!' });
            }

            if(await DeviceService.findBySN(deviceSN) != null ){
                console.log('deviceSN has been binded:',deviceSN);
                
                return res.status(409).json({ error: '设备已被绑定!' });
            }
            
            const device = await DeviceService.bindDevice(userId, deviceSN,type);

            console.log('bindDeviceres:',device);
            
            res.status(200).json(device);
        } catch (error) {
            console.log('bindDeviceError:',error);
            res.status(500).json({ error: error.message });
        }
    },
    async unbindDevice (req, res) {
        try {
            // 从body中获取userId和deviceId
            const { userId, deviceSN } = req.body;
            const device = await DeviceService.findBySN(deviceSN);
            if(!device){
                return res.status(404).json({ error: '设备不存在!' });
            }
            if(device.userId != userId){                
                return res.status(403).json({ error: '设备不属于该用户!' });
            }

            const resp=await DeviceService.unbindDevice(userId, deviceSN);
           
            res.status(200).json(resp);
        } catch (error) {
            console.log('unbindDeviceError:',error);
            res.status(500).json({ error: error.message });
        }
    },

    async getDeviceStatus (req, res) {
        try {
            // 从url参数中获取deviceSN
            const { deviceSN } = req.params;
            console.log('getDeviceStatus:',deviceSN);
            const device = await DeviceService.findBySN(deviceSN);
            if(!device){
                return res.status(404).json({ error: '设备不存在!' });
            }

            const status = await DeviceService.getDeviceStatus(deviceSN);
            if(!status){
                return res.status(400).json({ error: '获取设备状态失败!' });
            }

            res.status(200).json(status);
        } catch (error) {
            console.log('getDeviceStatusError:',error);
            res.status(500).json({ error: error.message });
        }
    }


}



export default deviceController;
