const Database = require('../models/Database');

// シングルトンインスタンス
let db = null;

const getDatabase = async () => {
  if (!db) {
    db = new Database();
    await db.connect();
  }
  return db;
};

// データベース操作のラッパー関数
const run = async (sql, params = []) => {
  const database = await getDatabase();
  return database.run(sql, params);
};

const get = async (sql, params = []) => {
  const database = await getDatabase();
  return database.get(sql, params);
};

const all = async (sql, params = []) => {
  const database = await getDatabase();
  return database.all(sql, params);
};

module.exports = {
  run,
  get,
  all,
  getDatabase
};