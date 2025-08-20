const db = require("../config/db");

//  Helper: Get pre-received quantity for an item in a PO
const getPreReceivedQty = (poItemDetailId, excludeGrnId = null, callback) => {
  let sql = `
    SELECT SUM(recievedQty) AS totalReceived
    FROM GRNItemDetail
    WHERE poitemDetailId = ?
  `;
  const params = [poItemDetailId]; 

  if (excludeGrnId) {
    sql += " AND grnId != ?";
    params.push(excludeGrnId);
  }

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);
    callback(null, results[0].totalReceived || 0);
  });
};


// //  CREATE GRN
// exports.createGRN = (req, res) => {
//   const {
//     grnNo, grnDate, statusNo, supplierLocationNo, poNo,
//     challanNo, challanDate, itemDetails
//   } = req.body;

//   const createdBy = req.user.id;
//   const createdDate = new Date().toISOString().slice(0, 19).replace("T", " ");

//   if (!grnNo || !grnDate || !statusNo || !supplierLocationNo || !poNo || !challanNo || !challanDate) {
//     return res.status(400).json({
//       errors: {
//         grnNo: !grnNo ? "GRN No is required" : undefined,
//         grnDate: !grnDate ? "GRN Date is required" : undefined,
//         statusNo: !statusNo ? "Status is required" : undefined,
//         supplierLocationNo: !supplierLocationNo ? "Supplier Location is required" : undefined,
//         poNo: !poNo ? "PO No is required" : undefined,
//         challanNo: !challanNo ? "Challan No is required" : undefined,
//         challanDate: !challanDate ? "Challan Date is required" : undefined,
//       }
//     });
//   }

//   // Check for duplicate GRN No
//   const checkSql = "SELECT grnId FROM GRN WHERE grnNo = ?";
//   db.query(checkSql, [grnNo], (err, rows) => {
//     if (err) {
//       console.error("DB Error (Check GRN No):", err);
//       return res.status(500).json({ message: "DB error", error: err });
//     }

//     if (rows.length > 0) {
//       return res.status(400).json({ errors: { grnNo: "GRN Number must be unique" } });
//     }
  
//     // Check for duplicate Challan No
//     const checkChallanSql = "SELECT grnId FROM GRN WHERE challanNo = ?";
//     db.query(checkChallanSql, [challanNo], (err, challanRows) => {
//       if (err) {
//         console.error("DB Error (Check Challan No):", err);
//         return res.status(500).json({ message: "DB error", error: err });
//       }

//       if (challanRows.length > 0) {
//         return res.status(400).json({ errors: { challanNo: "Challan Number must be unique" } });
//       }

//     // Insert GRN Header
//     const insertSql = ` 
//       INSERT INTO GRN (grnNo, grnDate, statusNo, supplierLocationNo, poNo, challanNo, challanDate, createdBy, createdDate)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(
//       insertSql,
//       [grnNo, grnDate, statusNo, supplierLocationNo, poNo, challanNo, challanDate, createdBy, createdDate],
//       (err, result) => {
//         if (err) {
//           console.error("DB Error (Insert GRN):", err);
//           return res.status(500).json({ message: "Insert failed", error: err });
//         }

//         const grnId = result.insertId;

//         // Validate item details
//         if (!Array.isArray(itemDetails) || itemDetails.length === 0) {
//           return res.status(400).json({ message: "At least one item detail is required" });
//         }

//         // Insert GRN item details
//         for (let i = 0; i < itemDetails.length; i++) {
//           const item = itemDetails[i];
//           const itemSql = `
//             INSERT INTO GRNItemDetail (grnId, poitemDetailId, recievedQty)
//             VALUES (?, ?, ?)
//           `;

//           db.query(itemSql, [grnId, item.poitemDetailId, item.recievedQty], (err) => {
//             if (err) {
//               console.error("DB Error (Insert GRN Item):", err);
//               return res.status(500).json({ message: "Item insert failed", error: err });
//             }
//           });
//         }

