import { Model } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

class Device extends Model {}

Device.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sn:{
        type: DataTypes.STRING,
        unique: true,
    },
    mac:{
        type: DataTypes.STRING,
        unique: true,
    },
    deviceId: {
      type: DataTypes.STRING,
      unique: true,
    },
    deviceType: {
        // 设备类型 穿戴设备 血压计 血糖仪 血氧仪 心电图仪 体脂秤 体温计 其他
      type: DataTypes.ENUM("wearable", "BPMonitor","BGMeter","spO2Monitor",
                            "ECGMonitor","BFPMonitor","Thermometer" ,"other"),
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
    },
    lastSyncTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Device",
    tableName: "devices",
  }
);


Device.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Device, { foreignKey: "userId", as: "devices" });

export default Device;

