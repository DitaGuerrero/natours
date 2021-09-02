// noinspection JSCheckFunctionSignatures

const express = require('express');
const fs = require('fs');

const app = express();

//This line is for use middleware
app.use(express.json());

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });
//
// app.post('/', (req, res) => {
//   res.json({ message: 'You can post to this endpoint...', app: 'Natours' });
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

<!-- #region  Requests Callbacks -->
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};
const getTour = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1;

  // if (id > tours.length)
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid Id',
  //   });
  const tour = tours.find((el) => el.id === id);
  if (!tour)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
};
const createTour = (req, res) => {
  //Simulate the DB behavior
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
    }
  );
};
const updateTour = (req, res) => {
  const id = req.params.id * 1;

  if (id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Resource not found',
    });

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

  const updatedTour = { ...tours[id], ...req.body };
  tours[id] = updatedTour;

  //******************************************

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: updatedTour,
        },
      });
    }
  );
};
const deleteTour = (req, res) => {
  //Simulate the DB behavior
  const id = req.params.id * 1;

  if (id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  const newTours = tours.filter((el) => el.id !== id);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(newTours),
    () => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};
<!-- #endregion  -->


//Requests
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id/:x?/:y', getTour);
// For create optional variables in the route you could write the question mark like (:x?)
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//Requests using app.route
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
