const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // Using Validator.js library
      // validate: [validator.isAlpha, 'Tour name must contain only letters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    //enum only works for strings
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty may only be easy, medium or difficult',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // Custom validator works only when creating a new doc not when
      // we are updating an existing one
      validate: {
        validator: function (priceDiscount) {
          // True will pass the validation, false will throw an error
          return priceDiscount < this.price;
        },
        message: 'Discount price ({VALUE}) must be smaller than the tour price',
      },
    },
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
      //  min and max works also for dates as validators
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //  GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // First longitude and latitude
      coordinates: [Number],
      address: String,
      description: String,
    },
    //By specifying locations as an array of objects
    //it will automatically create new documents for each one of them
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //For embedded documents
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  // Options to allow the virtual properties to be showed
  // This property doesn't belong to the db, so we can't query for it
  {
    toJSON: {
      virtuals: true,
    },
  }
);

//#region VIRTUAL PROPERTIES
// are properties that derives from properties
// that belongs to the schema, but, you don't want to save in the db
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//#endregion

//#region DOCUMENT MIDDLEWARE: runs before .save() and .create() only
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// If we want to embed users inside tours run this middleware
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => {
//     await User.findById(id);
//   });
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//#endregion

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

//#region QUERY MIDDLEWARE: find()
// Using the regular expression we ensure that every method that starts with find will use this middleware
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  // In query middleware 'this' is a query object
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// tourSchema.post(/^find/, function (docs, next) {
//   console.log('Time', Date.now() - this.start);
//   next();
// });

// To embed a field that use child referencing
// I couldn't make it work in post middleware
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -password',
  });
  next();
});

//#endregion

//#region AGGREGATION MIDDLEWARE:
tourSchema.pre('aggregate', function (next) {
  // 'this' points to the aggregation object
  // console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secretTour: false } });
  next();
});
//#endregion

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
