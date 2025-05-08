import { faker } from '@faker-js/faker';

const BaseDevID  = "DEVICE100";
let devID = 1;

const mockDevInfo = (devType) => {

    
        
    return {
        sn: faker.string.alphanumeric({length:12,casing:'upper'}), // 如：AB12-CD34-EF56-GH78,
        mac: faker.internet.mac(),
        // deviceId: `${BaseDevID}${devID++}`,
        deviceType: devType,
        status: "active",

    }
}


const mockHealthData = async (deviceType) => {
  const baseData = {
    timestamp: new Date().toISOString(),
  };

  switch (deviceType) {
    case 'BPMonitor': // 血压计
      return {
        ...baseData,
        systolic: faker.number.int({ min: 90, max: 180 }),  // 收缩压
        diastolic: faker.number.int({ min: 60, max: 120 }),  // 舒张压
        heartRate: faker.number.int({ min: 60, max: 100 }),   // 心率
      };
    case 'spO2Monitor': // 血氧仪
      return {
        ...baseData,
        spo2: faker.number.float({ min: 90, max: 100, multipleOf: 0.1 }), // 血氧饱和度
        pulse: faker.number.int({ min: 60, max: 100 }),       // 脉搏
      };
    case 'BFPMonitor': // 体脂秤
      return {
        ...baseData,
        weight: faker.number.float({ min: 50, max: 100, multipleOf: 0.1 }),     // 体重 kg
        bodyFat: faker.number.float({ min: 10, max: 30, multipleOf: 0.1 }),     // 体脂 %
        muscleMass: faker.number.float({ min: 30, max: 50, multipleOf: 0.1 }),  // 肌肉量 %
        bmi: faker.number.float({ min: 18, max: 30, multipleOf: 0.1 }),         // BMI
      };
    case 'Thermometer': // 体温计
      return {
        ...baseData,
        temperature: faker.number.float({ min: 36, max: 40, multipleOf: 0.1 }), // 体温
      };
    case 'BGMeter': // 血糖仪
      return {
        ...baseData,
        bloodGlucose: faker.number.float({ min: 4, max: 10, multipleOf: 0.1 }), // 血糖 mmol/L
      };
    default:
      return {info: 'Invalid device type'};
  }
};


export { mockDevInfo, mockHealthData };

// // 测试代码
// for (let i = 0; i < 10; i++) {
//     console.log(mockDevInfo("Thermometer"));
//     console.log(mockHealthData("Thermometer"));
// }


