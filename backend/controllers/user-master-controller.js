const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const globalData = require('../config/global-data.json');
const userTypes = globalData.userTypes;
const nodemailer = require("nodemailer");
const otpStore = {}; // In-memory store for OTP
const redisClient = require("../config/redis-client");

const secretKey = process.env.JWT_SECRET;

// In-memory store for reset tokens (for demo; use DB/Redis in production)
// const resetTokens = {};

// FORGET PASSWORD: Generate and "send" reset token
exports.forgetPassword = (req, res) => {
  const { emailId } = req.body;
  if (!emailId) return res.status(400).json({ message: "Email is required" });

  const sql = 'SELECT userId FROM UserMaster WHERE emailId = ?';
  db.query(sql, [emailId], async (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    // Store OTP in Redis with 5 min expiry
    await redisClient.setEx(`otp:${emailId}`, 300, otp); // 300 sec = 5 min

    // Send OTP via email
    try {
      const transporter = nodemailer.createTransport({
        //service: "gmail",
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Arch-erp" <${process.env.EMAIL_USER}>`,
        to: emailId,
        subject: "Your OTP for Password Reset",
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
      });

      res.json({ message: "OTP sent to email" });
    } catch (mailErr) {
      console.error("Mail error", mailErr);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });
};



// exports.forgetPassword = (req, res) => {
//   const { emailId } = req.body;
//   if (!emailId) return res.status(400).json({ message: "Email is required" });

//   const sql = 'SELECT userId FROM UserMaster WHERE emailId = ?';
//   db.query(sql, [emailId], (err, rows) => {
//     if (err) return res.status(500).json({ message: "DB error", err });
//     if (!rows.length) return res.status(404).json({ message: "User not found" });

//     const token = crypto.randomBytes(32).toString('hex');
//     resetTokens[token] = { userId: rows[0].userId, expires: Date.now() + 15 * 60 * 1000 }; // 15 min

//     // In production, send token via email. Here, return it for demo.
//     res.json({ message: "Reset token generated", token });
//   });
// };

// RESET PASSWORD: Use token to set new password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: "Token and password required" });
  }

  const emailId = await redisClient.get(`resetToken:${token}`);
  if (!emailId) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = 'UPDATE UserMaster SET password = ? WHERE emailId = ?';
  db.query(sql, [hashedPassword, emailId], (err) => {
    if (err) return res.status(500).json({ message: "DB error", err });

    redisClient.del(`resetToken:${token}`);
    res.json({ message: "Password reset successful" });
  });
};



// exports.resetPassword = (req, res) => {
//   const { token, password } = req.body;
//   if (!token || !password) return res.status(400).json({ message: "Token and password required" });

//   const data = resetTokens[token];
//   if (!data || data.expires < Date.now()) return res.status(400).json({ message: "Invalid or expired token" });

//   bcrypt.hash(password, 10, (err, hash) => {
//     if (err) return res.status(500).json({ message: "Hash error", err });
//     const sql = 'UPDATE UserMaster SET password = ? WHERE userId = ?';
//     db.query(sql, [hash, data.userId], (err) => {
//       if (err) return res.status(500).json({ message: "DB error", err });
//       delete resetTokens[token];
//       res.json({ message: "Password reset successful" });
//     });
//   });
// };


// VERIFY OTP: Check OTP and allow password reset
exports.verifyOtp = async (req, res) => {
  const { emailId, otp } = req.body;
  if (!emailId || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const storedOtp = await redisClient.get(`otp:${emailId}`);
  if (!storedOtp) {
    return res.status(400).json({ message: "OTP expired or invalid" });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const token = crypto.randomBytes(32).toString('hex');
  await redisClient.setEx(`resetToken:${token}`, 900, emailId); // 15 mins valid

  // Clear OTP after use
  await redisClient.del(`otp:${emailId}`);

  res.json({ message: "OTP verified", token });
};

// CHANGE PASSWORD: Authenticated user changes password
exports.changePassword = (req, res) => {
  console.log("Decoded user:", req.user);
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: "Both passwords required" });

  const sql = 'SELECT password FROM UserMaster WHERE userId = ?';
  db.query(sql, [userId], async (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    db.query('UPDATE UserMaster SET password = ? WHERE userId = ?', [hash, userId], (err) => {
      if (err) return res.status(500).json({ message: "DB error", err });
      res.json({ message: "Password changed successfully" });
    });
  });
};

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
  const createdBy = req.user?.userId || req.user?.id;
  if (!createdBy) {
    return res.status(400).json({ message: "Creator (logged-in user) not identified" });
  }

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

  // Check if this user is referenced in businesspartner
  const checkSql = 'SELECT COUNT(*) AS count FROM businesspartner WHERE createdBy = ?';
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Check failed', err });

    const count = results[0].count;
    if (count > 0) {
      return res.status(400).json({
        message: 'Cannot delete user. It is referenced in other records.',
      });
    }

    // Safe to delete
    const deleteSql = 'DELETE FROM UserMaster WHERE userId = ?';
    db.query(deleteSql, [id], (err) => {
      if (err) return res.status(500).json({ message: 'Delete failed', err });
      res.json({ message: 'User deleted successfully' });
    });
  });
};


// exports.deleteUser = (req, res) => {
//   const { id } = req.params;
//   const sql = 'DELETE FROM UserMaster WHERE userId = ?';
//   db.query(sql, [id], (err) => {
//     if (err) return res.status(500).json({ message: 'Delete failed', err });
//     res.json({ message: 'User deleted' });
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
      { userId: user.userId, userType: user.userType, code: user.code },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ message: 'Login successful', token });
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
