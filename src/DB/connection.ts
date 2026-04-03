import { connect } from 'mongoose';
import { DB_URI } from '../config/config';
export const connectDB = async() => {
    try {
        await connect(DB_URI as string);
        console.log('Database connected successfully!');
    } catch (error) {
        console.log('Database connection failed');
    }
}