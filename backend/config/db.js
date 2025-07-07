const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Mouse@2005',
  database: 'arch_erp'
});

module.exports = db;
