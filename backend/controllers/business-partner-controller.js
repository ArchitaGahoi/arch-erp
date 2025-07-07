const db = require('../config/db');

// Get all items (for main table)
exports.getAllPartners = (req, res) => {
  const sql = 'SELECT bpId, bpCode, bpName, bpType, bpAddress, pin, state, city, country FROM BusinessPartner';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    res.json(result);
  });
};

// Get Partner by ID (for editing)
exports.getPartnerById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM BusinessPartner WHERE bpId = ?';
  db.query(sql, [id], (err, result) => {
    process.stdout.write("rrrrrrr------>",result);
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (result.length === 0) return res.status(404).json({ message: 'Partner not found' });
    res.json({ ...result, pin: result.pin.toString() });

  });
};

// Add Partner
exports.addPartner = (req, res) => {
  const { bpCode, bpName, bpType, bpAddress, pin, state, city, country } = req.body;
  const createdBy = req.user.id;
  const createdDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (!bpCode || !bpName || !bpType || !bpAddress || !pin || !state || !city || !country) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const checkSql = 'SELECT bpId FROM BusinessPartner WHERE bpCode = ?';
  db.query(checkSql, [bpCode], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Partner code must be unique' });
    }
    const sql = `
      INSERT INTO BusinessPartner (bpCode, bpName, bpType, bpAddress, pin, state, city, country, createdBy, createdDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  db.query(sql, [bpCode, bpName, bpType, bpAddress, pin, state, city, country, createdBy, createdDate], (err, result) => {
    if (err) return res.status(500).json({ message: 'Insert failed', err });
    res.json({ message: 'Partner added', bpId: result.insertId });
  });
  });
};

/// Update Partner
exports.updatePartner = (req, res) => {
  const { bpCode, bpName, bpType, bpAddress, pin, state, city, country } = req.body;
  const modifiedBy = req.user.id;
  const modifiedDate = new Date();
  const { id } = req.params;

  // Get current PartnerCode for this id
  const getCurrentSql = 'SELECT bpCode FROM BusinessPartner WHERE bpId = ?';
  db.query(getCurrentSql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (result.length === 0) return res.status(404).json({ message: 'Partner not found' });

    const currentCode = result[0].bpCode;

    // If code is changing, check uniqueness
    if (bpCode !== currentCode) {
      const checkSql = 'SELECT bpId FROM BusinessPartner WHERE bpCode = ? AND bpId != ?';
      db.query(checkSql, [bpCode, id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error', err });
        if (rows.length > 0) {
          console.log("Partner");
          return res.status(400).json({ message: 'Partner code must be unique' });
        }
        doUpdate();
      });
    }else {
      doUpdate();
    }

    function doUpdate() {
      const sql = `
        UPDATE BusinessPartner SET bpCode = ?, bpName = ?, bpType = ?, bpAddress = ?, pin = ?, state = ?, city = ?, country = ?, modifiedBy = ?, modifiedDate = ?
        WHERE bpId = ?
      `;
      db.query(sql, [bpCode, bpName, bpType, bpAddress, pin, state, city, country, modifiedBy, modifiedDate, id], (err) => {
        if (err) return res.status(500).json({ message: 'Update failed', err });
        res.json({ message: 'Partner updated' });
      });
    }
  });
};

// Delete Partner
exports.deletePartner = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM BusinessPartner WHERE bpId = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Delete failed', err });
    res.json({ message: 'Partner deleted' });
  });
};

