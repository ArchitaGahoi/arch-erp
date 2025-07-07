const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
//const authRoutes = require('./routes/auth-routes');
const itemMasterRoutes = require('./routes/item-master-routes');
//const userRoutes = require('./routes/user-routes');
const userMasterRoutes = require('./routes/user-master-routes');
const businessPartnerRoutes = require('./routes/business-partner-routes');
const purchaseOrderRoutes = require('./routes/purchase-order-routes');
const errorHandler = require('./middleware/error-handler');

const db = require('./config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to the database
db.getConnection((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to the database.');
  createDefaultAdmin();
});

// Create default admin if not exists
async function createDefaultAdmin() {
  console.log('Creating default admin...');
  const adminEmail = 'admin@gmail.com';
  const adminCode = 'ADM001';
  const adminPassword = await bcrypt.hash('admin@001', 10); // default password
  const checkSql = 'SELECT * FROM UserMaster WHERE EmailId = ?';
  console.log('Checking if admin exists...');
  db.query(checkSql, [adminEmail], (err, result) => {
    console.log('Admin exists:', result.length >= 0);
    console.log('Result:', result);
    if (err) return console.error('Error checking admin:', err);
    if (result.length === 0) {
      console.log('Admin does not exist, creating...');
      const insertSql = 'INSERT INTO UserMaster (Code, EmailId, Password, UserType, createdBy, createdDate) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(insertSql, [adminCode, adminEmail, adminPassword, 1, 1, new Date()], (err) => {
        if (err) return console.error('Error creating default admin:', err);
        console.log('Default admin user created.');
      });
    }
  });
}

// Routes
//app.use('/api/auth', authRoutes);
app.use('/api/item-master', itemMasterRoutes);
//app.use('/api/users', userRoutes);
app.use('/api/user-master', userMasterRoutes);
app.use('/api/business-partner', businessPartnerRoutes);
app.use('/api/purchase-order', purchaseOrderRoutes);

// Error middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});