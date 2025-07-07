const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth-middleware');
const itemMasterController = require('../controllers/item-master-controller');

router.get('/items',authMiddleware, itemMasterController.getAllItems);
router.get('/items/:id',authMiddleware, itemMasterController.getItemById);
router.post('/items',authMiddleware, itemMasterController.addItem);
router.put('/items/:id',authMiddleware, itemMasterController.updateItem);
router.delete('/items/:id',authMiddleware, itemMasterController.deleteItem);

module.exports = router;
