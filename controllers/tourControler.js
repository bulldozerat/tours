const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkId = (req, res, next, val) => {
  const tour = tours.find(el => el.id === Number(val));
  if (!tour) {
    res.statusCode = 404;
    res.json({
      status: 'fail',
      message: 'Invlaid ID'
    });
  }
  next();
};

exports.getTours = (req, res) => {
  res.statusCode = 200;
  res.json({
    status: 'sucess',
    results: tours.length,
    data: {
      tours
    }
  });
};

exports.getTour = (req, res) => {
  const tour = tours.find(el => el.id === Number(req.params.id));

  res.statusCode = 200;
  res.json({
    status: 'sucess',
    data: {
      tour
    }
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      if (err) console.log(err);
      res.statusCode = 201;
      res.json({
        status: 'suceess',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.statusCode = 200;
  res.json({
    status: 'sucess',
    data: 'resource updated'
  });
};

exports.deleteTour = (req, res) => {
  res.statusCode = 204;
  res.json({
    status: 'sucess',
    data: null
  });
};
