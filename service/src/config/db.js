// src/db.js

import {Sequelize} from 'sequelize';

import 'reflect-metadata';  // 确保引入 reflect-metadata
import * as dotenv from 'dotenv';
dotenv.config();  // 加载环境变量



const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: parseInt(process.env.DB_PORT || '3306'),
        logging: process.env.DB_LOGGING === 'true',
    }
);

export default sequelize;


// const sequelize = new Sequelize({
//   dialect: 'mysql',
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 3306,
//   username: process.env.DB_USERNAME || 'root',
//   password: process.env.DB_PASSWORD || 'your_password',
//   database: process.env.DB_NAME || 'elder_health',
//   logging: false, // 关闭 SQL 日志
// });



// export const AppDataSource = new DataSource({
//     type: 'mysql',
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT || '3306'),
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     entities: [User, HealthData, Alert, Medication],
//     synchronize: process.env.DB_SYNCHRONIZE === 'true',
//     logging: process.env.DB_LOGGING === 'true',
// });

// const AppDataSource = new DataSource({

//   type : 'mysql',
//   host : process.env.DB_HOST,
//   port : parseInt(process.env.DB_PORT || '3306'),
//   username : process.env.DB_USERNAME,
//   password : process.env.DB_PASSWORD,
//   database : process.env.DB_NAME,
//   synchronize : process.env.DB_SYNCHRONIZE ===  'true',
//   logging : process.env.DB_LOGGING ===  'true',
//   entities : [
//     UserSchema,
//     MedicationSchema,
//     HealthDataSchema,
//     AlertSchema,
//     DeviceSchema,
//   ],
// });
