const express = require('express');
const router = express.Router();
const tourController = require(`${__dirname}/../controllers/tourController`);

//Routes
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
