const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./util/AppError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

//#region Middleware Stack (Global)
// (These middlewares will apply to every route)

//  The order middleware appears will be the order they apply to routes

//Set security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  console.log(process.env.NODE_ENV);
  app.use(morgan('dev')); //log to the console the status response
}

//Parse to object the request and response
app.use(
  express.json({
    limit: '10kb', //Limit body size
  })
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against js injection
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'maxGroupSize',
      'price',
    ],
  })
);

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// Rate limiting (Against brute force attacks)
const limiter = rateLimit({
  //100 request in 1h by IP
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in 1h',
});
app.use('/api', limiter);

//Serving static files
app.use(express.static(`${__dirname}/public`));

//These routers are middleware as well, so we can use app.use
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Route for unhandled routes
app.all('*', (req, res, next) => {
  // First Approach
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  //
  // // The only arg that next func receives is an error
  // // So it will escape any other middleware and will bo straight
  // // to the global error handling middleware
  // next(err);

  //  Using AppError
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});

// Error handling Built-in
app.use(globalErrorHandler);

//endregion
module.exports = app;
