// Yusuf Abdurrahman - 247006111102
import mysql from "mysql2/promise";

let pool;

export function getDB() {
  if (!pool) {
    const {
      DB_HOST = "127.0.0.1",
      DB_USER = "root",
      DB_PASSWORD,
      DB_NAME = "dasasena_admin",
    } = process.env;

    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD ?? "",
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return pool;
}
