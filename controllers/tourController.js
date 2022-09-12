const Tour = require('../models/tourModel');
const APIFeatures = require('../util/APIFeatures');
const catchAsync = require('../util/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

// Tour Route Handlers

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avfPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year;

  const plan = await Tour.aggregate([
    {
      // This stage will unwind an array into different documents
      $unwind: '$startDates',
    },
    {
      // Select the fields you want to show, in this case
      // only the fields that has a date in the year we
      // specified in the req
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        // Group by the month in the date using the operator
        // $month that extracts the month from the field $startDates
        _id: { $month: '$startDates' },

        // Create a new field called numToursStarts and for each one that
        // matches sum 1
        numToursStarts: { $sum: 1 },

        // Push into tours the name of the document that match
        tours: {
          $push: '$name',
        },
      },
    },
    {
      // Add field month with the info of field _id
      $addFields: {
        month: '$_id',
      },
    },
    {
      // Delete the field _id
      $project: {
        _id: 0,
      },
    },
    {
      // Sort the results descendingly by the numToursStarts
      // and ascendingly by the month
      $sort: { numToursStarts: -1, month: 1 },
    },
    { limit: 12 },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getAllTours = getAll(Tour);
exports.getTour = getOne(Tour, { path: 'reviews' });
exports.createTour = createOne(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);
