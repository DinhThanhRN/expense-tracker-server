const Expense = require("../models/expenseModel");
const Spending = require("../models/spendingModel");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.getAllExpenses = catchAsync(async (req, res) => {
  const userID = req.params.userID;
  const month = req.query.month ?? new Date().getMonth() + 1;
  delete req.query.month;
  const year = req.query.year ?? new Date().getFullYear();
  delete req.query.year;

  const features = new APIFeatures(
    Expense.find({
      userID,
      $expr: {
        $and: [
          { $eq: [{ $month: "$paidAt" }, month * 1] },
          { $eq: [{ $year: "$paidAt" }, year * 1] },
        ],
      },
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields();
  const expenses = await features.query;

  res.status(200).json({
    status: "success",
    result: expenses.length,
    requestTime: req.requestTime,
    data: { expense: expenses },
  });
});

exports.getExpense = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const expense = await Expense.findById(id);
  if (!expense) return next(new AppError("No expense found that ID", 404));

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: { expense },
  });
});

exports.createExpense = catchAsync(async (req, res) => {
  const userID = req.params.userID;

  const newExpense = await Expense.create({ userID, ...req.body });

  const spending = await Spending.findOne({
    userID,
    month: newExpense.paidAt.getMonth() + 1,
    year: newExpense.paidAt.getFullYear(),
  });
  await spending.save();

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: { expense: newExpense },
  });
});

exports.updateExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  }).select("+userID");
  if (!expense) return next(new AppError("No expense found that ID", 404));

  const spending = await Spending.findOne({
    userID: expense.userID,
    month: expense.paidAt.getMonth() + 1,
    year: expense.paidAt.getFullYear(),
  }).select("+userID");
  await spending.save();

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: {
      expense,
    },
  });
});

exports.deleteExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return next(new AppError("No expense found that ID", 404));

  const spending = await Spending.findOne({
    userID: expense.userID,
    month: expense.paidAt.getMonth() + 1,
    year: expense.paidAt.getFullYear(),
  }).select("+userID");
  await spending.save();

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: null,
  });
});

exports.stastiticExpenses = catchAsync(async (req, res, next) => {
  const userID = req.params.userID;
  const month = req.query.month ?? new Date().getMonth() + 1;
  const year = req.query.year ?? new Date().getFullYear();

  const expenses = await Expense.find({
    userID,
    $expr: {
      $and: [
        { $eq: [{ $month: "$paidAt" }, month * 1] },
        { $eq: [{ $year: "$paidAt" }, year * 1] },
      ],
    },
  });
  if (!expenses) return next(new AppError("No expenses in server!", 404));

  // Accumalate spending of all expenses that have the same category
  const result = [];
  expenses.forEach((expense) => {
    const index = result.findIndex(
      (item) => item.category === expense.category
    );
    if (index === -1)
      result.push({ category: expense.category, spending: expense.price });
    else {
      result[index].spending += expense.price;
    }
  });
  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    result,
  });
});
