const db = require('../config/db');

// Create Purchase Order with item & tax details
exports.createPurchaseOrder = (req, res) => {
  const {
    poNo,
    poDate,
    statusNo,
    supplierLocationNo,
    netAmount,
    itemDetails,
    taxDetails,
  } = req.body;

  const createdBy = req.user.id;
  const createdDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (!poNo || !poDate || !statusNo || !supplierLocationNo) {
    return res.status(400).json({ 
      errors: {
        poNo: "PO Number is required",
        poDate: "PO Date is required",
        statusNo: "Status is required",
        supplierLocationNo: "Supplier Location is required",
      } 
    });
  }

  // Map status string to numeric value
  let statusValue;
  if (statusNo === 1) statusValue = 1;
  else if (statusNo === 2) statusValue = 2;
  else return res.status(400).json({ errors: { statusNo: "Invalid status" } });

  // Extract numeric supplier location ID
  if (isNaN(supplierLocationNo)) {
    return res.status(400).json({ errors: { supplierLocationNo: "Invalid Supplier Location" } });
  }
  const supplierLocationId = parseInt(supplierLocationNo);

  // Format poDate properly
  const formattedPoDate = new Date(poDate).toISOString().slice(0, 10); // YYYY-MM-DD

  // Step 1: Check for unique PO number
  const checkSql = "SELECT poId FROM PurchaseOrder WHERE poNo = ?";
  db.query(checkSql, [poNo], (err, rows) => {
    if (err) {
      console.error("DB Error (Check PO No):", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    if (rows.length > 0) {
      return res.status(400).json({ errors: { poNo: "PO Number must be unique" } });
    }

    // Step 2: Insert into PurchaseOrder
    const insertSql = `
      INSERT INTO PurchaseOrder 
      (poNo, poDate, statusNo, supplierLocationNo, netAmount, createdBy, createdDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertSql,
      [poNo, formattedPoDate, statusValue, supplierLocationId, netAmount, createdBy, createdDate],
      (err, result) => {
        if (err) {
          console.error("DB Error (Insert PO):", err);
          return res.status(500).json({ message: "Insert failed", error: err });
        }

        const poId = result.insertId;

        // Step 3: Insert Item Details
        if (itemDetails.length === 0) {
          return res.status(400).json({ message: "At least one item detail is required" });
        }

        for (let i = 0; i < itemDetails.length; i++) {
          const item = itemDetails[i];
          const itemSql = `
            INSERT INTO PurchaseOrderItemDetail (itemId, poId, quantity, rate, amount)
            VALUES (?, ?, ?, ?, ?)
          `;
          db.query(
            itemSql,
            [item.itemId, poId, item.quantity, item.rate, item.amount],
            (err) => {
              if (err) {
                console.error("DB Error (Insert Item):", err);
                return res.status(500).json({ message: "Item insert failed", error: err });
              }
            }
          );
        }

        // Step 4: Insert Tax Details
        for (let i = 0; i < taxDetails.length; i++) {
          const tax = taxDetails[i];
          const taxSql = `
            INSERT INTO PurchaseOrderTaxDetail (poId, taxName, nature, amount)
            VALUES (?, ?, ?, ?)
          `;
          db.query(
            taxSql,
            [poId, tax.taxName, tax.nature, tax.amount],
            (err) => {
              if (err) {
                console.error("DB Error (Insert Tax):", err);
                return res.status(500).json({ message: "Tax insert failed", error: err });
              }
            }
          );
        }

        // Step 5: Final Response
        res.json({ message: "Purchase Order created", poId });
      }
    );
  });
};

// Get All Purchase Orders
exports.getAllPurchaseOrders = (req, res) => {
  db.query('SELECT * FROM PurchaseOrder', (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    res.json(result);
  });
};

// Get Purchase Order by ID (with items and tax)
exports.getPurchaseOrderById = (req, res) => {
  const { id } = req.params;
  const poQuery = 'SELECT po.*, bp.bpName, bp.bpCode, bp.bpAddress FROM PurchaseOrder po JOIN BusinessPartner bp ON po.supplierLocationNo = bp.bpId WHERE po.poId = ?';
  const itemQuery = `SELECT pod.*, im.itemName, im.unit FROM PurchaseOrderItemDetail pod JOIN ItemMaster im ON pod.itemId = im.itemId WHERE pod.poId = ?
  `;
  const taxQuery = 'SELECT * FROM PurchaseOrderTaxDetail WHERE poId = ?';

  db.query(poQuery, [id], (err, po) => {
    if (err) return res.status(500).json({ message: 'DB error', err });
    if (po.length === 0) return res.status(404).json({ message: 'PO not found' });

    db.query(itemQuery, [id], (err, items) => {
      if (err) return res.status(500).json({ message: 'Item query failed', err });

      db.query(taxQuery, [id], (err, taxes) => {
        if (err) return res.status(500).json({ message: 'Tax query failed', err });

        const formattedTaxes = taxes.map((tax) => ({
          ...tax,
          nature: tax.nature === 1 ? "Add" : "Subtract",
        }));

        res.json({
          ...po[0],
          //supplierLocationNo: po[0].bpId,
          //supplierLocationLabel: `${po[0].bpName} (${po[0].bpCode}) (${po[0].bpAddress})`,
          itemDetails: items,
          taxDetails: formattedTaxes
        });
      });
    });
  });
};



// Update Purchase Order 
exports.updatePurchaseOrder = (req, res) => {
  const { id } = req.params;
  const {
    poNo,
    poDate,
    statusNo,
    supplierLocationNo,
    netAmount,
    itemDetails,
    taxDetails,
  } = req.body;

  const modifiedBy = req.user.id;
  const modifiedDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  // Check for missing fields
  if (!poNo || !poDate || !statusNo || !supplierLocationNo) {
    return res.status(400).json({ 
      errors: {
        poNo: "PO Number is required",
        poDate: "PO Date is required",
        statusNo: "Status is required",
        supplierLocationNo: "Supplier Location is required",
      } 
    });
  }

  // Check if supplierLocationNo is valid number
  if (isNaN(supplierLocationNo)) {
    return res.status(400).json({ errors: { supplierLocationNo: "Invalid Supplier Location" }  });
  }

  const formattedPoDate = new Date(poDate).toISOString().slice(0, 10); 

  // Step 1: Check if PO exists
  const getCurrentSql = "SELECT poNo FROM PurchaseOrder WHERE poId = ?";
  db.query(getCurrentSql, [id], (err, result) => {
    if (err) return res.status(500).json({ errors: { general: "DB error", err } });
    if (result.length === 0)
      return res.status(404).json({ errors: { general: "Purchase Order not found" } });

    // Step 2: Check for duplicate PO number (excluding self)
    const checkSql = "SELECT poId FROM PurchaseOrder WHERE poNo = ? AND poId != ?";
    db.query(checkSql, [poNo, id], (err, rows) => {
      if (err) return res.status(500).json({ errors: { general: "DB error", err } });
      if (rows.length > 0) {
        return res.status(400).json({ errors: { poNo: "PO Number must be unique" } });
      }
      doUpdate();
    });
  });

  // Step 3: Do Update
  function doUpdate() {
    const sql = ` 
      UPDATE PurchaseOrder SET 
      poNo = ?, poDate = ?, statusNo = ?, supplierLocationNo = ?, netAmount = ?, 
      modifiedBy = ?, modifiedDate = ? 
      WHERE poId = ?
    `;
    db.query(
      sql,
      [poNo, formattedPoDate, statusNo, supplierLocationNo, netAmount, modifiedBy, modifiedDate, id],
      (err) => {
        if (err)
          return res.status(500).json({ message: "Update failed (PO Header)", err });

        // Clear old items/taxes
        const deleteItems = "DELETE FROM PurchaseOrderItemDetail WHERE poId = ?";
        const deleteTaxes = "DELETE FROM PurchaseOrderTaxDetail WHERE poId = ?";

        db.query(deleteItems, [id], (err) => {
          if (err)
            return res.status(500).json({ message: "Failed to delete old item details", err });

          db.query(deleteTaxes, [id], (err) => {
            if (err)
              return res.status(500).json({ message: "Failed to delete old tax details", err });

            // Insert item details
            for (let i = 0; i < itemDetails.length; i++) {
              const item = itemDetails[i];
              const itemSql = `
                INSERT INTO PurchaseOrderItemDetail (itemId, poId, quantity, rate, amount)
                VALUES (?, ?, ?, ?, ?)
              `;
              db.query(itemSql, [item.itemId, id, item.quantity, item.rate, item.amount], (err) => {
                if (err) {
                  console.error("DB Error (Insert Item):", err);
                  return res.status(500).json({ message: "Item insert failed", err });
                }
              });
            }

            // Insert tax details
            for (let i = 0; i < taxDetails.length; i++) {
              const tax = taxDetails[i];
              const taxSql = `
                INSERT INTO PurchaseOrderTaxDetail (poId, taxName, nature, amount)
                VALUES (?, ?, ?, ?)
              `;
              db.query(taxSql, [id, tax.taxName, tax.nature, tax.amount], (err) => {
                if (err) {
                  console.error("DB Error (Insert Tax):", err);
                  return res.status(500).json({ message: "Tax insert failed", err });
                }
              });
            }

            res.json({ message: "Purchase Order updated" });
          });
        });
      }
    );
  }
};



// Delete Purchase Order (with cascading deletes)
exports.deletePurchaseOrder = (req, res) => {
  const { id } = req.params;

  const deleteItemSql = 'DELETE FROM PurchaseOrderItemDetail WHERE poId = ?';
  const deleteTaxSql = 'DELETE FROM PurchaseOrderTaxDetail WHERE poId = ?';
  const deletePoSql = 'DELETE FROM PurchaseOrder WHERE poId = ?';

  db.query(deleteItemSql, [id], (err) => {
    if (err) {
      console.error("DB Error (Delete Items):", err);
      return res.status(500).json({ message: 'Delete failed', error: err });
    }

    db.query(deleteTaxSql, [id], (err) => {
      if (err) {
        console.error("DB Error (Delete Taxes):", err);
        return res.status(500).json({ message: 'Delete failed', error: err });
      }

      db.query(deletePoSql, [id], (err) => {
        if (err) {
          console.error("DB Error (Delete PO):", err);
          return res.status(500).json({ message: 'Delete failed', error: err });
        }

        res.json({ message: 'Purchase Order deleted' });
      });
    });
  });
};

// exports.updatePurchaseOrder = (req, res) => {
//   const { id } = req.params;
//   const {
//     poNo,
//     poDate,
//     statusNo,
//     supplierLocationNo,
//     netAmount,
//     itemDetails,
//     taxDetails,
//   } = req.body;

//   const modifiedBy = req.user.id;
//   const modifiedDate = new Date().toISOString().slice(0, 19).replace("T", " ");

//   // Get current poNo for this id
//   const getCurrentSql = "SELECT poNo FROM PurchaseOrder WHERE poId = ?";
//   db.query(getCurrentSql, [id], (err, result) => {
//     if (err) return res.status(500).json({ message: "DB error", err });
//     if (result.length === 0)
//       return res.status(404).json({ message: "Purchase Order not found" });

//     const currentPoNo = result[0].poNo;

//     // If PO No is changing, check uniqueness
//     const checkSql = "SELECT poId FROM PurchaseOrder WHERE poNo = ? AND poId != ?";
//   db.query(checkSql, [poNo, id], (err, rows) => {
//     if (err) return res.status(500).json({ message: "DB error", err });
//     if (rows.length > 0) {
//       return res.status(400).json({ message: "PO Number must be unique" });
//     }
//     doUpdate(); // safe to proceed
//   });
//   });

  

//   function doUpdate() {
//     const formattedPoDate = new Date(poDate).toISOString().slice(0, 10);
//     const sql = `
//       UPDATE PurchaseOrder SET 
//       poNo = ?, poDate = ?, statusNo = ?, supplierLocationNo = ?, netAmount = ?, 
//       modifiedBy = ?, modifiedDate = ? 
//       WHERE poId = ?
//     `;
//     db.query(
//       sql,
//       [poNo, formattedPoDate, statusNo, supplierLocationNo, netAmount, modifiedBy, modifiedDate, id],
//       (err) => {
//         if (err)
//           return res.status(500).json({ message: "Update failed (PO Header)", err });

//         // Delete existing item and tax details
//         const deleteItems = "DELETE FROM PurchaseOrderItemDetail WHERE poId = ?";
//         const deleteTaxes = "DELETE FROM PurchaseOrderTaxDetail WHERE poId = ?";

//         db.query(deleteItems, [id], (err) => {
//           if (err)
//             return res
//               .status(500)
//               .json({ message: "Failed to delete old item details", err });

//           db.query(deleteTaxes, [id], (err) => {
//             if (err)
//               return res
//                 .status(500)
//                 .json({ message: "Failed to delete old tax details", err });

//             // Re-insert item details
//             for (let i = 0; i < itemDetails.length; i++) {
//               const item = itemDetails[i];
//               const itemSql = `
//                 INSERT INTO PurchaseOrderItemDetail (itemId, poId, quantity, rate, amount)
//                 VALUES (?, ?, ?, ?, ?)
//               `;
//               db.query(
//                 itemSql,
//                 [item.itemId, id, item.quantity, item.rate, item.amount],
//                 (err) => {
//                   if (err) {
//                     console.error("DB Error (Insert Item):", err);
//                     return res
//                       .status(500)
//                       .json({ message: "Item insert failed", err });
//                   }
//                 }
//               );
//             }

//             // Re-insert tax details
//             for (let i = 0; i < taxDetails.length; i++) {
//               const tax = taxDetails[i];
//               const taxSql = `
//                 INSERT INTO PurchaseOrderTaxDetail (poId, taxName, nature, amount)
//                 VALUES (?, ?, ?, ?)
//               `;
//               db.query(
//                 taxSql,
//                 [id, tax.taxName, tax.nature, tax.amount],
//                 (err) => {
//                   if (err) {
//                     console.error("DB Error (Insert Tax):", err);
//                     return res
//                       .status(500)
//                       .json({ message: "Tax insert failed", err });
//                   }
//                 }
//               );
//             }

//             res.json({ message: "Purchase Order updated" });
//           });
//         });
//       }
//     );
//   }
// };


// exports.createPurchaseOrder = async (req, res) => {
//   const {
//     poNo,
//     poDate,
//     statusNo,
//     supplierLocationNo,
//     netAmount,
//     itemDetails,
//     taxDetails,
//   } = req.body;

//   const createdBy = req.user.id;
//   const createdDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

//   if (!poNo || !poDate || !statusNo || !supplierLocationNo ) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }
//   const checkSql = 'SELECT poId FROM PurchaseOrder WHERE poNo = ?';
//   db.query(checkSql, [poNo], async (err, rows) => {
//     if (err) return res.status(500).json({ message: 'DB error', err });
//     if (rows.length > 0) {
//       return res.status(400).json({ message: 'PO Number must be unique' });
//     }

//     db.getConnection(async (err, connection) => {
//       if (err) return res.status(500).json({ message: 'DB error', err });
    
//     const conn = connection;
  
//   try {
//     await conn.beginTransaction();

//     // Step 1: Insert PurchaseOrder
//     const [poResult] = await conn.query(
//       `INSERT INTO PurchaseOrder 
//       (poNo, poDate, statusNo, supplierLocationNo, netAmount, createdBy, createdDate) 
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [poNo, poDate, statusNo, supplierLocationNo, netAmount, createdBy, createdDate]
//     );
//     const poId = poResult.insertId;

//     // Step 2: Insert Item Details
//     for (const item of itemDetails) {
//       await conn.query(
//         `INSERT INTO PurchaseOrderItemDetail 
//         (itemId, poId, quantity, rate, amount) 
//         VALUES (?, ?, ?, ?, ?)`,
//         [item.itemId, poId, item.quantity, item.rate, item.amount]
//       );
//     }

//     // Step 3: Insert Tax Details
//     for (const tax of taxDetails) {
//       await conn.query(
//         `INSERT INTO PurchaseOrderTaxDetail 
//         (poId, taxName, nature, amount) 
//         VALUES (?, ?, ?, ?)`,
//         [poId, tax.taxName, tax.nature, tax.amount]
//       );
//     }

//     await conn.commit();
//     res.json({ message: 'Purchase Order created', poId });
//   } catch (err) {
//     console.error(err);
//     await conn.rollback();
//     res.status(500).json({ message: 'Transaction failed', err });
//   } finally {
//     conn.release();
//   }

// });
// });
// };