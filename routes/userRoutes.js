const express = require('express');
const router = express.Router();
const userController = require(`${__dirname}/../controllers/userController`);
const authController = require('../controllers/authController');

// Auth Routes

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.logIn);

//Users Routes

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
