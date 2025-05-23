// models/Medication.js
import { Model,DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.js';

class Medication extends Model {}
Medication.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    drugName: {
      type: DataTypes.STRING,
    },
    dosage: {
        //剂量
      type: DataTypes.STRING,
    },
    frequency: {
      type: DataTypes.STRING,
    },
    startDate: {
      type: DataTypes.DATE,
    },
    endDate: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Medication',
    tableName: 'medications',
  }
);

// 建立关系
Medication.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Medication, { foreignKey: 'userId', as: 'medications' });

export default Medication;