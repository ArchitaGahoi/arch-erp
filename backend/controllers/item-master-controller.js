const db = require('../config/db');

// Get all items (for main table)
exports.getAllItems = (req, res) => {
  const sql = 'SELECT itemId, itemCode, itemName, unit FROM ItemMaster';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    res.json(result);
  });
};

// Get item by ID (for editing)
exports.getItemById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM ItemMaster WHERE itemId = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (result.length === 0) return res.status(404).json({ message: 'Item not found' });
    res.json(result[0]);
  });
};

// Add item
exports.addItem = (req, res) => {
  const { itemCode, itemName, unit } = req.body;
  const createdBy = req.user.id;
  const createdDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (!itemCode || !itemName || !unit) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const checkSql = 'SELECT itemId FROM ItemMaster WHERE itemCode = ?';
  db.query(checkSql, [itemCode], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Item code must be unique' });
    }
    const sql = `
      INSERT INTO ItemMaster (itemCode, itemName, unit, createdBy, createdDate)
      VALUES (?, ?, ?, ?, ?)
    `;
  db.query(sql, [itemCode, itemName, unit, createdBy, createdDate], (err, result) => {
    if (err) return res.status(500).json({ message: 'Insert failed', err });
    res.json({ message: 'Item added', itemId: result.insertId });
  });
  });
};

/// Update item
exports.updateItem = (req, res) => {
  const { itemCode, itemName, unit } = req.body;
  const modifiedBy = req.user.id;
  const modifiedDate = new Date();
  const { id } = req.params;

  // Get current itemCode for this id
  const getCurrentSql = 'SELECT itemCode FROM ItemMaster WHERE itemId = ?';
  db.query(getCurrentSql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (result.length === 0) return res.status(404).json({ message: 'Item not found' });

    const currentCode = result[0].itemCode;

    // If code is changing, check uniqueness
    if (itemCode !== currentCode) {
      const checkSql = 'SELECT itemId FROM ItemMaster WHERE itemCode = ? AND itemId != ?';
      db.query(checkSql, [itemCode, id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error', err });
        if (rows.length > 0) {
          return res.status(400).json({ message: 'Item code must be unique' });
        }
        doUpdate();
      });
    }else {
      doUpdate();
    }

    function doUpdate() {
      const sql = `
        UPDATE ItemMaster SET itemCode = ?, itemName = ?, unit = ?, modifiedBy = ?, modifiedDate = ?
        WHERE itemId = ?
      `;
      db.query(sql, [itemCode, itemName, unit, modifiedBy, modifiedDate, id], (err) => {
        if (err) return res.status(500).json({ message: 'Update failed', err });
        res.json({ message: 'Item updated' });
      });
    }
  });
};

// Delete item
exports.deleteItem = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM ItemMaster WHERE itemId = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Delete failed', err });
    res.json({ message: 'Item deleted' });
  });
};









































































