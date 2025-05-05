// mock.js
import Mock from 'mockjs'

// 配置拦截 ajax 的请求时的行为，支持的配置项目有 timeout。
Mock.setup({
  timeout: '200-600' // 指定被拦截的 Ajax 请求的响应时间，单位是毫秒
})

const Random = Mock.Random

// 健康实时数据
Mock.mock(/\/api\/v1\/health\/real-time/, 'get', () => {
  return {
    code: 200,
    heartRate: Random.integer(60, 100),
    bloodPressure: {
      systolic: Random.integer(100, 140),
      diastolic: Random.integer(60, 90)
    },
    bloodOxygen: Random.integer(95, 100),
    temperature: Random.float(36, 37.2, 1, 1),
    bloodGlucose: Random.float(3.9, 6.1, 1, 1)
  }
})

// 健康历史记录
Mock.mock(/\/api\/v1\/health\/records/, 'get', (options) => {
  // 解析请求参数
  const url = options.url
  const type = url.includes('type=') ? url.split('type=')[1].split('&')[0] : 'heart_rate'
  
  const records = []
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Random.integer(0, 7))
    date.setHours(Random.integer(0, 23))
    date.setMinutes(Random.integer(0, 59))
    
    let value
    if (type === 'blood_pressure') {
      value = {
        systolic: Random.integer(100, 150),
        diastolic: Random.integer(60, 95)
      }
    } else if (type === 'heart_rate') {
      value = Random.integer(60, 100)
    } else if (type === 'blood_oxygen') {
      value = Random.integer(95, 100)
    } else if (type === 'blood_glucose') {
      value = Random.float(3.9, 7, 1, 1)
    } else if (type === 'temperature') {
      value = Random.float(36, 37.5, 1, 1)
    } else if (type === 'weight') {
      value = Random.integer(50, 90)
    }
    
    records.push({
      id: Random.guid(),
      type,
      value,
      timestamp: date.getTime(),
      source: Random.pick(['智能手环', '手动记录', '血压计', '血糖仪'])
    })
  }
  
  return {
    code: 200,
    data: {
      records,
      hasMore: false
    }
  }
})

// 最近健康记录
Mock.mock(/\/api\/v1\/health\/records\/recent/, 'get', (options) => {
  const url = options.url
  const type = url.includes('type=') ? url.split('type=')[1].split('&')[0] : 'heart_rate'
  const limit = url.includes('limit=') ? parseInt(url.split('limit=')[1].split('&')[0]) : 3
  
  const records = []
  for (let i = 0; i < limit; i++) {
    const date = new Date()
    date.setHours(date.getHours() - i * 8)
    
    let value
    if (type === 'blood_pressure') {
      value = {
        systolic: Random.integer(100, 150),
        diastolic: Random.integer(60, 95)
      }
    } else if (type === 'heart_rate') {
      value = Random.integer(60, 100)
    } else if (type === 'blood_oxygen') {
      value = Random.integer(95, 100)
    } else if (type === 'blood_glucose') {
      value = Random.float(3.9, 7, 1, 1)
    } else if (type === 'temperature') {
      value = Random.float(36, 37.5, 1, 1)
    } else if (type === 'weight') {
      value = Random.integer(50, 90)
    }
    
    records.push({
      id: Random.guid(),
      type,
      value,
      timestamp: date.getTime(),
      source: Random.pick(['智能手环', '手动记录'])
    })
  }
  
  return {
    code: 200,
    data: records
  }
})

// 添加健康记录
Mock.mock(/\/api\/v1\/health\/records/, 'post', () => {
  return {
    code: 201,
    message: '记录添加成功'
  }
})

// 获取设备列表
Mock.mock(/\/api\/v1\/devices/, 'get', () => {
  const devices = []
  for (let i = 0; i < Random.integer(0, 3); i++) {
    devices.push({
      id: Random.integer(1, 100),
      name: Random.pick(['我的手环', '家用血压计', '体温计', '体重秤']),
      deviceId: `${Random.pick(['BR', 'BP', 'TM', 'WS'])}-${Random.integer(10000, 99999)}`,
      type: Random.pick(['bracelet', 'bp_monitor', 'temperature', 'weight']),
      status: Random.pick(['在线', '离线']),
      lastSync: new Date(new Date().getTime() - Random.integer(1, 72) * 3600000).getTime()
    })
  }
  
  return {
    code: 200,
    data: devices
  }
})

// 绑定设备
Mock.mock(/\/api\/v1\/devices\/bind/, 'post', () => {
  return {
    code: 200,
    message: '设备绑定成功'
  }
})

// 解绑设备
Mock.mock(/\/api\/v1\/devices\/unbind/, 'post', () => {
  return {
    code: 200,
    message: '设备解绑成功'
  }
})

// 获取报警列表
Mock.mock(/\/api\/v1\/alerts/, 'get', () => {
  const alerts = []
  for (let i = 0; i < Random.integer(0, 5); i++) {
    const date = new Date()
    date.setDate(date.getDate() - Random.integer(0, 10))
    
    alerts.push({
      id: Random.integer(1, 100),
      type: Random.pick(['fall', 'heartRate', 'bloodPressure']),
      status: Random.pick(['pending', 'resolved']),
      location: Random.pick(['卧室', '客厅', '卫生间', '厨房']),
      timestamp: date.getTime(),
      notes: Random.boolean() ? '已联系老人确认，属误报' : ''
    })
  }
  
  return {
    code: 200,
    data: alerts
  }
})

// 处理报警
Mock.mock(/\/api\/v1\/alerts\/\d+/, 'put', () => {
  return {
    code: 200,
    message: '处理成功'
  }
})

// 开具处方
Mock.mock(/\/api\/v1\/records\/prescription/, 'post', () => {
  return {
    code: 201,
    message: '处方开具成功'
  }
})

export default Mock 