const db = require("../config/db");

// 🔐 Helper: Get pre-received quantity for an item in a PO
const getPreReceivedQty = (poItemDetailId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT SUM(recievedQty) AS totalReceived
      FROM GRNItemDetail
      WHERE poitemDetailId = ?
    `;
    db.query(sql, [poItemDetailId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0].totalReceived || 0);
    });
  });
};

// ✅ CREATE GRN
exports.createGRN = async (req, res) => {
  try {
    const {
      grnNo, grnDate, statusNo, supplierLocationNo, poNo,
      challanNo, challanDate, itemDetails
    } = req.body;

    const createdBy = req.user.id;
    const createdDate = new Date();

    if (!grnNo || !grnDate || !supplierLocationNo || !poNo || !challanNo || !challanDate) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔄 Check for duplicate GRN No
    const checkSql = "SELECT grnId FROM GRN WHERE grnNo = ?";
    const existing = await new Promise((resolve, reject) =>
      db.query(checkSql, [grnNo], (err, result) => err ? reject(err) : resolve(result))
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "GRN No already exists" });
    }

    // ✅ Insert GRN
    const insertSql = `
      INSERT INTO GRN (grnNo, grnDate, statusNo, supplierLocationNo, poNo, challanNo, challanDate, createdBy, createdDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const grnResult = await new Promise((resolve, reject) =>
      db.query(insertSql, [grnNo, grnDate, statusNo, supplierLocationNo, poNo, challanNo, challanDate, createdBy, createdDate],
        (err, result) => err ? reject(err) : resolve(result))
    );
    const grnId = grnResult.insertId;

    // ✅ Insert GRN Item Details
    for (const item of itemDetails) {
      const { poitemDetailId, recievedQty } = item;

      const insertItemSql = `
        INSERT INTO GRNItemDetail (grnId, poitemDetailId, recievedQty)
        VALUES (?, ?, ?)
      `;
      await new Promise((resolve, reject) =>
        db.query(insertItemSql, [grnId, poitemDetailId, recievedQty], (err) =>
          err ? reject(err) : resolve())
      );
    }

    res.json({ message: "GRN created successfully", grnId });

  } catch (err) {
    console.error("GRN Create Error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ✅ GET ALL GRNs
exports.getAllGRNs = (req, res) => {
  const sql = "SELECT * FROM GRN";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    res.json(result);
  });
};

// ✅ GET GRN BY ID (with itemDetails)
exports.getGRNById = (req, res) => {
  const grnId = req.params.id;
  const grnSql = "SELECT * FROM GRN WHERE grnId = ?";
  const itemSql = `
    SELECT 
      g.*, 
      p.itemId, 
      i.itemName, 
      p.quantity AS poQuantity
    FROM GRNItemDetail g
    JOIN PurchaseOrderItemDetail p ON g.poitemDetailId = p.itemDetailId
    JOIN ItemMaster i ON p.itemId = i.itemId
    WHERE g.grnId = ?
  `;

  db.query(grnSql, [grnId], (err, grn) => {
    if (err || grn.length === 0)
      return res.status(500).json({ message: "Error fetching GRN" });

    db.query(itemSql, [grnId], (err, items) => {
      if (err) {
        console.error("Item SQL Error:", err);  
        return res.status(500).json({ message: "Error fetching items", error: err });
      }
      res.json({ ...grn[0], itemDetails: items });
    });
  });
};

// ✅ DELETE GRN
exports.deleteGRN = (req, res) => {
  const grnId = req.params.id;

  const deleteItems = "DELETE FROM GRNItemDetail WHERE grnId = ?";
  const deleteGRN = "DELETE FROM GRN WHERE grnId = ?";

  db.query(deleteItems, [grnId], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete items", err });

    db.query(deleteGRN, [grnId], (err) => {
      if (err) return res.status(500).json({ message: "Failed to delete GRN", err });
      res.json({ message: "GRN deleted successfully" });
    });
  });
};

// ✅ UPDATE GRN
exports.updateGRN = async (req, res) => {
  const grnId = req.params.id;
  const {
    grnNo, grnDate, statusNo, supplierLocationNo, poNo,
    challanNo, challanDate, itemDetails
  } = req.body;
  const modifiedBy = req.user.id;
  const modifiedDate = new Date();

  // Fetch current GRN
  db.query("SELECT * FROM GRN WHERE grnId = ?", [grnId], async (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ message: "GRN not found" });

    if (result[0].statusNo !== 1)
      return res.status(400).json({ message: "Only GRNs with status 'Initialised' can be edited" });

    // Update GRN
    const updateSql = `
      UPDATE GRN
      SET grnNo = ?, grnDate = ?, statusNo = ?, supplierLocationNo = ?, poNo = ?, challanNo = ?, challanDate = ?, modifiedBy = ?, modifiedDate = ?
      WHERE grnId = ?
    `;
    db.query(updateSql, [grnNo, grnDate, statusNo, supplierLocationNo, poNo, challanNo, challanDate, modifiedBy, modifiedDate, grnId], (err) => {
      if (err) return res.status(500).json({ message: "Update failed", err });

      // Delete existing item details
      db.query("DELETE FROM GRNItemDetail WHERE grnId = ?", [grnId], async (err) => {
        if (err) return res.status(500).json({ message: "Failed to clear old items", err });

        // Insert updated items
        for (const item of itemDetails) {
          const { poitemDetailId, recievedQty } = item;
          db.query("INSERT INTO GRNItemDetail (grnId, poitemDetailId, recievedQty) VALUES (?, ?, ?)",
            [grnId, poitemDetailId, recievedQty]);
        }

        res.json({ message: "GRN updated" });
      });
    });
  });
};

// ✅ PO item fetch for GRN creation
exports.getPOItemsForGRN = async (req, res) => {
  const poNo = req.params.poNo;

  const sql = `
    SELECT 
      d.itemDetailId AS poitemDetailId, d.quantity AS poQuantity, i.itemName,
      COALESCE(SUM(g.recievedQty), 0) AS preRecivedQuantity
    FROM PurchaseOrderItemDetail d
    JOIN ItemMaster i ON d.itemId = i.itemId
    LEFT JOIN GRNItemDetail g ON g.poitemDetailId = d.itemDetailId
    JOIN PurchaseOrder po ON d.poId = po.poId
    WHERE po.poNo = ?
    GROUP BY d.itemDetailId
    HAVING poQuantity > preRecivedQuantity
  `;

  db.query(sql, [poNo], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch PO items", err });
    const items = results.map((row) => ({
      poitemDetailId: row.poitemDetailId,
      itemName: row.itemName,
      poQuantity: row.poQuantity,
      preRecivedQuantity: row.preRecivedQuantity,
      balance: row.poQuantity - row.preRecivedQuantity,
    }));
    res.json(items);
  });
};
