// models/User.js
import { Model } from 'sequelize';
import sequelize from '../config/db.js';
import {  DataTypes } from 'sequelize';

class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phone: {
      type: DataTypes.STRING(11),
      unique: {
    name: 'username_UNIQUE',
    msg: '⚠️ 该手机号已被注册！' // 自定义错误信息
    },
    },
    password: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM('elder', 'family', 'doctor'),
    },
    name: {
      type: DataTypes.STRING(50),
    },
    age: {
      type: DataTypes.INTEGER
    },
    sex: {
      type: DataTypes.ENUM('male', 'female'),
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);





export default User; 

