const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAvarage,price';
  req.query.fields = 'name,price,ratingsAvarage,summary, difficulty';

  next();
};

exports.getTours = async (req, res, next) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

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

exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return next(new AppError('No tour found with that id', 404));
    }

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

exports.createTour = async (req, res, next) => {
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

exports.updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidatos: true
    });

    if (!tour) {
      return next(new AppError('No tour found with that id', 404));
    }

    res.statusCode = 200;
    res.json({
      status: 'sucess',
      data: tour
    });
  } catch (e) {
    res.statusCode = 400;
    res.json({
      status: 'fail',
      message: e
    });
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findOneAndDelete(req.params.id);

    if (!tour) {
      return next(new AppError('No tour found with that id', 404));
    }

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

exports.getTourStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 }, // each time it passes adds one to numTours
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
      // {
      //   $match: { _id: { $ne: 'easy' } }
      // }
    ]);

    res.statusCode = 200;
    res.json({
      status: 'sucess',
      data: stats
    });
  } catch (e) {
    res.statusCode = 404;
    res.json({
      status: 'fail',
      message: e
    });
  }
};
