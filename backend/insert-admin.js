const db = require('./config/db'); // adjust path if needed
const bcrypt = require('bcrypt');

const Code = 'ADM001';
const EmailId = 'admin@gmail.com';
const plainPassword = 'admin@001';
const UserType = 1;

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    console.error("Hashing failed:", err);
    process.exit(1);
  }

  const sql = 'INSERT INTO UserMaster (Code, EmailId, Password, UserType) VALUES (?, ?, ?, ?)';
  db.query(sql, [Code, EmailId, hash, UserType], (err, result) => {
    if (err) {
      console.error("Insert failed:", err);
    } else {
      console.log("✅ Admin user inserted successfully! ID:", result.insertId);
    }
    process.exit(); // Exit script
  });
});
