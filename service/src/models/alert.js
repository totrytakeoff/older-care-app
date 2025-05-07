// models/Alert.js
import { Model } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.js';

// 警报模型
class Alert extends Model {}
Alert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
    },
    triggerTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    position: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'Alert',
    tableName: 'alerts',
  }
);

// 建立关系
Alert.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Alert, { foreignKey: 'user_id', as: 'alerts' });

export default Alert;