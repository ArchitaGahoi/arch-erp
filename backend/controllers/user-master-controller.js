const db = require('../config/db');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const globalData = require('../config/global-data.json');
const userTypes = globalData.userTypes;

const secretKey = process.env.JWT_SECRET;

// Get all Users (for main table)
exports.getAllUsers = (req, res) => {
  const sql = 'SELECT userId, code, emailId, password, userType FROM UserMaster';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    res.json(result);
  });
};

// Get User by ID (for editing)
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM UserMaster WHERE userId = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result[0]);
  });
};

// Add User
exports.addUser = async (req, res) => {
  const { code, emailId, password, userType } = req.body;
  //console.log("rebody---->",req.body);
  const createdBy = req.user.id;
  const createdDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (!code || !emailId || !password || !userType) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const checkSql = 'SELECT userId, code, emailId FROM UserMaster WHERE code = ? OR emailId = ?';
  db.query(checkSql, [code, emailId], async (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
      const errors = {};
      if (rows.length > 0) {
        const existing = rows[0];
        if (existing.code === code) errors.code = "User Code must be unique";
        if (existing.emailId === emailId) errors.emailId = "Email ID must be unique";

        return res.status(400).json({ errors });
      }
    try{
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = `
        INSERT INTO UserMaster (code, emailId, password, userType, createdBy, createdDate)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(sql, [code, emailId, hashedPassword, userType, createdBy, createdDate], (err, result) => {
        if (err) return res.status(500).json({ message: 'Insert failed', err });
        res.json({ message: 'User added', userId: result.insertId });
      });
    }
    catch (err) {
      return res.status(500).json({ message: 'Hashing error', err });
    }
  });   
};

/// Update User
exports.updateUser = (req, res) => {
  const { code, emailId, userType } = req.body;
  const modifiedBy = req.user.id;
  const modifiedDate = new Date();
  const { id } = req.params;

  const getCurrentSql = 'SELECT code FROM UserMaster WHERE userId = ?';
  db.query(getCurrentSql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });

    const currentCode = result[0].code;

    // First: check for email uniqueness
    const checkEmailSql = 'SELECT userId FROM UserMaster WHERE emailId = ? AND userId != ?';
    db.query(checkEmailSql, [emailId, id], (err, emailRows) => {
      if (err) return res.status(500).json({ message: 'DB error', err });
      if (emailRows.length > 0) {
        return res.status(400).json({ errors: { emailId: "Email ID must be unique" } });
      }

      // Now: check for code uniqueness if it's changed
      if (code !== currentCode) {
        const checkCodeSql = 'SELECT userId FROM UserMaster WHERE code = ? AND userId != ?';
        db.query(checkCodeSql, [code, id], (err, codeRows) => {
          if (err) return res.status(500).json({ message: 'DB error', err });
          if (codeRows.length > 0) {
            return res.status(400).json({ errors: { code: "User Code must be unique" } });
          }
          // Both checks passed
          doUpdate();
        });
      } else {
        // Only email changed, code is the same
        doUpdate();
      }
    });

    function doUpdate() {
      const sql = `
        UPDATE UserMaster SET code = ?, emailId = ?, userType = ?, modifiedBy = ?, modifiedDate = ?
        WHERE userId = ?
      `;
      db.query(sql, [code, emailId, userType, modifiedBy, modifiedDate, id], (err) => {
        if (err) return res.status(500).json({ message: 'Update failed', err });
        res.json({ message: 'User updated' });
      });
    }
  });
};


// Delete User
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM UserMaster WHERE userId = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Delete failed', err });
    res.json({ message: 'User deleted' });
  });
};

//User Login
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

//     const token = jwt.sign({ userId: user.id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ message: 'Login successful', token });
//   });
// };
exports.loginUser = async (req, res) => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = 'SELECT * FROM UserMaster WHERE emailId = ?';
  db.query(sql, [emailId], async (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (result.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = result[0];
    
    // Debug log
    console.log("User found:", user);


    // Try both 'Password' and 'Password' fields for compatibility
    const hash = user.password;
    if (!hash) return res.status(500).json({ message: 'User Password not set in DB' });

    // bcrypt.compare expects both arguments to be strings
    if (typeof password !== 'string' || typeof hash !== 'string') {
      return res.status(500).json({ message: 'Password data error' });
    }

    const isMatch = await bcrypt.compare(password, hash);
    const newHash = await bcrypt.hash(password,10);
    console.log("isMatch", isMatch,newHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Use UserId and UserType for token if present, else fallback
    const token = jwt.sign(
      { userId: user.userId, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token });
  });
};


