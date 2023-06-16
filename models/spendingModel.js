const mongoose = require("mongoose");

const spendingSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: [true, "A spending must belong to a user."],
  },
  income: {
    type: Number,
    default: 0,
  },
  expense: {
    type: Number,
    default: 0,
  },
  month: {
    type: Number,
    default: new Date().getMonth() + 1,
    min: [1, "A month must be at least 1"],
    max: [12, "A month must be less or equal 12"],
    validate: {
      validator: async function (value) {
        return await mongoose.models.Spending.countDocuments({
          _id: { $ne: this._id },
          userID: this.userID,
          month: value,
          year: this.year,
        }).then((count) => !count);
      },
      message: (props) => `${props.value} is already taken for this year!`,
    },
  },
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
});

// Use a pre hook to calculate the saving before saving the document
spendingSchema.pre("save", async function (next) {
  const expenses = await mongoose.model("Expense").find({
    paidAt: {
      $gte: new Date(this.year, this.month - 1, 1), // First day of the month
      $lte: new Date(this.year, this.month, 1), // First day of the next month
    },
    userID: this.userID,
  });
  if (expenses) {
    const total = expenses.reduce((sum, expense) => sum + expense.price, 0);
    this.expense = total;
  }
});

spendingSchema.virtual("saving").get(function () {
  return this.income - this.expense;
});

const Spending = mongoose.model("Spending", spendingSchema);

module.exports = Spending;
