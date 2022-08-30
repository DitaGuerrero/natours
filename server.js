const mongoose = require('mongoose');
const dotenv = require('dotenv');
//Loading environmental variables
dotenv.config({ path: './config.env' });
const app = require('./app.js');

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('name', err.name, 'message', err.message);
  process.exit(1);
});

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Unhandled rejected promises
process.on('unhandledRejection', (err) => {
  console.log('name', err.name, 'message', err.message);
  //   Shut down application
  //   Code 0 Success
  //   Code 1 There was a problem
  server.close(() => {
    process.exit(1);
  });
});