//         // Final response
//         res.json({ message: "GRN created successfully", grnId });
//       }
//     );
//   });
// };

exports.createGRN = (req, res) => {
  const {
    grnNo,
    grnDate,
    statusNo,
    supplierLocationNo,
    poNo,
    challanNo,
    challanDate,
    itemDetails,
  } = req.body;

  const createdBy = req.user.id;
  const createdDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (
    !grnNo ||
    !grnDate ||
    !statusNo ||
    !supplierLocationNo ||
    !poNo ||
    !challanNo ||
    !challanDate
  ) {
    return res.status(400).json({
      errors: {
        grnNo: !grnNo ? "GRN No is required" : undefined,
        grnDate: !grnDate ? "GRN Date is required" : undefined,
        statusNo: !statusNo ? "Status is required" : undefined,
        supplierLocationNo: !supplierLocationNo
          ? "Supplier Location is required"
          : undefined,
        poNo: !poNo ? "PO No is required" : undefined,
        challanNo: !challanNo ? "Challan No is required" : undefined,
        challanDate: !challanDate ? "Challan Date is required" : undefined,
      },
    });
  }

  if (!Array.isArray(itemDetails) || itemDetails.length === 0) {
    return res.status(400).json({ message: "At least one item detail is required" });
  }

  // Step 1: Check for duplicate GRN No
  db.query("SELECT grnId FROM GRN WHERE grnNo = ?", [grnNo], (err, grnRows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (grnRows.length > 0)
      return res.status(400).json({ errors: { grnNo: "GRN Number must be unique" } });

    // Step 2: Check for duplicate Challan No
    db.query("SELECT grnId FROM GRN WHERE challanNo = ?", [challanNo], (err, challanRows) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (challanRows.length > 0)
        return res.status(400).json({ errors: { challanNo: "Challan Number must be unique" } });

      // Step 3: Validate ALL items before inserting header
      let pendingValidation = itemDetails.length;
      let validationFailed = false;

      itemDetails.forEach(item => {
        const { poitemDetailId, recievedQty } = item;

        const poSql = "SELECT quantity AS poQuantity FROM PurchaseOrderItemDetail WHERE itemDetailId = ?";
        db.query(poSql, [poitemDetailId], (err, poRows) => {
          if (validationFailed) return; // already failed, skip
          if (err) {
            validationFailed = true;
            return res.status(500).json({ message: "DB error", error: err });
          }
          if (!poRows || poRows.length === 0) {
            validationFailed = true;
            return res.status(400).json({ message: `PO item ${poitemDetailId} not found` });
          }

          const poQuantity = poRows[0].poQuantity;

          getPreReceivedQty(poitemDetailId, null, (err, preReceived) => {
            if (validationFailed) return;
            if (err) {
              validationFailed = true;
              return res.status(500).json({ message: "DB error", error: err });
            }

            const currentBalance = poQuantity - preReceived;

            if (recievedQty <= 0) {
              validationFailed = true;
              return res.status(400).json({
                message: `Received quantity must be greater than 0 for item ${poitemDetailId}`,
              });
            }

            if (recievedQty > currentBalance) {
              validationFailed = true;
              return res.status(400).json({
                message: `Received quantity (${recievedQty}) exceeds available balance (${currentBalance}) for item ${poitemDetailId}`,
              });
            }

            // validation ok
            pendingValidation--;
            if (pendingValidation === 0 && !validationFailed) {
              // Step 4: Insert GRN Header (after all validations pass)
              const insertSql = `
                INSERT INTO GRN (grnNo, grnDate, statusNo, supplierLocationNo, poNo, challanNo, challanDate, createdBy, createdDate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              db.query(
                insertSql,
                [grnNo, grnDate, statusNo, supplierLocationNo, poNo, challanNo, challanDate, createdBy, createdDate],
                (err, result) => {
                  if (err) return res.status(500).json({ message: "Insert failed", error: err });

                  const grnId = result.insertId;
                  let pendingInsert = itemDetails.length;

                  itemDetails.forEach(it => {
                    db.query(
                      "INSERT INTO GRNItemDetail (grnId, poitemDetailId, recievedQty) VALUES (?, ?, ?)",
                      [grnId, it.poitemDetailId, it.recievedQty],
                      (err) => {
                        if (err) {
                          return res.status(500).json({ message: "Item insert failed", error: err });
                        }
                        pendingInsert--;
                        if (pendingInsert === 0) {
                          res.json({ message: "GRN created successfully", grnId });
                        }
                      }
                    );
                  });
                }
              );
            }
          });
        });
      });
    });
  });
};



// GET ALL GRNs
exports.getAllGRNs = (req, res) => {
  const sql = `SELECT 
    G.grnId,
    G.grnNo,
    G.grnDate,
    G.statusNo,
    G.poNo,
    G.challanNo,
    G.challanDate,
    G.createdBy,
    G.createdDate,
    G.modifiedBy,
    G.modifiedDate,
    PO.poNo AS purchaseOrderNo,
    BP.bpCode,
    BP.bpName,
    BP.bpAddress
  FROM GRN G
  JOIN PurchaseOrder PO ON G.poNo = PO.poNo
  JOIN BusinessPartner BP ON G.supplierLocationNo = BP.bpId
  ORDER BY G.grnId DESC
`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    res.json(result);
  });
};

// GET GRN BY ID
exports.getGRNById = (req, res) => {
  const grnId = req.params.id;

  const grnSql = `
    SELECT 
      G.*, 
      PO.poNo AS purchaseOrderNo, 
      BP.bpCode, 
      BP.bpName, 
      BP.bpAddress
    FROM GRN G
    JOIN PurchaseOrder PO ON G.poNo = PO.poNo
    JOIN BusinessPartner BP ON G.supplierLocationNo = BP.bpId
    WHERE G.grnId = ?
  `;

  // const itemSql = `
  //   SELECT 
  //     p.itemDetailId AS poitemDetailId,
  //     i.itemName,
  //     p.quantity AS poQuantity,
  //     COALESCE(pod.preRecivedQuantity, 0) AS preRecivedQuantity,
  //     COALESCE(g.recievedQty, 0) AS recievedQty,
  //     CASE WHEN g.poitemDetailId IS NOT NULL THEN 1 ELSE 0 END AS selected
  //   FROM PurchaseOrderItemDetail p
  //   JOIN ItemMaster i ON p.itemId = i.itemId
  //   LEFT JOIN GRNItemDetail g 
  //          ON p.itemDetailId = g.poitemDetailId AND g.grnId = ?
  //   LEFT JOIN (
  //       SELECT poitemDetailId, SUM(recievedQty) AS preRecivedQuantity
  //       FROM GRNItemDetail
  //       WHERE grnId != ?
  //       GROUP BY poitemDetailId
  //   ) pod ON p.itemDetailId = pod.poitemDetailId
  //   WHERE p.poId = (
  //     SELECT poId FROM PurchaseOrder 
  //     WHERE poNo = (SELECT poNo FROM GRN WHERE grnId = ?)
  //   )
  // `;
  const itemSql = `
    SELECT 
      p.itemDetailId AS poitemDetailId,
      i.itemName,
      p.quantity AS poQuantity,
      COALESCE(SUM(gAll.recievedQty), 0) - COALESCE(gThis.recievedQty, 0) AS preRecivedQuantity,
      COALESCE(gThis.recievedQty, 0) AS recievedQty,
      CASE WHEN gThis.poitemDetailId IS NOT NULL THEN 1 ELSE 0 END AS selected
    FROM PurchaseOrderItemDetail p
    JOIN ItemMaster i ON p.itemId = i.itemId
    LEFT JOIN GRNItemDetail gThis 
          ON p.itemDetailId = gThis.poitemDetailId AND gThis.grnId = ?
    LEFT JOIN GRNItemDetail gAll 
          ON p.itemDetailId = gAll.poitemDetailId
    WHERE p.poId = (
      SELECT poId FROM PurchaseOrder 
      WHERE poNo = (SELECT poNo FROM GRN WHERE grnId = ?)
    )
    GROUP BY p.itemDetailId, i.itemName, p.quantity, gThis.recievedQty
  `;



  db.query(grnSql, [grnId], (err, grn) => {
    if (err || grn.length === 0) {
      return res.status(500).json({ message: "Error fetching GRN" });
    }

    db.query(itemSql, [grnId, grnId], (err, items) => {
      if (err) {
        console.error("Item SQL Error:", err);
        return res.status(500).json({ message: "Error fetching items", error: err });
      }

      res.json({ ...grn[0], itemDetails: items });
    });
  });
};


// DELETE GRN
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

// // UPDATE GRN
// exports.updateGRN = async (req, res) => {
//   const grnId = req.params.id;
//   const {
//     grnNo, grnDate, statusNo, supplierLocationNo, poNo,
//     challanNo, challanDate, itemDetails
//   } = req.body;
//   const modifiedBy = req.user.id;
//   const modifiedDate = new Date();

//   // Fetch current GRN
//   db.query("SELECT * FROM GRN WHERE grnId = ?", [grnId], async (err, result) => {
//     if (err || result.length === 0) return res.status(404).json({ message: "GRN not found" });

//     if (result[0].statusNo !== 1)
//       return res.status(400).json({ message: "Only GRNs with status 'Initialised' can be edited" });

//     // Update GRN
//     const updateSql = `
//       UPDATE GRN
//       SET grnNo = ?, grnDate = ?, statusNo = ?, supplierLocationNo = ?, poNo = ?, challanNo = ?, challanDate = ?, modifiedBy = ?, modifiedDate = ?
//       WHERE grnId = ?
//     `;
//     db.query(updateSql, [grnNo, grnDate, statusNo, supplierLocationNo, poNo, challanNo, challanDate, modifiedBy, modifiedDate, grnId], (err) => {
//       if (err) return res.status(500).json({ message: "Update failed", err });

//       // Delete existing item details
//       db.query("DELETE FROM GRNItemDetail WHERE grnId = ?", [grnId], async (err) => {
//         if (err) return res.status(500).json({ message: "Failed to clear old items", err });

//         // Insert updated items
//         for (const item of itemDetails) {
//           const { poitemDetailId, recievedQty } = item;
//           db.query("INSERT INTO GRNItemDetail (grnId, poitemDetailId, recievedQty) VALUES (?, ?, ?)",
//             [grnId, poitemDetailId, recievedQty]);
//         }

//         res.json({ message: "GRN updated" });
//       });
//     });
//   });
// };




// UPDATE GRN
exports.updateGRN = (req, res) => {
  const grnId = req.params.id;
  const {
    grnNo,
    grnDate,
    statusNo,
    supplierLocationNo,
    poNo,
    challanNo,
    challanDate,
    itemDetails,
  } = req.body;

  const modifiedBy = req.user.id;
  const modifiedDate = new Date();

  // Step 1: Check if GRN exists
  db.query("SELECT * FROM GRN WHERE grnId = ?", [grnId], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (result.length === 0) return res.status(404).json({ message: "GRN not found" });

    const currentGRN = result[0];

    if (currentGRN.statusNo !== 1) {
      return res.status(400).json({
        message: "Only GRNs with status 'Initialised' can be edited",
      });
    }

    // Step 2: Check for duplicate GRN No
    db.query(
      "SELECT grnId FROM GRN WHERE grnNo = ? AND grnId != ?",
      [grnNo, grnId],
      (err, grnRows) => {
        if (err) return res.status(500).json({ message: "DB error (GRN No)", err });
        if (grnRows.length > 0)
          return res.status(400).json({ errors: { grnNo: "GRN Number must be unique" } });

        // Step 3: Check for duplicate Challan No
        db.query(
          "SELECT grnId FROM GRN WHERE challanNo = ? AND grnId != ?",
          [challanNo, grnId],
          (err, challanRows) => {
            if (err) return res.status(500).json({ message: "DB error (Challan No)", err });
            if (challanRows.length > 0)
              return res.status(400).json({ errors: { challanNo: "Challan Number must be unique" } });

            // Step 4: Validate ALL items before update
            if (!Array.isArray(itemDetails) || itemDetails.length === 0) {
              return res.status(400).json({ message: "At least one item detail is required" });
            }

            let idx = 0;
            let validationFailed = false;

            function validateNext() {
              if (idx >= itemDetails.length) return proceedUpdate(); // all valid → update

              const { poitemDetailId, recievedQty } = itemDetails[idx];

              db.query(
                "SELECT quantity AS poQuantity FROM PurchaseOrderItemDetail WHERE itemDetailId = ?",
                [poitemDetailId],
                (err, poRows) => {
                  if (validationFailed) return;
                  if (err) {
                    validationFailed = true;
                    return res.status(500).json({ message: "DB error (PO lookup)", err });
                  }
                  if (!poRows || poRows.length === 0) {
                    validationFailed = true;
                    return res.status(400).json({ message: `PO item ${poitemDetailId} not found` });
                  }

                  const poQuantity = poRows[0].poQuantity;

                  getPreReceivedQty(poitemDetailId, grnId, (err, preReceived) => {
                    if (validationFailed) return;
                    if (err) {
                      validationFailed = true;
                      return res.status(500).json({ message: "DB error (PreReceived)", err });
                    }

                    const currentBalance = poQuantity - preReceived;

                    if (recievedQty <= 0) {
                      validationFailed = true;
                      return res.status(400).json({
                        message: `Received quantity must be greater than 0 for item ${poitemDetailId}`,
                      });
                    }

                    if (recievedQty > currentBalance) {
                      validationFailed = true;
                      return res.status(400).json({
                        message: `Received quantity (${recievedQty}) exceeds available balance (${currentBalance}) for item ${poitemDetailId}`,
                      });
                    }

                    idx++;
                    validateNext();
                  });
                }
              );
            }

            // Step 5: Only update after validation
            function proceedUpdate() {
              const updateSql = `
                UPDATE GRN
                SET grnNo = ?, grnDate = ?, statusNo = ?, supplierLocationNo = ?, poNo = ?, challanNo = ?, challanDate = ?, modifiedBy = ?, modifiedDate = ?
                WHERE grnId = ?
              `;
              db.query(
                updateSql,
                [grnNo, grnDate, statusNo, supplierLocationNo, poNo, challanNo, challanDate, modifiedBy, modifiedDate, grnId],
                (err) => {
                  if (err) return res.status(500).json({ message: "Update failed", err });

                  db.query("DELETE FROM GRNItemDetail WHERE grnId = ?", [grnId], (err) => {
                    if (err) return res.status(500).json({ message: "Failed to clear old items", err });

                    let pending = itemDetails.length;
                    if (pending === 0) return res.json({ message: "GRN updated" });

                    for (const item of itemDetails) {
                      const { poitemDetailId, recievedQty } = item;
                      db.query(
                        "INSERT INTO GRNItemDetail (grnId, poitemDetailId, recievedQty) VALUES (?, ?, ?)",
                        [grnId, poitemDetailId, recievedQty],
                        (err) => {
                          if (err) {
                            return res.status(500).json({ message: "Item insert failed", err });
                          }
                          pending--;
                          if (pending === 0) res.json({ message: "GRN updated" });
                        }
                      );
                    }
                  });
                }
              );
            }

            validateNext(); // start validation
          }
        );
      }
    );
  });
};


// exports.updateGRN = async (req, res) => {
//   const grnId = req.params.id;
//   const {
//     grnNo,
//     grnDate,
//     statusNo,
//     supplierLocationNo,
//     poNo,
//     challanNo,
//     challanDate,
//     itemDetails,
//   } = req.body;

//   const modifiedBy = req.user.id;
//   const modifiedDate = new Date();

//   // Step 1: Check if GRN exists
//   db.query("SELECT * FROM GRN WHERE grnId = ?", [grnId], (err, result) => {
//     if (err) return res.status(500).json({ message: "DB error", err });
//     if (result.length === 0)
//       return res.status(404).json({ message: "GRN not found" });

//     const currentGRN = result[0];

//     if (currentGRN.statusNo !== 1) {
//       return res
//         .status(400)
//         .json({ message: "Only GRNs with status 'Initialised' can be edited" });
//     }

//     // Step 2: Check for duplicate GRN No
//     db.query(
//       "SELECT grnId FROM GRN WHERE grnNo = ? AND grnId != ?",
//       [grnNo, grnId],
//       (err, grnRows) => {
//         if (err)
//           return res.status(500).json({ message: "DB error (GRN No)", err });
//         if (grnRows.length > 0)
//           return res
//             .status(400)
//             .json({ errors: { grnNo: "GRN Number must be unique" } });

//         // Step 3: Check for duplicate Challan No
//         db.query(
//           "SELECT grnId FROM GRN WHERE challanNo = ? AND grnId != ?",
//           [challanNo, grnId],
//           (err, challanRows) => {
//             if (err)
//               return res
//                 .status(500)
//                 .json({ message: "DB error (Challan No)", err });
//             if (challanRows.length > 0)
//               return res
//                 .status(400)
//                 .json({ errors: { challanNo: "Challan Number must be unique" } });

//             // Step 4: Proceed with Update
//             const updateSql = `
//               UPDATE GRN
//               SET grnNo = ?, grnDate = ?, statusNo = ?, supplierLocationNo = ?, poNo = ?, challanNo = ?, challanDate = ?, modifiedBy = ?, modifiedDate = ?
//               WHERE grnId = ?
//             `;
//             db.query(
//               updateSql,
//               [
//                 grnNo,
//                 grnDate,
//                 statusNo,
//                 supplierLocationNo,
//                 poNo,
//                 challanNo,
//                 challanDate,
//                 modifiedBy,
//                 modifiedDate,
//                 grnId,
//               ],
//               (err) => {
//                 if (err)
//                   return res
//                     .status(500)
//                     .json({ message: "Update failed", err });

//                 // Delete existing item details
//                 db.query(
//                   "DELETE FROM GRNItemDetail WHERE grnId = ?",
//                   [grnId],
//                   (err) => {
//                     if (err)
//                       return res.status(500).json({
//                         message: "Failed to clear old items",
//                         err,
//                       });

//                     // Insert updated items
//                     let pending = itemDetails.length;
//                     if (pending === 0) return res.json({ message: "GRN updated" });

//                     for (const item of itemDetails) {
//                       const { poitemDetailId, recievedQty } = item;
//                       db.query(
//                         "INSERT INTO GRNItemDetail (grnId, poitemDetailId, recievedQty) VALUES (?, ?, ?)",
//                         [grnId, poitemDetailId, recievedQty],
//                         (err) => {
//                           if (err) {
//                             console.error("DB Error (Insert Item):", err);
//                             return res
//                               .status(500)
//                               .json({ message: "Item insert failed", err });
//                           }

//                           pending--;
//                           if (pending === 0) {
//                             res.json({ message: "GRN updated" });
//                           }
//                         }
//                       );
//                     }
//                   }
//                 );
//               }
//             );
//           }
//         );
//       }
//     );
//   });
// };




// PO item fetch for GRN creation
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
