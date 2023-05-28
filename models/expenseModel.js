const mongoose = require("mongoose");

const Spending = require("./spendingModel");

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

// expenseScheme.pre("save", async function (next) {
//   const spending = await mongoose.model("Spending").findOne({
//     month: this.paidAt.getMonth() + 1,
//     year: this.paidAt.getFullYear(),
//     userID: this.userID,
//   });
//   console.log(spending);
//   if (spending) {
//     spending.expense += this.price;
//     await spending.save();
//   }
//   next();
// });

const Expense = mongoose.model("Expense", expenseScheme);

module.exports = Expense;
