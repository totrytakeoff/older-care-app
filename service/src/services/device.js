import deviceController from '../controllers/device.js';
import Device from '../models/device.js';
import { mockDevInfo,mockHealthData } from '../devices/mockDev.js';
import { de } from '@faker-js/faker';

export const devlists=["wearable", "BPMonitor","BGMeter","spO2Monitor",
                            "ECGMonitor","BFPMonitor","Thermometer" ,"other"];

const DeviceService = {
    async getDeviceList(userId) {
        try {
            //通过userId查询设备列表
            const devices = await Device.findAll({
                where: {
                    userId: userId,
                }

                // 通过userId查询设备列表时，关联查询用户表，获取用户信息
                // include: [
                //     {
                //         model: User,
                //         as: 'user',
                //         attributes: ['id', 'name'],
                //     },
                // ],
            });
            return devices;
        } catch (error) {
            throw error;
        }
    },

    async bindDevice(userId, deviceSN,type) {
        try {
            const deviceInfo = await mockDevInfo(type);
            if(!deviceInfo){
                return res.status(400).json({ error: '设备添加失败!'});
            }
            
            deviceInfo.userId = userId;
            deviceInfo.sn = deviceSN;

            await Device.create(deviceInfo);

        } catch (error) {
            throw error;
        }
    },

    async findBySN(deviceSN) {
        try {
            const device = await Device.findOne({
                where: {
                    deviceSN: deviceSN,
                }
            });
            return device;
        } catch (error) {
            throw error;
        }
    },

}




export default DeviceService;