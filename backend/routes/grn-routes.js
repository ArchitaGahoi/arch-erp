const express = require('express');
const router = express.Router();
const grnController = require('../controllers/grn-controller');
const { authMiddleware } = require('../middleware/auth-middleware');

router.get('/', grnController.getAllGRNs);
router.get('/:id', grnController.getGRNById);

router.post('/', authMiddleware, grnController.createGRN);
router.put('/:id', authMiddleware, grnController.updateGRN);
router.delete('/:id', authMiddleware, grnController.deleteGRN);
router.get('/items/:poNo', grnController.getPOItemsForGRN); // to auto-fill item table

module.exports = router;
