// src/db.js

import {Sequelize} from 'sequelize';

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


