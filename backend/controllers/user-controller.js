// const db = require('../config/db');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const globalData = require('../config/global-data.json');
// const userTypes = globalData.userTypes;

// const secretKey = process.env.JWT_SECRET;

// // Create a new user
// exports.createUser = async (req, res) => {
//   const { emailId, password, userType } = req.body;

//   if (!emailId || !password || !userType) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const sql = 'INSERT INTO UserMaster (emailId, password, userType) VALUES (?, ?, ?)';

//   console.log(db);

//   db.query(sql, [emailId, hashedPassword, userType], (err, result) => {
//     if (err) return res.status(500).json({ message: 'User creation failed', err });
//     res.status(201).json({ message: 'User created', userId: result.insertId });
//   });
// };

// // Get user by ID
// exports.getUserById = (req, res) => {
//   const { id } = req.params;
//   const sql = 'SELECT emailId, userType FROM UserMaster WHERE userId = ?';

//   db.query(sql, [id], (err, result) => {
//     if (err) return res.status(500).json({ message: 'DB error', err });
//     if (result.length === 0) return res.status(404).json({ message: 'User not found' });
//     res.json(result[0]);
//   });
// };

// // User login
// exports.loginUser = async (req, res) => {
//   const { emailId, password } = req.body;

//   if (!emailId || !password) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   const sql = 'SELECT * FROM UserMaster WHERE emailId = ?';
//   db.query(sql, [emailId], async (err, result) => {
//     if (err) return res.status(500).json({ message: 'DB error', err });
//     if (result.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

//     const user = result[0];
//     // Debug log
//     console.log("User found:", user);


//     // Try both 'Password' and 'Password' fields for compatibility
//     const hash = user.password;
//     if (!hash) return res.status(500).json({ message: 'User Password not set in DB' });

//     // bcrypt.compare expects both arguments to be strings
//     if (typeof password !== 'string' || typeof hash !== 'string') {
//       return res.status(500).json({ message: 'Password data error' });
//     }

//     const isMatch = await bcrypt.compare(password, hash);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

//     // Use UserId and UserType for token if present, else fallback
//     const token = jwt.sign(
//       { userId: user.userId, userType: user.userType },
//   process.env.JWT_SECRET,
//   { expiresIn: '1h' }
//     );
//     res.json({ message: 'Login successful', token });
//   });
// };

// // Get all users
// exports.getAllUsers = (req, res) => {
//   const sql = 'SELECT userId, emailId, userType FROM UserMaster';

//   db.query(sql, (err, result) => {
//     if (err) return res.status(500).json({ message: 'DB error', err });
//     res.json(result);
//   });
// };

// exports.registerUser = async (req, res) => {
//   const { emailId, password, userType } = req.body;

//   if (!emailId || !password || !userType) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const sql = 'INSERT INTO UserMaster (emailId, password, userType) VALUES (?, ?, ?)';

//   db.query(sql, [emailId, hashedPassword, userType], (err, result) => {
//     if (err) return res.status(500).json({ message: 'User registration failed', err });
//     res.status(201).json({ message: 'User registered', userId: result.insertId });
//   });
// };

// // Update user
// exports.updateUser = (req, res) => {
//   const { id } = req.params;
//   const { emailId, password, userType } = req.body;

//   if (!emailId && !password && !userType) {
//     return res.status(400).json({ message: 'No fields to update' });
//   }

//   let updateFields = [];
//   let params = [];

//   if (emailId) {
//     updateFields.push('emailId = ?');
//     params.push(emailId);
//   }
//   if (password) {
//     // Hash Password before updating
//     bcrypt.hash(password, 10, (err, hash) => {
//       if (err) return res.status(500).json({ message: 'Hashing failed', err });
//       updateFields.push('password = ?');
//       params.push(hash);
//       finishUpdate();
//     });
//     return;
//   }
//   if (userType) {
//     updateFields.push('userType = ?');
//     params.push(userType);
//   }

//   finishUpdate();

//   function finishUpdate() {
//     if (updateFields.length === 0) {
//       return res.status(400).json({ message: 'No valid fields to update' });
//     }
//     const sql = `UPDATE UserMaster SET ${updateFields.join(', ')} WHERE userId = ?`;
//     params.push(id);
//     db.query(sql, params, (err, result) => {
//       if (err) return res.status(500).json({ message: 'Update failed', err });
//       res.json({ message: 'User updated' });
//     });
//   }
// };

// // Delete user
// exports.deleteUser = (req, res) => {
//   const { id } = req.params;
//   const sql = 'DELETE FROM UserMaster WHERE userId = ?';
//   db.query(sql, [id], (err, result) => {
//     if (err) return res.status(500).json({ message: 'Delete failed', err });
//     res.json({ message: 'User deleted' });
//   });
// };