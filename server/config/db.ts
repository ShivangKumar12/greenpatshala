// server/db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import * as schema from '@shared/schema';

dotenv.config();

export const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: (() => {
    if (!process.env.DB_PASSWORD && process.env.NODE_ENV === 'production') {
      throw new Error('❌ DB_PASSWORD environment variable is required in production');
    }
    return process.env.DB_PASSWORD || '';
  })(),
  database: process.env.DB_NAME || 'unchi_udaan_demo',
  waitForConnections: true,
  connectionLimit: 50,      // ✅ BUG-012 FIX: Increased from 10 for concurrent load
  queueLimit: 0,
  connectTimeout: 30000,    // 30s connection timeout
  timezone: 'Z',
  dateStrings: true,
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });

// Alias for compatibility with existing code
export const pool = poolConnection;

export const testConnection = async () => {
  try {
    const connection = await poolConnection.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    console.log(`📊 Database: ${process.env.DB_NAME || 'unchi_udaan_demo'}`);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
