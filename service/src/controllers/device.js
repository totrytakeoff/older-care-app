import DeviceService from "../services/device";
import { devlists } from "../services/device";

const deviceController = {
    async getDeviceList (req, res) {
        // 从url参数中获取userid
        const { userid } = req.params;
        try {
            const devices = await DeviceService.getDeviceList(userid);
            res.status(200).json(devices);
        } catch (error) {
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

            if(DeviceService.findBySN(deviceSN)){
                return res.status(409).json({ error: '设备已被绑定!' });
            }
            
            const device = await DeviceService.bindDevice(userId, deviceSN,type);
            res.status(200).json(device);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },


}



export default deviceController;
