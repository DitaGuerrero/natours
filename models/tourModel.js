const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    difficulty: String,
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: { type: Number, default: 4.5 },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //Permanently hide this field
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  // Options to allow the virtual properties to be showed
  // This property doesn't belong to the db, so we can't query for it
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// Virtual properties are properties that derives from properties
// that belongs to the schema, but, you don't want to save in the db
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() only
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Pre-save-hook o pre-save-middleware
// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });
//
// //Post-save-hook
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: find()
// Using the regular expression we ensure that every method that starts with find
// will use this middleware
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  // In query middleware 'this' is a query object
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log('Time', Date.now() - this.start);
  next();
});

// AGGREGATION MIDDLEWARE:
tourSchema.pre('aggregate', function (next) {
  // 'this' points to the aggregation object
  // console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secretTour: false } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
