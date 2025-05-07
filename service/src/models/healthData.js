// models/HealthData.js
import{Model} from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.js';

// 健康数据模型

class HealthData extends Model {}
 HealthData.init({
  id : {
    type : DataTypes.INTEGER,
    primaryKey : true,
    autoIncrement : true,
  },
  healthStatus : {
    type : DataTypes.ENUM('severe', 'medium', 'slight', 'normal'),
  },
  heartRate : {
    type : DataTypes.INTEGER,
  },
  bloodOxygen : {
    type : DataTypes.INTEGER,
  },
  bloodPressureHigh : {
    type : DataTypes.INTEGER,
  },
  bloodPressureLow : {
    type : DataTypes.INTEGER,
  },
  bodyTemperature : {
    // DECIMAL(3, 1)表示小数点后保留1位，整数部分最多保留2位
    type : DataTypes.DECIMAL(3, 1),
  },
  otherData : {
    type : DataTypes.JSON,
    allowNull : true,  // 允许为空
  },
  collectTime : {
    type : DataTypes.DATE,
    defaultValue : DataTypes.NOW,
  },
},
                  {
                    sequelize,
                    modelName : 'HealthData',
                    tableName : 'health_data',
                  });

// 建立关系
HealthData.belongsTo(User, {foreignKey : 'user_id', as : 'user'});
User.hasMany(HealthData, {foreignKey : 'user_id', as : 'healthData'});

export default HealthData;