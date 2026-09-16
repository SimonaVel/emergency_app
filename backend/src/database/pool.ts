import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

export const pool = mysql.createPool({
  host: env.mysql.host,
  port: env.mysql.port,
  database: env.mysql.database,
  user: env.mysql.user,
  password: env.mysql.password,
  connectionLimit: 10,
});