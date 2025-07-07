// const db = require('../config/db');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const globalData = require('../config/global-data.json');
// const userTypes = globalData.userTypes;

// const secretKey = process.env.JWT_SECRET;

// // User registration
// exports.registerUser = async (req, res) => {
//   const { username, password, role } = req.body;

//   if (!username || !password || !role) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const sql = 'INSERT INTO UserMaster (username, password, role) VALUES (?, ?, ?)';
//   db.query(sql, [username, hashedPassword, role], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Registration failed', err });
//     }
//     res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
//   });
// };

// // User login
// exports.loginUser = (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   const sql = 'SELECT * FROM UserMaster WHERE username = ?';
//   db.query(sql, [username], async (err, results) => {
//     if (err) {
//       return res.status(500).json({ message: 'Login failed', err });
//     }
//     if (results.length === 0) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const user = results[0];
//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ message: 'Login successful', token });
//   });
// };