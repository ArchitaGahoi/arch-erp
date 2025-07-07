const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth-middleware');
const businessPartnerController = require('../controllers/business-partner-controller');

router.get('/partner', authMiddleware, businessPartnerController.getAllPartners);
router.get('/partner/:id', authMiddleware, businessPartnerController.getPartnerById);
router.post('/partner', authMiddleware, businessPartnerController.addPartner);
router.put('/partner/:id', authMiddleware, businessPartnerController.updatePartner);
router.delete('/partner/:id', authMiddleware, businessPartnerController.deletePartner);

module.exports = router;

