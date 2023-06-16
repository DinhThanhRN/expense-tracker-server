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
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const num = req.query.num ?? 4;
  delete req.query["num"];

  const userID = req.params.userID;

  const queryObj =
    month + 1 - num > 0
      ? {
          userID,
          $expr: {
            $and: [
              { $lte: ["$month", month] },
              { $gt: ["$month", month - num] },
              { $eq: ["$year", year] },
            ],
          },
        }
      : {
          userID,
          $expr: {
            $or: [
              {
                $and: [{ $lte: ["$month", month] }, { $eq: ["$year", year] }],
              },
              {
                $and: [
                  { $gt: ["$month", 12 - num + month] },
                  { $eq: ["$year", year - 1] },
                ],
              },
            ],
          },
        };

  const features = new APIFeatures(
    Spending.find(queryObj).select("-__v"),
    req.query
  )
    .sort()
    .filter()
    .limitFields();
  const spendings = await features.query;

  if (!spendings) return next(new AppError("Statistic fail!", 404));

  res.status(200).json({
    status: "success",
    result: spendings.length,
    spendings,
  });
});
