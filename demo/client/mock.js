// 健康报告数据
Mock.mock(/\/api\/v1\/health\/report/, 'get', () => {
  const report = {
    userId: Random.integer(1000, 9999),
    userName: Random.cname(),
    reportDate: new Date().getTime(),
    summary: {
      heartRate: {
        avg: Random.integer(60, 100),
        max: Random.integer(100, 120),
        min: Random.integer(50, 60),
        status: Random.pick(['正常', '偏高', '偏低']),
        trend: Random.pick(['上升', '下降', '稳定'])
      },
      bloodPressure: {
        systolic: {
          avg: Random.integer(100, 140),
          max: Random.integer(140, 160),
          min: Random.integer(90, 100),
          status: Random.pick(['正常', '偏高', '偏低']),
          trend: Random.pick(['上升', '下降', '稳定'])
        },
        diastolic: {
          avg: Random.integer(60, 90),
          max: Random.integer(90, 100),
          min: Random.integer(50, 60),
          status: Random.pick(['正常', '偏高', '偏低']),
          trend: Random.pick(['上升', '下降', '稳定'])
        }
      },
      bloodOxygen: {
        avg: Random.integer(95, 100),
        min: Random.integer(90, 95),
        status: Random.pick(['正常', '偏低']),
        trend: Random.pick(['上升', '下降', '稳定'])
      },
      bloodGlucose: {
        avg: Random.float(3.9, 6.1, 1, 1),
        max: Random.float(6.1, 7.0, 1, 1),
        min: Random.float(3.5, 3.9, 1, 1),
        status: Random.pick(['正常', '偏高', '偏低']),
        trend: Random.pick(['上升', '下降', '稳定'])
      },
      temperature: {
        avg: Random.float(36.3, 37.0, 1, 1),
        max: Random.float(37.0, 37.5, 1, 1),
        min: Random.float(36.0, 36.3, 1, 1),
        status: '正常',
        trend: '稳定'
      }
    },
    recommendations: [
      '建议保持规律作息，每日睡眠不少于7小时',
      '适当增加户外活动，每日步行30分钟',
      '控制饮食，减少高盐高脂食物摄入',
      '定期测量血压，保持记录'
    ],
    abnormalAlerts: Random.integer(0, 3)
  };
  
  return {
    code: 200,
    data: report
  };
});

export default Mock 