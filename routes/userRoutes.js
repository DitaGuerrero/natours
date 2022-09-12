const express = require('express');
const router = express.Router();
const userController = require(`${__dirname}/../controllers/userController`);
const authController = require('../controllers/authController');

// Auth Routes

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.logIn);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);
router
  .route('/update-password')
  .patch(authController.protect, authController.updatePassword);
router
  .route('/update-me')
  .patch(authController.protect, userController.updateMe);
router
  .route('/delete-me')
  .delete(authController.protect, userController.deleteMe);

//Users Routes

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;
