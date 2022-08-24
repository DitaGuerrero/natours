const Tour = require('../models/tourModel');
const APIFeatures = require('../util/APIFeatures');
const catchAsync = require('../util/catchAsync');

// Tour Route Handlers

// //******** DB Simulation ****************
// const fs = require('fs');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
// //*************************************
//
// exports.checkID = (req, res, next) => {
//   const id = req.params.id * 1;
//
//   if (id >= tours.length)
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Resource not found',
//     });
//   next();
// };
//
// //Status 400 is for Bad Request
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price)
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Fields name and price are required',
//     });
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  // try {

  // Build the query
  // 1) Filtering
  // let queryObj = { ...req.query };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach((el) => delete queryObj[el]);

  // 2) Advanced
  // { duration: { gte: '5' }, difficulty: 'easy' }
  // In this query object is missing the $ sign for the gte operator
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // queryObj = JSON.parse(queryStr);
  // let query = Tour.find(queryObj);

  // 3) Sorting
  // if (req.query.sort) {
  //   const sortStr = req.query.sort.replace(',', ' ');
  //   query = query.sort(sortStr);
  // } else {
  //   //Default sorting
  //   query = query.sort('-createdAt');
  // }

  // 4) Field limiting (Ask only the fields you are interest in)
  // if (req.query.fields) {
  //   const fieldStr = req.query.fields.replaceAll(',', ' ');
  //   query = query.select(fieldStr);
  // } else {
  //   query = query.select('-__v');
  // }

  // 5) Pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 3;
  // const skip = (page - 1) * limit;
  //
  // // Use limit and after skip, otherwise it won't work
  // query = query.limit(limit).skip(skip);
  //
  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) throw new Error("This page doesn't exist");
  // }

  // Execute the query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // Send the response
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
  // } catch (e) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: e,
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res) => {
  // Solution 1. Using try and catch
  // try {
  //   // Tour.findOne({_id: req.params.id})
  //   // const tour = await Tour.findById(req.params.id);
  //   const feature = new APIFeatures(
  //     Tour.findById(req.params.id),
  //     req.query
  //   ).limitFields();
  //   const tour = await feature.query;
  //   res.status(200).json({
  //     status: 'success',
  //     requestedAt: req.requestTime,
  //     data: {
  //       tour,
  //     },
  //   });
  // } catch (e) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'Tour not found',
  //   });
  // }
  // // const tour = tours.find((el) => el.id === id);
  // // if (!tour)
  // //   return res.status(404).json({
  // //     status: 'fail',
  // //     message: 'Invalid Id',
  // //   });
  // //
  // // res.status(200).json({
  // //   status: 'success',
  // //   data: {
  // //     tour: tour,
  // //   },
  // // });

  // Solution 2. Using catchAsync
  const feature = new APIFeatures(
    Tour.findById(req.params.id),
    req.query
  ).limitFields();
  const tour = await feature.query;
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  //Simulate the DB behavior
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);
  //
  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   () => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tours: newTour,
  //       },
  //     });
  //   }
  // );
  // try {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
  // } catch (e) {
  //   //Bad request(400)
  //   res.status(400).json({
  //     status: 'fail',
  //     message: e,
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res) => {
  //******  Simulating the DataBase **********

  //Solution 1 using Object.keys
  // Object.keys(req.body).forEach((keyToUpdate) => {
  //   console.log(keyToUpdate);
  //   Object.keys(tours[id]).forEach((key) => {
  //     if (key === keyToUpdate) {
  //       tours[id][key] = req.body[keyToUpdate];
  //       console.log(tours[id][key]);
  //     }
  //   });
  // });

  //Solution 2 using for-in
  // for (const keyToUpdate in req.body) {
  //   console.log(keyToUpdate, req.body[keyToUpdate]);
  //   for (const key in tours[id]) {
  //     console.log(key);
  //     if (key !== keyToUpdate) return;
  //     tours[id][key] = req.body[keyToUpdate];
  //   }
  // }
  // const updatedTour = tours.find((el) => el.id === id);

  //Solution 3 using the spread operator
  //
  // const updatedTour = { ...tours[id], ...req.body };
  // tours[id] = updatedTour;
  //
  // //******************************************
  //
  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   () => {
  //     res.status(200).json({
  //       status: 'success',
  //       data: {
  //         tour: updatedTour,
  //       },
  //     });
  //   }
  // );

  // try {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
  // } catch (e) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: e,
  //   });
  // }
});

exports.deleteTour = catchAsync(async (req, res) => {
  //Simulate the DB behavior
  // const newTours = tours.filter((el) => el.id !== id);
  //
  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(newTours),
  //   () => {
  //     res.status(204).json({
  //       status: 'success',
  //       data: null,
  //     });
  //   }
  // );
  //
  // try {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
  // } catch (e) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'Tour not found',
  //   });
  // }
});

exports.getTourStats = catchAsync(async (req, res) => {
  // try {
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
    // {
    //   $match: {
    //     _id: {
    //       $ne: 'easy',
    //     },
    //   },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  // } catch (e) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: e,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  // try {
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
  // } catch (e) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: e,
  //   });
  // }
});
