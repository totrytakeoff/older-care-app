// models/Alert.js
import { Model } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.js';
import { DataTypes } from 'sequelize';

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
    location: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Alert',
    tableName: 'alerts',
  }
);

// 建立关系
Alert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Alert, { foreignKey: 'userId', as: 'alerts' });

export default Alert;