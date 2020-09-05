const Tour = require('./../models/tourModel');

exports.getTours = (req, res) => {
  res.statusCode = 200;
  res.json({
    status: 'sucess'
    // results: tours.length,
    // data: {
    //   tours
    // }
  });
};

exports.getTour = (req, res) => {
  // const tour = tours.find(el => el.id === Number(req.params.id));
  // res.statusCode = 200;
  // res.json({
  //   status: 'sucess',
  //   data: {
  //     tour
  //   }
  // });
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.statusCode = 201;
    res.json({
      status: 'suceess',
      data: {
        tour: newTour
      }
    });
  } catch (e) {
    res.statusCode = 400;
    res.json({
      status: 'fail',
      message: 'Invalid data send'
    });
  }
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
