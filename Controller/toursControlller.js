const fs = require("fs");
const AppError = require("../errorHamdling/appError");
const Tour = require("../Modal/tourModel"); 
const factory = require("factory-handler")
const SelfFactory = require("./factoryHandler")
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../starter/dev-data/data/tours-simple.json`)
);
const catchAsync = require("../UTILS/catchasync");
class APIfeatures {
  constructor(query, queryString) {
    (this.query = query), (this.queryString = queryString);
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excluded = ["sort", "fields", "skip", "page", "limit"];
    excluded.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    console.log(queryStr);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    this.query = this.query.find({}).sort(this.queryString.sort);
    return this;
  }
  limit() {
    if (this.queryString.fields) {
      const field = this.queryString.fields;
      this.query = this.query.select(field);
    }
    return this;
  }
  pagination() {
    const page = +this.queryString.page;
    const limit = +this.queryString.limit;
    const skip = (page - 1) * limit;
    console.log(limit);
    this.query = this.query.find({}).skip(skip).limit(limit);

    // if(this.queryString.page){
    //   const numtours = await Tour.countDocuments();
    //   if(skip > numtours){
    //     throw new Error("This Page is not available")
    //   }
    // }
    return this;
  }
}

const getAllTours = async (req, res) => {
  try {
    const features = new APIfeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limit()
      .pagination();
    const tours = await features.query;
    res.status(200).json({
      status: "success",
      data: tours,
    });
  } catch (error) {
    res.json(error);
  }
};
//creatig an object for class
//try catch method are replaced by catchAync function here

const getToursById = SelfFactory.getOne(Tour,'review')
// const getToursById = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findOne({ _id: req.params.id }).populate('reviews')
//   //for the getAllTours also we have to create so we will make a populate query middleware
//   console.log(tour);
//   if (!tour) {
//     return next(new AppError("No tours availbale for this ID", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     data: tour,
//   });
// });

const createTour = factory.createOne(Tour);
// const createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   console.log(newTour);
//   res.status(200).json({
//     status: "success",
//     result: newTour,
//   });
// });

const updateTour = factory.updateOne(Tour)
// const updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError("No tours availbale for this ID", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     result: tour,
//   });
// });

// using factory handler we can replace the delete function or module as

const deleteTour = factory.deleteOne(Tour);
// const deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError("No tours availbale for this ID", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     result: null,
//   });
// });

//middleware functions
const checkid = (req, res, next, val) => {
  const id = +val;
  if (id > tours.length) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid Tour Id",
    });
  }
  next();
};

const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing Price or Name",
    });
  }
  next();
};

const aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name,price,ratingAverage";
  next();
};

const tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        numRatings: { $sum: "$price" },
        numTours: { $sum: 1 },
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    result: stats,
  });
});

const getTourByMonth = async (req, res, next) => {
  const year = req.params.year * 1;
  console.log(year);
  const byMonth = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    result: byMonth,
  });
};

module.exports = {
  updateTour,
  getAllTours,
  createTour,
  getToursById,
  deleteTour,
  checkid,
  checkBody,
  aliasTopTours,
  tourStats,
  getTourByMonth,
};
