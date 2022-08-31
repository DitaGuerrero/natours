const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./util/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
//  The order middleware appears will be the order they apply to routes

//Middleware Stack (These middlewares will apply to every route)

// if (process.env.NODE_ENV === 'development') {
//   console.log(process.env.NODE_ENV);
//   app.use(morgan('dev')); //log to the console the status response
// }
//Parse to object the request and response
app.use(express.json());

// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.static(`${__dirname}/public`));
//These routers are middleware as well, so we can use app.use
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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

module.exports = app;
