const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');
const APIFeatures = require('../util/APIFeatures');
const Tour = require('../models/tourModel');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const deletedDoc = await Model.findByIdAndDelete(req.params.id);

    if (!deletedDoc) {
      next(new AppError('No tour found with that ID', 404));
      return;
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) {
      next(new AppError('Resource with that id not found', 404));
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        updatedDoc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const feature = new APIFeatures(
      Model.findById(req.params.id),
      req.query
    ).limitFields();
    let finalQuery = feature.query;
    if (popOptions) finalQuery = finalQuery.populate(popOptions);
    const doc = await finalQuery;

    if (!doc) {
      next(new AppError('No document found with that ID', 404));
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    // For reviews urls
    if (req.params.tourId) {
      req.query.tour = req.params.tourId;
    }
    // Execute the query
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;

    // Send the response
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
