const Expense = require('../models/expenseModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.getAllExpenses = catchAsync(async (req, res) => {
  const userID = req.params.userID;
  const features = new APIFeatures(Expense.find({userID}), req.query)
    .filter()
    .sort()
    .limitFields();
  const expenses = await features.query;

  res.status(200).json({
    status: 'success',
    result: expenses.length,
    requestTime: req.requestTime,
    data: {expense: expenses},
  });
});

exports.getExpense = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const expense = await Expense.findById(id);
  if (!expense) return next(new AppError('No expense found that ID', 404));

  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: {expense},
  });
});

exports.createExpense = catchAsync(async (req, res) => {
  const userID = req.params.userID;

  const newExpense = await Expense.create({userID, ...req.body});

  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: {expense: newExpense},
  });
});

exports.updateExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!expense) return next(new AppError('No expense found that ID', 404));

  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: {
      expense,
    },
  });
});

exports.deleteExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return next(new AppError('No expense found that ID', 404));

  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: null,
  });
});
