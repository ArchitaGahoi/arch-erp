// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/user-controller');
//const { authMiddleware, isAdmin } = require('../middleware/auth-middleware');

// // User registration (admin only)
// router.post('/register', authMiddleware, isAdmin, userController.registerUser);

// // User login (no auth needed)
// router.post('/login', authMiddleware,  userController.loginUser);

// // Get all users (admin only)
// router.get('/', authMiddleware, isAdmin, userController.getAllUsers);

// // Get user by ID (authenticated)
// router.get('/:id', authMiddleware, userController.getUserById);

// // Update user (authenticated)
// router.put('/:id', authMiddleware, userController.updateUser);

// // Delete user (admin only)
// router.delete('/:id', authMiddleware, isAdmin, userController.deleteUser);

// module.exports = router;