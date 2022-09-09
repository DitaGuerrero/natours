const catchAsync = require('../util/catchAsync');
const Review = require('../models/reviewModel');
const APIFeatures = require('../util/APIFeatures');

const sendReviews = (reviews, statusCode, res) => {
  res.status(statusCode).json({
    status: 'success',
    reviewsCount: reviews.length,
    data: {
      reviews,
    },
  });
};

exports.getAllReviews = catchAsync(async (req, res, _next) => {
  // Created instance of APIFeature class, and concat the features we want to include
  if (req.params.tourId) {
    req.query.tour = req.params.tourId;
  }
  const feature = new APIFeatures(Review.find(), req.query).filter().paginate();
  // Execute the query wish is inside the property query of the instance we create in the previous step
  const reviews = await feature.query;
  sendReviews(reviews, 200, res);
});

exports.createReview = catchAsync(async (req, res, _next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);
  sendReviews(newReview, 201, res);
});
