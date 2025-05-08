import deviceController from '../controllers/device.js';
import Device from '../models/device.js';
import { mockDevInfo, mockHealthData } from '../devices/mockDev.js';
import { de } from '@faker-js/faker';

export const devlists = [
    'wearable',
    'BPMonitor',
    'BGMeter',
    'spO2Monitor',
    'ECGMonitor',
    'BFPMonitor',
    'Thermometer',
    'other',
];

const DeviceService = {
    async getDeviceList(userId) {
        try {
            // 通过userId查询设备列表
            const devices = await Device.findAll({
                where: {
                    userId: userId,
                },

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
    async bindDevice(userId, deviceSN, type) {
        try {
            const device =await DeviceService.findBySN(deviceSN);
            if (device) {
                throw new Error('Device already exists!');
            }

            const deviceInfo = await mockDevInfo(type);
            
            if (!deviceInfo) {
                
                throw new Error('Device bind failed!');
            }

            deviceInfo.userId = userId;
            deviceInfo.sn = deviceSN;

            await Device.create(deviceInfo);

            return {code: 200,
                message: 'Device:'+deviceSN +' bind successfully!',
            };
        } catch (error) {
            throw error;
        }
    },
    async unbindDevice(userId, deviceSN) {
        try {
            const device = await Device.findOne({
                where: {
                    userId: userId,
                    sn: deviceSN,
                },
            });
            if (!device) {
                throw new Error('Device not found!');
            }

            await device.destroy();

            return {code: 200,
                message: 'Device:'+deviceSN +' unbind successfully!',
            };
        } catch (error) {
            throw error;
        }
    },
    async getDeviceStatus(deviceSN) {
        try {
            const device = await DeviceService.findBySN(deviceSN);
            if (!device) {
                throw new Error('Device not found!');
            }
            return {
                status: device.status,
                lastSyncTime: device.lastSyncTime,
                metaData: device.metaData,
            };
        } catch (error) {
            throw error;
        }
    },




    async findBySN(deviceSN) {
        try {
            const device = await Device.findOne({
                where: {
                    sn: deviceSN,
                },
            });
            // console.log('findBySN:', device);
            
            return device;
        } catch (error) {
            throw error;
        }
    },
};

export default DeviceService;
