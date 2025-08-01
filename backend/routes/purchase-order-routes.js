const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth-middleware');
const purchaseOrderController = require('../controllers/purchase-order-controller');

router.get('/', purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', purchaseOrderController.getPurchaseOrderById);
router.get('/authorised/:supplierLocationNo', purchaseOrderController.getAuthorisedPOsBySupplier);
router.post('/',authMiddleware, purchaseOrderController.createPurchaseOrder);
router.put('/:id',authMiddleware, purchaseOrderController.updatePurchaseOrder);
router.delete('/:id', purchaseOrderController.deletePurchaseOrder);

module.exports = router;
