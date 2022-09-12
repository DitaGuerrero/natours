const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setUserIds,
    reviewController.createReview
  )
  .get(authController.protect, reviewController.getAllReviews);

router
  .route('/:id')
  .get(authController.protect, reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.deleteReview
  );

module.exports = router;
