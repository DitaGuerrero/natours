// Tour Route Handlers

//DB Simulation
const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};
exports.getTour = (req, res) => {
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

exports.createTour = (req, res) => {
  //Simulate the DB behavior
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
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
exports.updateTour = (req, res) => {
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
    `${__dirname}/../dev-data/data/tours-simple.json`,
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
exports.deleteTour = (req, res) => {
  //Simulate the DB behavior
  const id = req.params.id * 1;

  if (id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  const newTours = tours.filter((el) => el.id !== id);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(newTours),
    () => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};
