const mongoose = require("mongoose");

const Spending = require("./spendingModel");
const AppError = require("../utils/AppError");

const expenseScheme = new mongoose.Schema({
  userID: {
    type: String,
    select: false,
  },
  paidFor: {
    type: String,
    required: [true, "An expense must have the purpose of paying"],
  },
  price: {
    type: Number,
    required: [true, "Must have price"],
  },
  category: {
    type: String,
    required: [true, "An expense must have category"],
  },
  paidAt: {
    type: Date,
    default: Date.now(),
  },
});

expenseScheme.post("save", async function (next) {
  const spending = await mongoose.model("Spending").findOne({
    month: this.paidAt.getMonth() + 1,
    year: this.paidAt.getFullYear(),
    userID: this.userID,
  });

  if (!spending) {
    await Spending.create({
      userID: this.userID,
      expense: this.price,
      month: this.paidAt.getMonth() + 1,
      year: this.paidAt.getFullYear(),
    });
  }
});

const Expense = mongoose.model("Expense", expenseScheme);

module.exports = Expense;
