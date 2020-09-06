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
    let query = Tour.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-v');
    }

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exists');
    }

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
