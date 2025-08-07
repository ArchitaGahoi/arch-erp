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
  const checkSql = `
    SELECT itemId FROM ItemMaster 
    WHERE itemCode = ? OR itemName = ?
  `;
  db.query(checkSql, [itemCode, itemName], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', err });

    const codeExists = rows.some(row => row.itemCode === itemCode);
    const nameExists = rows.some(row => row.itemName === itemName);

    if (codeExists) {
      return res.status(400).json({ errors:{ itemCode: 'Item code must be unique' } });
    }
    if (nameExists) {
      return res.status(400).json({ errors:{ itemName: 'Item name must be unique' } });
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
  const getCurrentSql = 'SELECT itemCode, itemName FROM ItemMaster WHERE itemId = ?';
  db.query(getCurrentSql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (result.length === 0) return res.status(404).json({ message: 'Item not found' });

    const currentCode = result[0].itemCode;
    const currentName = result[0].itemName;

    const checkUniqueness = () => {
      const checkSql = `
        SELECT itemId, itemCode, itemName FROM ItemMaster
        WHERE (itemCode = ? OR itemName = ?) AND itemId != ?
      `;
      db.query(checkSql, [itemCode, itemName, id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error', err });

        const codeExists = rows.some(row => row.itemCode === itemCode);
        const nameExists = rows.some(row => row.itemName === itemName);

        if (codeExists) return res.status(400).json({ errors:{ itemCode: 'Item code must be unique' } });
        if (nameExists) return res.status(400).json({ errors:{ itemName: 'Item name must be unique' } });

        doUpdate();
      });
    };

    if (itemCode !== currentCode || itemName !== currentName) {
      checkUniqueness();
    } else {
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
}

// Delete item
exports.deleteItem = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM ItemMaster WHERE itemId = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Delete failed', err });
    res.json({ message: 'Item deleted' });
  });
};









































































