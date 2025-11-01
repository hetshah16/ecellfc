import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS ||'Hetshah@123' ,
  database: process.env.DB_NAME || 'ecell_fc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
