import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import { seedProducts } from './data/seedData.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('缺少 MONGO_URI，无法写入 MongoDB。');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB 已连接，开始同步种子数据...');

        await Product.deleteMany({});
        await Product.insertMany(seedProducts);

        console.log(`已写入 ${seedProducts.length} 条商品数据`);
        process.exit(0);
    } catch (error) {
        console.error('种子数据写入失败:', error.message);
        process.exit(1);
    }
};

seedDatabase();
