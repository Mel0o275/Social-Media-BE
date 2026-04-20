import {config} from 'dotenv';
import { resolve } from 'path';

config({path: resolve(`./.env.${process.env.NODE_ENV || 'dev'}`)});

export const PORT = process.env.PORT;

export const DB_URI = process.env.DB_URI;

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

export const SYSTEM_TOKEN_SECRET_KEY = process.env.SYSTEM_TOKEN_SECRET_KEY!;

export const USER_TOKEN_SECRET_KEY = process.env.USER_TOKEN_SECRET_KEY!;

export const REFRESH_SYSTEM_TOKEN_SECRET_KEY = process.env.REFRESH_SYSTEM_TOKEN_SECRET_KEY!;

export const REFRESH_USER_TOKEN_SECRET_KEY = process.env.REFRESH_USER_TOKEN_SECRET_KEY!;

export const REDIS_URL = process.env.REDIS_URL!;

export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY!;

export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY!;

export const AWS_REGION = process.env.AWS_REGION!;  

export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME!;