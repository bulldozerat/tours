const Tour = require('./../models/tourModel');

exports.getTours = async (req, res) => {
  try {
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    const queryObj = { ...req.query };
    excludedFields.forEach(field => delete queryObj[field]);

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      match => `$${match}`
    );
    const query = Tour.find(JSON.parse(queryStr));
    const tours = await query;

    res.statusCode = 200;
    res.json({
      status: 'sucess',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (e) {
    res.statusCode = 404;
    res.json({
      status: 'fail',
      message: e
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.statusCode = 200;
    res.json({
      status: 'sucess',
      data: {
        tour
      }
    });
  } catch (e) {
    res.statusCode = 404;
    res.json({
      status: 'fail',
      message: e
    });
  }
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
      message: e
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updated = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidatos: true
    });

    res.statusCode = 200;
    res.json({
      status: 'sucess',
      data: updated
    });
  } catch (e) {
    res.statusCode = 400;
    res.json({
      status: 'fail',
      message: e
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findOneAndDelete(req.params.id);

    res.statusCode = 204;
    res.json({
      status: 'sucess',
      data: null
    });
  } catch (e) {
    res.statusCode = 400;
    res.json({
      status: 'fail',
      message: e
    });
  }
};
