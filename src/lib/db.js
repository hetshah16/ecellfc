import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
const pool = mysql.createPool({
  host: 'sql112.infinityfree.com',
  user: process.env.DB_USER || 'if0_40296634',
  password: process.env.DB_PASS ||'Hetshah123' ,
  database: process.env.DB_NAME || 'if0_40296634_ecell_fc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
