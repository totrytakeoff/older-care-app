// models/Binding.js
import sequelize from "../config/db.js";
import { DataTypes, Model } from "sequelize";
import User from "./user.js";


// 绑定用户模型
// 该模型用于表示用户之间的绑定关系，例如家庭成员之间的绑定关系
// 绑定关系可以是双向的，即一个用户可以绑定多个其他用户，反之亦然
// binder -> 绑定者(doctor or family)
// binded -> 被绑定者(elder)
// role 合理性判断在 controller 中进行

class UserBinding extends Model {}
UserBinding.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    binderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    bindedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: "UserBinding",
    tableName: "user_bindings"
  }
);

// 关联定义（可选）
UserBinding.belongsTo(User, { foreignKey: "binderId", as: "binder" });
UserBinding.belongsTo(User, { foreignKey: "bindedId", as: "binded" });

export default UserBinding;