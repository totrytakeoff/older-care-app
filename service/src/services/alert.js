import Alert from '../models/alert.js';

const AlertService = {
    async getAlerts(userId) {
        try {
            const alert = await Alert.findOne({
                where: {
                    userId,
                },
            });

            return {
                code: 200,
                data: alert,
            };
        } catch (error) {
            console.log('❌error❌ ', error);
            return {
                code: 500,
                message: 'Internal Server Error',
            };
        }
    },

    async triggerAlert(alertData) {
        try {
            const alert = await Alert.create(alertData);
            /*
            填充报警信息推送逻辑

            */
            if (!alert) {
                throw new Error('Alert failed!');
            }

            return {
                code: 200,
                alertId: alert.id,
            };
        } catch (error) {
            console.log('❌error❌ ', error);
            return {
                code: 500,
                message: 'Internal Server Error',
            };
        }
    },

    async updateAlert(alertId, status) {
        try {
            const updated = await Alert.update(
                { resolved: status }, // 注意：这里应该指定要更新哪个字段
                {
                    where: { id: alertId },
                },
            );

            if (updated[0] === 0) {
                throw new Error('Alert not found');
            }

            return { code: 200 };
        } catch (error) {
            console.error('❌Update alert error:', error);
            return { code: 500, message: error.message };
        }
    },
};

export default AlertService;
