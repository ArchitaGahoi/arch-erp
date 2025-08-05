const express = require('express');
const router = express.Router();
const userMasterController = require('../controllers/user-master-controller');
const { changePassword } = require("../controllers/user-master-controller");
const { authMiddleware, isAdmin } = require('../middleware/auth-middleware');


router.get('/users', userMasterController.getAllUsers);
router.get('/users/:id', userMasterController.getUserById);
router.post('/users', authMiddleware,userMasterController.addUser);
router.put('/users/:id',authMiddleware, userMasterController.updateUser);
router.delete('/users/:id', userMasterController.deleteUser);
//User login (no auth needed)
router.post('/login',  userMasterController.loginUser);

// Get all users (admin only)
router.get('/', authMiddleware, isAdmin, userMasterController.getAllUsers);

// Get user by ID (authenticated)
router.get('/:id', authMiddleware, userMasterController.getUserById);

// Update user (authenticated)
router.put('/:id', authMiddleware, userMasterController.updateUser);

// Delete user (admin only)
router.delete('/:id', authMiddleware, isAdmin, userMasterController.deleteUser);

router.post('/forget-password', userMasterController.forgetPassword);
router.post('/reset-password', userMasterController.resetPassword);
router.post('/change-password', authMiddleware, userMasterController.changePassword);
router.post('/verify-otp', userMasterController.verifyOtp);

module.exports = router;
