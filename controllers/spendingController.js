const Spending = require("../models/spendingModel");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.getAllSpendings = catchAsync(async (req, res, next) => {
  const userID = req.params.userID;

  const features = new APIFeatures(Spending.find({ userID }), req.query)
    .filter()
    .sort()
    .limitFields();

  const spendings = await features.query;

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    results: spendings.length,
    spendings,
  });
});

exports.createSpending = catchAsync(async (req, res, next) => {
  const userID = req.params.userID;
  const newSpending = await Spending.create({ ...req.body, userID });

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    spending: newSpending,
  });
});

exports.updateSpending = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const spending = await Spending.findByIdAndUpdate(id, res.body);

  if (!spending) return next(new AppError("No spending found that id", 404));

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    spending,
  });
});

exports.deleteSpending = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const spending = await Spending.findByIdAndDelete(id, res.body);

  if (!spending) return next(new AppError("No spending found that id", 404));

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    spending: null,
  });
});

exports.getStatistic = catchAsync(async (req, res, next) => {
  const today = new Date();

  const userID = req.params.userID;
  const month = req.query.month ?? today.getMonth() + 1;
  const year = req.query.year ?? today.getFullYear();

  const result = await Spending.aggregate([
    {
      $match: {
        userID,

        $expr: {
          $and: [
            { $gt: ["$month", month * 1 - 4] },
            { $lte: ["$month", month * 1] },
          ],
        },

        year: year * 1,
      },
    },
  ]);

  if (!result) return next(new AppError("Statistic fail!", 404));

  res.status(200).json({
    status: "success",
    result: result.length,
    data: result,
  });
});
